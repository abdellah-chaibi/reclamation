import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reclamationService, departementService, userService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import {
  formatLocalizedDate,
  getCurrentLanguage,
  getLocalizedText,
  translateDepartmentName,
} from '../../utils/localization';
import {
  ClipboardList,
  Building2,
  Calendar,
  User,
  Check,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const STATUSES = [
  {
    value: 'en_attent',
    label: {
      ar: 'في الانتظار',
      fr: 'En attente',
    },
  },
  {
    value: 'en_cours',
    label: {
      ar: 'قيد المعالجة',
      fr: 'En cours',
    },
  },
  {
    value: 'terminee',
    label: {
      ar: 'مكتملة',
      fr: 'Terminee',
    },
  },
  {
    value: 'rejete',
    label: {
      ar: 'مرفوضة',
      fr: 'Rejetee',
    },
  },
];

export default function AdminReclamations() {
  const { i18n } = useTranslation();
  const [recs, setRecs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editDept, setEditDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const language = getCurrentLanguage(i18n.language);
  const text = {
    page: getLocalizedText({ ar: 'ØµÙØ­Ø©', fr: 'Page' }, language),
    of: getLocalizedText({ ar: 'Ù…Ù†', fr: 'sur' }, language),
    results: getLocalizedText({ ar: 'Ù†ØªØ§Ø¦Ø¬', fr: 'resultats' }, language),
    previous: getLocalizedText({ ar: 'Ø§Ù„Ø³Ø§Ø¨Ù‚', fr: 'Precedent' }, language),
    next: getLocalizedText({ ar: 'Ø§Ù„ØªØ§Ù„ÙŠ', fr: 'Suivant' }, language),
    title: getLocalizedText({ ar: 'تدبير الشكايات', fr: 'Gestion des reclamations' }, language),
    subtitle: getLocalizedText(
      { ar: 'تتبع الطلبات وتوزيعها على المصالح.', fr: 'Suivez les demandes et repartissez-les entre les services.' },
      language,
    ),
    loadError: getLocalizedText({ ar: 'تعذر تحميل الشكايات.', fr: 'Impossible de charger les reclamations.' }, language),
    updateError: getLocalizedText({ ar: 'تعذر تحديث القسم.', fr: 'Impossible de mettre a jour le departement.' }, language),
    allStatuses: getLocalizedText({ ar: 'جميع الحالات', fr: 'Tous les statuts' }, language),
    allDepartments: getLocalizedText({ ar: 'جميع الأقسام', fr: 'Tous les departements' }, language),
    unassigned: getLocalizedText({ ar: 'غير معين', fr: 'Non assigne' }, language),
    assignPlaceholder: getLocalizedText({ ar: 'تعيين...', fr: 'Assigner...' }, language),
    complaint: getLocalizedText({ ar: 'الشكاية', fr: 'Reclamation' }, language),
    requesterDepartment: getLocalizedText({ ar: 'صاحب الطلب والقسم', fr: 'Demandeur et departement' }, language),
    status: getLocalizedText({ ar: 'الحالة', fr: 'Statut' }, language),
    actions: getLocalizedText({ ar: 'الإجراءات', fr: 'Actions' }, language),
    empty: getLocalizedText({ ar: 'ما كاين حتى شكاية.', fr: 'Aucune reclamation.' }, language),
    assignAction: getLocalizedText({ ar: 'توجيه', fr: 'Affecter' }, language),
    footer: getLocalizedText({ ar: 'نهاية اللائحة', fr: 'Fin de la liste' }, language),
    countLabel: getLocalizedText({ ar: 'شكاية', fr: 'reclamation(s)' }, language),
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rRes, dRes, uRes] = await Promise.all([
          reclamationService.getAll(),
          departementService.getAll(),
          userService.getAll(),
        ]);

        const r = rRes.data?.data || rRes.data || [];
        const sortedRecs = Array.isArray(r)
          ? [...r].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : [];
        setRecs(sortedRecs);

        const d = dRes.data?.data || dRes.data || [];
        setDepts(Array.isArray(d) ? d : []);

        const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
        setUsers(Array.isArray(u) ? u : []);
        setError('');
      } catch {
        setError(text.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [text.loadError]);

  const handleAssign = async (id) => {
    const currentReclamation = recs.find((rec) => rec.id === id);
    if (!editDept || currentReclamation?.status !== 'en_attent') return;

    setSaving(true);
    setError('');

    try {
      await reclamationService.update(id, { departement_id: parseInt(editDept, 10) });
      setEditId(null);

      const refreshedReclamations = await reclamationService.getAll();
      const items = refreshedReclamations.data?.data || refreshedReclamations.data || [];
      const sortedItems = Array.isArray(items)
        ? [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setRecs(sortedItems);
    } catch {
      setError(text.updateError);
    } finally {
      setSaving(false);
    }
  };

  const filtered = recs.filter((reclamation) => {
    const matchStatus = !filter || reclamation.status === filter;
    const matchDept = !deptFilter || String(reclamation.departement_id) === deptFilter;
    return matchStatus && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, deptFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  const getCitoyenName = (reclamation) => {
    if (reclamation.user?.name) return reclamation.user.name;
    if (reclamation.citoyen?.name) return reclamation.citoyen.name;

    const matchedUser = users.find((user) => String(user.id) === String(reclamation.user_id));
    return matchedUser?.name || `ID #${reclamation.user_id}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
            <ClipboardList className="text-blue-600" size={28} />
            {text.title}
          </h2>
          <p className="text-sm font-medium text-slate-500">{text.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <select
              className="border-r border-slate-100 bg-transparent px-3 py-1.5 text-xs font-bold text-slate-600 outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">{text.allStatuses}</option>
              {STATUSES.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label[language]}
                </option>
              ))}
            </select>

            <select
              className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-600 outline-none"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">{text.allDepartments}</option>
              {depts.map((department) => (
                <option key={department.id} value={department.id}>
                  {translateDepartmentName(department.name, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="animate-in slide-in-from-top-4 mb-6 flex items-center gap-3 rounded-r-xl border-l-4 border-red-500 bg-red-50 p-4 font-bold text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.complaint}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.requesterDepartment}</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{text.status}</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">{text.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center italic text-slate-400">
                      {text.empty}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((reclamation) => {
                    const canAssign = reclamation.status === 'en_attent';
                    const citoyenName = getCitoyenName(reclamation);
                    const assignedDepartment = depts.find((department) => department.id === reclamation.departement_id);

                    return (
                      <tr key={reclamation.id} className="transition-colors hover:bg-slate-50/30">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">#{reclamation.id}</td>

                        <td className="px-6 py-4">
                          <div className="max-w-xs sm:max-w-md">
                            <p className="mb-1 truncate text-sm font-bold text-slate-900">{reclamation.title}</p>
                            <div className="flex items-center gap-2 text-[10px] font-medium uppercase text-slate-400">
                              <Calendar size={12} />
                              {formatLocalizedDate(reclamation.created_at, language)}
                            </div>
                            {reclamation.refusal_reason && (
                              <p className="mt-2 line-clamp-2 text-xs text-red-600">{reclamation.refusal_reason}</p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                              <User size={12} className="text-slate-300" />
                              {citoyenName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Building2 size={12} />
                              {translateDepartmentName(assignedDepartment?.name, language) || text.unassigned}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={reclamation.status} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          {editId === reclamation.id && canAssign ? (
                            <div className="animate-in zoom-in-95 flex items-center justify-end gap-1 duration-200">
                              <select
                                className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-[11px] font-bold outline-none focus:border-blue-400"
                                value={editDept}
                                onChange={(e) => setEditDept(e.target.value)}
                              >
                                <option value="">{text.assignPlaceholder}</option>
                                {depts.map((department) => (
                                  <option key={department.id} value={department.id}>
                                    {translateDepartmentName(department.name, language)}
                                  </option>
                                ))}
                              </select>

                              <button
                                className="rounded-lg bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700"
                                onClick={() => handleAssign(reclamation.id)}
                                disabled={saving}
                              >
                                {saving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                              </button>

                              <button
                                className="rounded-lg bg-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-300"
                                onClick={() => setEditId(null)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`rounded-xl border px-4 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                                canAssign
                                  ? 'border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                  : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                              }`}
                              onClick={() => {
                                if (!canAssign) return;
                                setEditId(reclamation.id);
                                setEditDept(String(reclamation.departement_id || ''));
                              }}
                              disabled={!canAssign}
                            >
                              {text.assignAction}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 ? (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
          labels={{
            page: 'Page',
            of: 'sur',
            results: 'resultats',
            previous: 'Precedent',
            next: 'Suivant',
          }}
          className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm"
        />
      ) : (
        <p className="mt-6 text-center text-[11px] font-medium uppercase tracking-widest text-slate-400">
          {text.footer} - {filtered.length} {text.countLabel}
        </p>
      )}
    </div>
  );
}
