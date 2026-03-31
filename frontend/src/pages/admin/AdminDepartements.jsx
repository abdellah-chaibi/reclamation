import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { departementService, userService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { getCurrentLanguage, getLocalizedText, translateDepartmentName } from '../../utils/localization';
import {
  Building2, Plus, Edit2, Trash2, X,
  CheckCircle, AlertCircle, User, Briefcase, RefreshCw,
} from 'lucide-react';

export default function AdminDepartements() {
  const { i18n } = useTranslation();
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', user_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const language = getCurrentLanguage(i18n.language);

  const text = {
    page: getLocalizedText({ ar: 'ØµÙØ­Ø©', fr: 'Page' }, language),
    of: getLocalizedText({ ar: 'Ù…Ù†', fr: 'sur' }, language),
    results: getLocalizedText({ ar: 'Ù†ØªØ§Ø¦Ø¬', fr: 'resultats' }, language),
    previous: getLocalizedText({ ar: 'Ø§Ù„Ø³Ø§Ø¨Ù‚', fr: 'Precedent' }, language),
    next: getLocalizedText({ ar: 'Ø§Ù„ØªØ§Ù„ÙŠ', fr: 'Suivant' }, language),
    loadError: getLocalizedText({ ar: 'تعذر تحميل الأقسام.', fr: 'Impossible de charger les departements.' }, language),
    required: getLocalizedText({ ar: 'اسم القسم مطلوب.', fr: 'Le nom du departement est requis.' }, language),
    updateSuccess: getLocalizedText({ ar: 'تم تحديث القسم.', fr: 'Departement mis a jour.' }, language),
    createSuccess: getLocalizedText({ ar: 'تمت إضافة القسم.', fr: 'Departement ajoute.' }, language),
    actionFailed: getLocalizedText({ ar: 'فشلت العملية.', fr: "L'operation a echoue." }, language),
    confirmDelete: getLocalizedText({ ar: 'واش بغيتي تحذف هاد القسم؟', fr: 'Voulez-vous supprimer ce departement ?' }, language),
    deleteSuccess: getLocalizedText({ ar: 'تم حذف القسم.', fr: 'Departement supprime.' }, language),
    deleteError: getLocalizedText({ ar: 'ما قدرناش نحذفو حيث كاينة معطيات مرتبطة به.', fr: 'Suppression impossible car des donnees y sont liees.' }, language),
    title: getLocalizedText({ ar: 'الأقسام', fr: 'Departements' }, language),
    subtitle: getLocalizedText({ ar: 'البنية التنظيمية ديال الجماعة.', fr: 'Structure organisationnelle de la commune.' }, language),
    new: getLocalizedText({ ar: 'جديد', fr: 'Nouveau' }, language),
    department: getLocalizedText({ ar: 'القسم', fr: 'Departement' }, language),
    chief: getLocalizedText({ ar: 'رئيس المصلحة', fr: 'Chef de service' }, language),
    actions: getLocalizedText({ ar: 'الإجراءات', fr: 'Actions' }, language),
    empty: getLocalizedText({ ar: 'ما كاين حتى قسم.', fr: 'Aucun departement.' }, language),
    unassigned: getLocalizedText({ ar: 'غير معين', fr: 'Non assigne' }, language),
    edit: getLocalizedText({ ar: 'تعديل', fr: 'Modifier' }, language),
    newDepartment: getLocalizedText({ ar: 'قسم جديد', fr: 'Nouveau departement' }, language),
    departmentName: getLocalizedText({ ar: 'اسم القسم', fr: 'Nom du departement' }, language),
    placeholder: getLocalizedText({ ar: 'مثال: الموارد البشرية', fr: 'Ex : Ressources humaines' }, language),
    noAssign: getLocalizedText({ ar: '— بدون تعيين —', fr: '— Aucun —' }, language),
    create: getLocalizedText({ ar: 'إنشاء', fr: 'Creer' }, language),
    update: getLocalizedText({ ar: 'تحديث', fr: 'Mettre a jour' }, language),
    cancel: getLocalizedText({ ar: 'إلغاء', fr: 'Annuler' }, language),
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dRes, uRes] = await Promise.all([departementService.getAll(), userService.getAll()]);
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
      const u = uRes.data?.data || uRes.data || [];
      setUsers(Array.isArray(u) ? u.filter((x) => x.role === 'chef_dep') : []);
    } catch {
      setError(text.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(''); setError(''); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const totalPages = Math.ceil(depts.length / itemsPerPage);
  const currentItems = depts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', user_id: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditItem(d);
    setForm({ name: d.name, user_id: d.user_id || '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError(text.required);
      return;
    }
    setSubmitting(true);
    try {
      if (editItem) {
        await departementService.update(editItem.id, form);
        setSuccess(text.updateSuccess);
      } else {
        await departementService.create(form);
        setSuccess(text.createSuccess);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || text.actionFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(text.confirmDelete)) return;
    try {
      await departementService.delete(id);
      setSuccess(text.deleteSuccess);
      fetchAll();
    } catch {
      setError(text.deleteError);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600" size={28} />
            {text.title}
          </h2>
          <p className="text-slate-500 text-sm font-medium">{text.subtitle}</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-sm">
          <Plus size={18} /> <span>{text.new}</span>
        </button>
      </div>

      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {error && <div className="p-4 bg-white border-l-4 border-red-500 shadow-2xl rounded-lg flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-right-full pointer-events-auto"><AlertCircle size={18} /> {error}</div>}
        {success && <div className="p-4 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-lg flex items-center gap-3 text-emerald-700 font-bold animate-in slide-in-from-right-full pointer-events-auto"><CheckCircle size={18} /> {success}</div>}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.department}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.chief}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{text.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {depts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      {text.empty}
                    </td>
                  </tr>
                ) : currentItems.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">#{d.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Briefcase size={16} />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{translateDepartmentName(d.name, language)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const assignedChef = users.find((u) => String(u.id) === String(d.user_id));
                          if (assignedChef) {
                            return (
                              <>
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                                  {assignedChef.name?.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-slate-600">{assignedChef.name}</span>
                              </>
                            );
                          }
                          if (d.chef) {
                            return (
                              <>
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                                  {d.chef.name?.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-slate-600">{d.chef.name}</span>
                              </>
                            );
                          }
                          return <span className="text-xs text-slate-300 font-medium italic">{text.unassigned}</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(d)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={depts.length}
            onPageChange={setCurrentPage}
            labels={{
              page: 'Page',
              of: 'sur',
              results: 'resultats',
              previous: 'Precedent',
              next: 'Suivant',
            }}
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900">{editItem ? text.edit : text.newDepartment}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.departmentName}</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-300" size={16} />
                  <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium" placeholder={text.placeholder} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.chief}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-300" size={16} />
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold appearance-none" value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}>
                    <option value="">{text.noAssign}</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  {editItem ? text.update : text.create}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm">
                  {text.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
