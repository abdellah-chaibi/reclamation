import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCurrentLanguage, getLocalizedText, translateDepartmentName } from '../../utils/localization';
import {
  UserPlus, Search, Edit2, Trash2,
  X, CheckCircle, AlertCircle,
  Users, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';

const normalizeRole = (role) => {
  if (role === 'user' || role === 'citizen') return 'citoyen';
  return role;
};

const emptyForm = { name: '', email: '', password: '', departement_id: '', role: 'citoyen', cin: '' };

export default function AdminUsers() {
  const { i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const language = getCurrentLanguage(i18n.language);

  const text = {
    roleLabel: {
      admin: getLocalizedText({ ar: 'مدير', fr: 'Admin' }, language),
      chef_dep: getLocalizedText({ ar: 'رئيس مصلحة', fr: 'Chef de service' }, language),
      employe: getLocalizedText({ ar: 'موظف', fr: 'Employe' }, language),
      citoyen: getLocalizedText({ ar: 'مواطن', fr: 'Citoyen' }, language),
    },
    loadError: getLocalizedText({ ar: 'تعذر تحميل المستخدمين.', fr: 'Impossible de charger les utilisateurs.' }, language),
    updateSuccess: getLocalizedText({ ar: 'تم تحديث المستخدم.', fr: 'Utilisateur mis a jour.' }, language),
    createSuccess: getLocalizedText({ ar: 'تمت إضافة المستخدم.', fr: 'Utilisateur ajoute.' }, language),
    saveError: getLocalizedText({ ar: 'تعذر حفظ المعطيات.', fr: "Echec de l'enregistrement." }, language),
    deleteSuccess: getLocalizedText({ ar: 'تم حذف المستخدم.', fr: 'Utilisateur supprime.' }, language),
    deleteError: getLocalizedText({ ar: 'تعذر حذف المستخدم.', fr: "Echec de la suppression de l'utilisateur." }, language),
    title: getLocalizedText({ ar: 'تدبير المستخدمين', fr: 'Gestion des utilisateurs' }, language),
    subtitle: getLocalizedText({ ar: 'تحكم فولوج المستخدمين للمنصة.', fr: "Controlez les acces a la plateforme." }, language),
    search: getLocalizedText({ ar: 'بحث...', fr: 'Rechercher...' }, language),
    allRoles: getLocalizedText({ ar: 'جميع الأدوار', fr: 'Tous les roles' }, language),
    add: getLocalizedText({ ar: 'إضافة', fr: 'Ajouter' }, language),
    user: getLocalizedText({ ar: 'المستخدم', fr: 'Utilisateur' }, language),
    role: getLocalizedText({ ar: 'الدور', fr: 'Role' }, language),
    actions: getLocalizedText({ ar: 'الإجراءات', fr: 'Actions' }, language),
    page: getLocalizedText({ ar: 'صفحة', fr: 'Page' }, language),
    of: getLocalizedText({ ar: 'من', fr: 'sur' }, language),
    results: getLocalizedText({ ar: 'نتائج', fr: 'resultats' }, language),
    previous: getLocalizedText({ ar: 'السابق', fr: 'Precedent' }, language),
    next: getLocalizedText({ ar: 'التالي', fr: 'Suivant' }, language),
    edit: getLocalizedText({ ar: 'تعديل', fr: 'Modifier' }, language),
    fullName: getLocalizedText({ ar: 'الاسم الكامل', fr: 'Nom complet' }, language),
    email: getLocalizedText({ ar: 'البريد الإلكتروني', fr: 'Email' }, language),
    password: getLocalizedText({ ar: 'كلمة المرور', fr: 'Mot de passe' }, language),
    keepEmpty: getLocalizedText({ ar: 'خليه فارغ', fr: 'Laisser vide' }, language),
    department: getLocalizedText({ ar: 'القسم', fr: 'Departement' }, language),
    noDepartment: getLocalizedText({ ar: '— بدون قسم —', fr: '— Aucun departement —' }, language),
    save: getLocalizedText({ ar: 'حفظ', fr: 'Enregistrer' }, language),
    cancel: getLocalizedText({ ar: 'إلغاء', fr: 'Annuler' }, language),
    deleteTitle: getLocalizedText({ ar: 'حذف المستخدم؟', fr: "Supprimer l'utilisateur ?" }, language),
    deleteText: getLocalizedText({ ar: 'هاد العملية نهائية وغادي تمنع الولوج على هاد المستخدم.', fr: "Cette action est definitive et retirera l'acces a cet utilisateur." }, language),
    delete: getLocalizedText({ ar: 'حذف', fr: 'Supprimer' }, language),
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const uData = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setUsers(uData.filter((u) => u.id !== currentUser?.id));
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
    } catch {
      setError(text.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(''); setError(''); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === 'role' && value === 'citoyen') updated.departement_id = '';
      return updated;
    });
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (userToEdit) => {
    setForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '',
      departement_id: userToEdit.departement_id || '',
      role: userToEdit.role,
      cin: userToEdit.cin || '',
    });
    setEditingId(userToEdit.id);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete payload.password;
      if (payload.role === 'citoyen') delete payload.departement_id;

      if (editingId) {
        await userService.update(editingId, payload);
        setSuccess(text.updateSuccess);
      } else {
        await userService.create(payload);
        setSuccess(text.createSuccess);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) {
        const m = {};
        Object.keys(msgs).forEach((k) => { m[k] = msgs[k][0]; });
        setErrors(m);
      } else {
        setError(text.saveError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await userService.delete(deletingId);
      setSuccess(text.deleteSuccess);
      setShowDeleteModal(false);
      fetchAll();
    } catch {
      setError(text.deleteError);
      setShowDeleteModal(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? normalizeRole(u.role) === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            {text.title}
          </h2>
          <p className="text-slate-500 text-sm font-medium">{text.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full lg:w-56 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all text-sm"
              placeholder={text.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">{text.allRoles}</option>
            <option value="citoyen">{text.roleLabel.citoyen}</option>
            <option value="employe">{text.roleLabel.employe}</option>
            <option value="chef_dep">{text.roleLabel.chef_dep}</option>
            <option value="admin">{text.roleLabel.admin}</option>
          </select>

          <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-sm">
            <UserPlus size={18} /> <span>{text.add}</span>
          </button>
        </div>
      </div>

      <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {error && <div className="p-4 bg-white border-l-4 border-red-500 shadow-xl rounded-xl flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-right-full pointer-events-auto"><AlertCircle size={18} /> {error}</div>}
        {success && <div className="p-4 bg-white border-l-4 border-emerald-500 shadow-xl rounded-xl flex items-center gap-3 text-emerald-700 font-bold animate-in slide-in-from-right-full pointer-events-auto"><CheckCircle size={18} /> {success}</div>}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.user}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.role}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm mb-0.5">{u.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border
                          ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            u.role === 'chef_dep' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              u.role === 'employe' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-slate-50 text-slate-500 border-slate-200'}
                        `}>
                          {text.roleLabel[normalizeRole(u.role)] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleOpenEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => { setDeletingId(u.id); setShowDeleteModal(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {text.page} <span className="text-slate-900">{currentPage}</span> {text.of} <span className="text-slate-900">{totalPages || 1}</span>
                <span className="ml-2 opacity-50">•</span>
                <span className="ml-2">{filtered.length} {text.results}</span>
              </p>

              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                  <ChevronLeft size={14} /> {text.previous}
                </button>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
                  {text.next} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-lg">{editingId ? text.edit : text.add}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.role}</label>
                  <select name="role" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 text-sm font-bold transition-all" value={form.role} onChange={handleChange}>
                    <option value="citoyen">{text.roleLabel.citoyen}</option>
                    <option value="employe">{text.roleLabel.employe}</option>
                    <option value="chef_dep">{text.roleLabel.chef_dep}</option>
                    <option value="admin">{text.roleLabel.admin}</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-xs font-bold ml-1">{errors.role}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CIN</label>
                  <input name="cin" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 text-sm transition-all" placeholder="AB123456" value={form.cin} onChange={handleChange} />
                  {errors.cin && <p className="text-red-500 text-xs font-bold ml-1">{errors.cin}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.fullName}</label>
                <input name="name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 text-sm transition-all" value={form.name} onChange={handleChange} required />
                {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.email}</label>
                <input name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 text-sm transition-all" value={form.email} onChange={handleChange} required />
                {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.password}</label>
                <input name="password" type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 text-sm transition-all" placeholder={editingId ? text.keepEmpty : '••••••••'} value={form.password} onChange={handleChange} required={!editingId} />
                {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password}</p>}
              </div>

              {form.role !== 'citoyen' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.department}</label>
                  <select name="departement_id" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 text-sm font-bold transition-all" value={form.departement_id} onChange={handleChange} required>
                    <option value="">{text.noDepartment}</option>
                    {depts.map((d) => <option key={d.id} value={d.id}>{translateDepartmentName(d.name, language)}</option>)}
                  </select>
                  {errors.departement_id && <p className="text-red-500 text-xs font-bold ml-1">{errors.departement_id}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                  {submitting ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  {text.save}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 text-sm transition-all">{text.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white w-full max-w-xs rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">{text.deleteTitle}</h3>
            <p className="text-slate-500 text-xs font-medium text-center mb-8">{text.deleteText}</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all text-sm shadow-lg shadow-red-100">{text.delete}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-sm">{text.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
