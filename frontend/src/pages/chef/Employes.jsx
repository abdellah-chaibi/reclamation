import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCurrentLanguage, getLocalizedText, translateDepartmentName } from '../../utils/localization';
import {
  Users, UserPlus, Search, Edit2, Trash2,
  X, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  departement_id: '',
  role: 'employe',
  cin: '',
};

export default function Employes() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
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
  const language = getCurrentLanguage(i18n.language);
  const text = {
    loadError: getLocalizedText({ ar: 'تعذر تحميل الموظفين.', fr: 'Impossible de charger les employes.' }, language),
    saveError: getLocalizedText({ ar: 'تعذر حفظ المعطيات.', fr: "Echec de l'enregistrement." }, language),
    deleteError: getLocalizedText({ ar: 'تعذر حذف الموظف.', fr: "Echec de la suppression de l'employe." }, language),
    updateSuccess: getLocalizedText({ ar: 'تم تحديث الموظف.', fr: 'Employe mis a jour.' }, language),
    createSuccess: getLocalizedText({ ar: 'تمت إضافة الموظف.', fr: 'Employe ajoute.' }, language),
    deleteSuccess: getLocalizedText({ ar: 'تم حذف الموظف.', fr: 'Employe supprime.' }, language),
    title: getLocalizedText({ ar: 'الموظفون', fr: 'Employes' }, language),
    members: getLocalizedText({ ar: 'أعضاء مسجلون', fr: 'membres enregistres' }, language),
    searchPlaceholder: getLocalizedText({ ar: 'بحث عن عضو...', fr: 'Rechercher un membre...' }, language),
    add: getLocalizedText({ ar: 'إضافة', fr: 'Ajouter' }, language),
    syncing: getLocalizedText({ ar: 'جاري المزامنة...', fr: 'Synchronisation...' }, language),
    emptyTitle: getLocalizedText({ ar: 'ما كاين حتى موظف', fr: 'Aucun employe' }, language),
    emptyText: getLocalizedText({ ar: 'البحث ديالك ما لقا حتى حساب فهاد القسم.', fr: 'Votre recherche ne correspond a aucun profil dans ce departement.' }, language),
    identity: getLocalizedText({ ar: 'الهوية', fr: 'Identite' }, language),
    actions: getLocalizedText({ ar: 'الإجراءات', fr: 'Actions' }, language),
    deleteTitle: getLocalizedText({ ar: 'حذف الموظف؟', fr: "Supprimer l'employe ?" }, language),
    deleteText: getLocalizedText({ ar: 'هاد العملية نهائية وغادي تمنع الولوج على هاد المستخدم.', fr: "Cette action est definitive et retirera l'acces a cet utilisateur." }, language),
    cancel: getLocalizedText({ ar: 'إلغاء', fr: 'Annuler' }, language),
    delete: getLocalizedText({ ar: 'حذف', fr: 'Supprimer' }, language),
    edit: getLocalizedText({ ar: 'تعديل', fr: 'Modifier' }, language),
    employee: getLocalizedText({ ar: 'موظف', fr: 'Employe' }, language),
    fullName: getLocalizedText({ ar: 'الاسم الكامل', fr: 'Nom complet' }, language),
    email: getLocalizedText({ ar: 'البريد الإلكتروني', fr: 'Email' }, language),
    password: getLocalizedText({ ar: 'كلمة المرور', fr: 'Mot de passe' }, language),
    department: getLocalizedText({ ar: 'القسم', fr: 'Departement' }, language),
    myDepartment: getLocalizedText({ ar: 'القسم ديالي', fr: 'Mon departement' }, language),
    keepPassword: getLocalizedText({ ar: 'خليه فارغ باش تبقى الحالية', fr: 'Laisser vide pour garder le mot de passe actuel' }, language),
    save: getLocalizedText({ ar: 'حفظ', fr: 'Enregistrer' }, language),
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes] = await Promise.all([
        userService.getAll(),
        departementService.getAll(),
      ]);

      const users = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      const currentDeptId = user?.departement_id;

      setEmployees(
        users.filter((entry) => entry.role === 'employe' && entry.departement_id === currentDeptId),
      );
    } catch {
      setError(text.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.departement_id) fetchAll();
  }, [user?.departement_id]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(''); setError(''); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleOpenCreate = () => {
    setForm({ ...emptyForm, departement_id: user?.departement_id || '' });
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (employee) => {
    setForm({
      name: employee.name,
      email: employee.email,
      password: '',
      departement_id: employee.departement_id || '',
      role: 'employe',
      cin: employee.cin || '',
    });
    setEditingId(employee.id);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, role: 'employe', departement_id: user?.departement_id || '' };
      if (editingId && !payload.password) delete payload.password;

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
      const messages = err?.response?.data?.errors;
      if (messages) {
        const mapped = {};
        Object.keys(messages).forEach((key) => { mapped[key] = messages[key][0]; });
        setErrors(mapped);
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

  const filtered = employees.filter((employee) => (
    employee.name?.toLowerCase().includes(search.toLowerCase()) ||
    employee.email?.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                <Users size={24} />
              </div>
              {text.title}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {employees.length} {text.members} {user?.departement?.name ? ` - ${translateDepartmentName(user.departement.name, language)}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group flex-1 min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 shadow-sm transition-all text-sm font-medium"
                placeholder={text.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-400 transition-all shadow-md active:scale-95 text-sm"
            >
              <UserPlus size={18} /> <span>{text.add}</span>
            </button>
          </div>
        </div>

        <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
          {error && (
            <div className="p-4 bg-white border-l-4 border-red-500 shadow-2xl rounded-xl flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-xl flex items-center gap-3 text-emerald-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
              <CheckCircle size={18} /> {success}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-200/50">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4 text-slate-400 font-bold">
              <LoadingSpinner />
              <p className="animate-pulse">{text.syncing}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center px-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-slate-300" size={32} />
              </div>
              <h3 className="text-slate-900 font-black text-lg">{text.emptyTitle}</h3>
              <p className="text-slate-500 font-medium">{text.emptyText}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">{text.identity}</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">CIN</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((employee) => (
                    <tr key={employee.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                            {employee.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[15px] mb-0.5">{employee.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{employee.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-sm font-bold text-slate-400 tabular-nums">
                        {employee.cin || '-'}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEdit(employee)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => { setDeletingId(employee.id); setShowDeleteModal(true); }} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white w-full max-w-xs rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">{text.deleteTitle}</h3>
            <p className="text-slate-500 text-xs font-medium text-center mb-6">{text.deleteText}</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all text-sm">{text.delete}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all text-sm">{text.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-lg">{editingId ? text.edit : text.add} {text.employee}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.fullName}</label>
                <input name="name" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" value={form.name} onChange={handleChange} required />
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.email}</label>
                  <input name="email" type="email" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" value={form.email} onChange={handleChange} required />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CIN</label>
                  <input name="cin" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" value={form.cin} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.password}</label>
                <input name="password" type="password" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" placeholder={editingId ? text.keepPassword : '••••••••'} value={form.password} onChange={handleChange} required={!editingId} />
                {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{text.department}</label>
                <div className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed">
                  {user?.departement?.name ? translateDepartmentName(user.departement.name, language) : text.myDepartment}
                </div>
              </div>

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
    </div>
  );
}
