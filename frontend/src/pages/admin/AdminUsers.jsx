import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCurrentLanguage, getLocalizedText, translateDepartmentName } from '../../utils/localization';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const normalizeRole = (role) => {
  if (role === 'user' || role === 'citizen') return 'citoyen';
  return role;
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
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
    subtitle: getLocalizedText({ ar: 'تحكم فولوج المستخدمين للمنصة.', fr: 'Controlez les acces a la plateforme.' }, language),
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
    deleteText: getLocalizedText(
      { ar: 'هاد العملية نهائية وغادي تمنع الولوج على هاد المستخدم.', fr: "Cette action est definitive et retirera l'acces a cet utilisateur." },
      language,
    ),
    delete: getLocalizedText({ ar: 'حذف', fr: 'Supprimer' }, language),
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const uData = extractItems(uRes.data);
      setUsers(uData.filter((userItem) => userItem.id !== currentUser?.id));
      const departments = extractItems(dRes.data);
      setDepts(Array.isArray(departments) ? departments : []);
    } catch {
      setError(text.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => {
      const updated = { ...previous, [name]: value };
      if (name === 'role' && value === 'citoyen') updated.departement_id = '';
      return updated;
    });
    setErrors((previous) => ({ ...previous, [name]: '' }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      const messages = err?.response?.data?.errors;
      if (messages) {
        const mapped = {};
        Object.keys(messages).forEach((key) => {
          mapped[key] = messages[key][0];
        });
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

  const filtered = users.filter((userItem) => {
    const matchesSearch = userItem.name?.toLowerCase().includes(search.toLowerCase())
      || userItem.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? normalizeRole(userItem.role) === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            <Users className="text-blue-600" size={28} />
            {text.title}
          </h2>
          <p className="text-sm font-medium text-slate-500">{text.subtitle}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
          <div className="group relative w-full sm:min-w-[220px] sm:flex-1 lg:w-auto lg:flex-none">
            <Search className="absolute left-3 top-3 text-slate-400 transition-colors group-focus-within:text-blue-500" size={16} />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-200 focus:ring-4 focus:ring-blue-50 lg:w-56"
              placeholder={text.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-50 sm:w-auto"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">{text.allRoles}</option>
            <option value="citoyen">{text.roleLabel.citoyen}</option>
            <option value="employe">{text.roleLabel.employe}</option>
            <option value="chef_dep">{text.roleLabel.chef_dep}</option>
            <option value="admin">{text.roleLabel.admin}</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 sm:w-auto"
          >
            <UserPlus size={18} />
            <span>{text.add}</span>
          </button>
        </div>
      </div>

      <div className="pointer-events-none fixed left-3 right-3 top-20 z-50 flex flex-col gap-2 sm:left-auto sm:right-6 sm:top-24 sm:w-[min(420px,calc(100vw-3rem))]">
        {error && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 border-red-500 bg-white p-4 font-bold text-red-700 shadow-xl animate-in slide-in-from-right-full">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}
        {success && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 border-emerald-500 bg-white p-4 font-bold text-emerald-700 shadow-xl animate-in slide-in-from-right-full">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">{success}</span>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.user}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.role}</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((userItem) => (
                    <tr key={userItem.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                            {userItem.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="mb-0.5 truncate text-sm font-bold text-slate-900">{userItem.name}</p>
                            <p className="truncate text-[11px] font-medium text-slate-500">{userItem.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${
                            userItem.role === 'admin'
                              ? 'border-purple-100 bg-purple-50 text-purple-600'
                              : userItem.role === 'chef_dep'
                                ? 'border-blue-100 bg-blue-50 text-blue-600'
                                : userItem.role === 'employe'
                                  ? 'border-amber-100 bg-amber-50 text-amber-600'
                                  : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {text.roleLabel[normalizeRole(userItem.role)] || userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(userItem)}
                            className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-blue-600 hover:shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(userItem.id);
                              setShowDeleteModal(true);
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-red-600 hover:shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {text.page} <span className="text-slate-900">{currentPage}</span> {text.of} <span className="text-slate-900">{totalPages || 1}</span>
                <span className="ml-2 opacity-50">•</span>
                <span className="ml-2">{filtered.length} {text.results}</span>
              </p>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  <ChevronLeft size={14} />
                  {text.previous}
                </button>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  {text.next}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[calc(100vh-2rem)] sm:rounded-[2.5rem]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-8 sm:py-6">
              <h3 className="text-lg font-black text-slate-900">{editingId ? text.edit : text.add}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto p-5 sm:max-h-[80vh] sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.role}</label>
                  <select
                    name="role"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-400"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="citoyen">{text.roleLabel.citoyen}</option>
                    <option value="employe">{text.roleLabel.employe}</option>
                    <option value="chef_dep">{text.roleLabel.chef_dep}</option>
                    <option value="admin">{text.roleLabel.admin}</option>
                  </select>
                  {errors.role && <p className="ml-1 text-xs font-bold text-red-500">{errors.role}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">CIN</label>
                  <input
                    name="cin"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400"
                    placeholder="AB123456"
                    value={form.cin}
                    onChange={handleChange}
                  />
                  {errors.cin && <p className="ml-1 text-xs font-bold text-red-500">{errors.cin}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.fullName}</label>
                <input
                  name="name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className="ml-1 text-xs font-bold text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.email}</label>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className="ml-1 text-xs font-bold text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.password}</label>
                <input
                  name="password"
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400"
                  placeholder={editingId ? text.keepEmpty : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  required={!editingId}
                />
                {errors.password && <p className="ml-1 text-xs font-bold text-red-500">{errors.password}</p>}
              </div>

              {form.role !== 'citoyen' && (
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.department}</label>
                  <select
                    name="departement_id"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-400"
                    value={form.departement_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{text.noDepartment}</option>
                    {depts.map((department) => (
                      <option key={department.id} value={department.id}>
                        {translateDepartmentName(department.name, language)}
                      </option>
                    ))}
                  </select>
                  {errors.departement_id && <p className="ml-1 text-xs font-bold text-red-500">{errors.departement_id}</p>}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 sm:flex-[2]"
                >
                  {submitting ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  {text.save}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl bg-slate-100 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 sm:flex-1"
                >
                  {text.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-xs rounded-[1.5rem] bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200 sm:rounded-[2rem] sm:p-8">
            <h3 className="mb-2 text-center text-xl font-black text-slate-900">{text.deleteTitle}</h3>
            <p className="mb-8 text-center text-xs font-medium text-slate-500">{text.deleteText}</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full rounded-2xl bg-red-500 py-4 text-sm font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600">
                {text.delete}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full rounded-2xl bg-slate-100 py-4 text-sm font-bold text-slate-500 transition-all hover:bg-slate-200">
                {text.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
