import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCurrentLanguage, getLocalizedText, translateDepartmentName } from '../../utils/localization';
import {
  Users, UserPlus, Search, Edit2, Trash2,
  X, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', departement_id: '', role: 'employe', cin: '' };

export default function AdminEmployees() {
  const { i18n } = useTranslation();
  const [employees, setEmployees] = useState([]);
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
  const [deptFilter, setDeptFilter] = useState('');
  const language = getCurrentLanguage(i18n.language);
  const text = {
    title: getLocalizedText({ ar: 'الموظفون', fr: 'Employes' }, language),
    members: getLocalizedText({ ar: 'أعضاء مسجلون', fr: 'membres enregistres' }, language),
    search: getLocalizedText({ ar: 'بحث...', fr: 'Rechercher...' }, language),
    allDepartments: getLocalizedText({ ar: 'جميع الأقسام', fr: 'Tous les departements' }, language),
    add: getLocalizedText({ ar: 'إضافة', fr: 'Ajouter' }, language),
    empty: getLocalizedText({ ar: 'ما كاين حتى موظف.', fr: 'Aucun employe.' }, language),
    employee: getLocalizedText({ ar: 'الموظف', fr: 'Employe' }, language),
    department: getLocalizedText({ ar: 'القسم', fr: 'Departement' }, language),
    actions: getLocalizedText({ ar: 'الإجراءات', fr: 'Actions' }, language),
    notAssigned: getLocalizedText({ ar: 'غير معين', fr: 'Non assigne' }, language),
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setEmployees(u.filter((x) => x.role === 'employe'));
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
    } catch {
      setError('تعذر تحميل الموظفين.');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (empToEdit) => {
    setForm({
      name: empToEdit.name,
      email: empToEdit.email,
      password: '',
      departement_id: empToEdit.departement_id || '',
      role: 'employe',
      cin: empToEdit.cin || '',
    });
    setEditingId(empToEdit.id);
    setErrors({});
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete payload.password;

      if (editingId) {
        await userService.update(editingId, payload);
        setSuccess('تم تحديث الموظف.');
      } else {
        await userService.create(payload);
        setSuccess('تمت إضافة الموظف.');
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
        setError(err?.response?.data?.message || 'تعذر حفظ المعطيات.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await userService.delete(deletingId);
      setSuccess('تم حذف الموظف.');
      setShowDeleteModal(false);
      fetchAll();
    } catch {
      setError('تعذر حذف الموظف.');
      setShowDeleteModal(false);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch = emp.name?.toLowerCase().includes(search.toLowerCase()) || emp.email?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? String(emp.departement_id) === String(deptFilter) : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            {text.title}
          </h2>
          <p className="text-slate-500 text-sm font-medium">{employees.length} {text.members}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all text-sm"
              placeholder={text.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700 text-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">{text.allDepartments}</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{translateDepartmentName(d.name, language)}</option>)}
          </select>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-sm"
          >
            <UserPlus size={18} /> <span>{text.add}</span>
          </button>
        </div>
      </div>

      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {error && (
          <div className="p-4 bg-white border-l-4 border-red-500 shadow-2xl rounded-lg flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-lg flex items-center gap-3 text-emerald-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
            <CheckCircle size={18} /> {success}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-medium italic">{text.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.employee}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.department}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{text.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">#{emp.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                          {emp.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-none mb-1">{emp.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {emp.departement?.name ? (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase border border-blue-100">
                          {translateDepartmentName(emp.departement.name, language)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 italic">{text.notAssigned}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => { setDeletingId(emp.id); setShowDeleteModal(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">حذف الموظف؟</h3>
            <p className="text-slate-500 text-xs font-medium mb-6">هاد العملية نهائية وغادي تمنع الولوج على هاد المستخدم.</p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-all text-sm">حذف</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl hover:bg-slate-200 text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900">{editingId ? 'تعديل' : 'إضافة'} موظف</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">الاسم الكامل</label>
                <input name="name" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" value={form.name} onChange={handleChange} required />
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">البريد الإلكتروني</label>
                  <input name="email" type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" value={form.email} onChange={handleChange} required />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">CIN</label>
                  <input name="cin" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" value={form.cin} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">كلمة المرور</label>
                <input name="password" type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" placeholder={editingId ? 'خليه فارغ باش تبقى الحالية' : '••••••••'} value={form.password} onChange={handleChange} required={!editingId} />
                {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">القسم</label>
                <select name="departement_id" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold" value={form.departement_id} onChange={handleChange}>
                  <option value="">— بدون قسم —</option>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departement_id && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.departement_id}</p>}
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  حفظ
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
