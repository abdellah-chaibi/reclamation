import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { reclamationService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatLocalizedDate, getCurrentLanguage, getLocalizedText } from '../../utils/localization';
import {
  ClipboardList, CheckCircle2, AlertCircle, ChevronDown,
  ChevronUp, MapPin, Paperclip, Calendar, Clock, CheckCircle,
  WrenchIcon, XCircle
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function groupReclamationsByDate(items, language) {
  const sorted = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return sorted.reduce((groups, item) => {
    const key = formatLocalizedDate(item.created_at, language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
    return groups;
  }, {});
}

export default function EmployeeDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [refuseId, setRefuseId] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const language = getCurrentLanguage(i18n.language);
  const ui = {
    page: getLocalizedText({ ar: 'ØµÙØ­Ø©', fr: 'Page' }, language),
    of: getLocalizedText({ ar: 'Ù…Ù†', fr: 'sur' }, language),
    results: getLocalizedText({ ar: 'Ù†ØªØ§Ø¦Ø¬', fr: 'resultats' }, language),
    previous: getLocalizedText({ ar: 'Ø§Ù„Ø³Ø§Ø¨Ù‚', fr: 'Precedent' }, language),
    next: getLocalizedText({ ar: 'Ø§Ù„ØªØ§Ù„ÙŠ', fr: 'Suivant' }, language),
    loadError: getLocalizedText({ ar: 'تعذر تحميل المهام المسندة.', fr: 'Echec du chargement des taches assignees.' }, language),
    statusUpdated: getLocalizedText({ ar: 'تم تحديث الحالة بنجاح.', fr: 'Statut mis a jour avec succes.' }, language),
    statusError: getLocalizedText({ ar: 'تعذر تحديث الحالة.', fr: 'Echec de la mise a jour du statut.' }, language),
    refusalMin: getLocalizedText({ ar: 'خاص سبب الرفض يكون فيه على الأقل 10 أحرف.', fr: 'Le motif du refus doit contenir au moins 10 caracteres.' }, language),
    refusalSuccess: getLocalizedText({ ar: 'تم رفض الشكاية بنجاح.', fr: 'Reclamation refusee avec succes.' }, language),
    refusalError: getLocalizedText({ ar: 'تعذر رفض الشكاية.', fr: 'Echec du refus de la reclamation.' }, language),
    allClear: getLocalizedText({ ar: 'كلشي واضح', fr: 'Tout est clair' }, language),
    files: getLocalizedText({ ar: 'ملفات', fr: 'Fichier(s)' }, language),
    startProgress: getLocalizedText({ ar: 'قيد المعالجة', fr: 'En cours' }, language),
    description: getLocalizedText({ ar: 'الوصف', fr: 'Description' }, language),
    attachments: getLocalizedText({ ar: 'المرفقات', fr: 'Pieces jointes' }, language),
    openFile: getLocalizedText({ ar: 'فتح الملف', fr: 'Ouvrir le fichier' }, language),
    location: getLocalizedText({ ar: 'الموقع', fr: 'Localisation' }, language),
    markProgress: getLocalizedText({ ar: 'تعليم كقيد المعالجة', fr: 'Marquer "En cours"' }, language),
    closeDone: getLocalizedText({ ar: 'إغلاق كمكتملة', fr: 'Cloturer (Terminee)' }, language),
    refuse: getLocalizedText({ ar: 'رفض', fr: 'Refuser' }, language),
    refuseTitle: getLocalizedText({ ar: 'رفض الشكاية', fr: 'Refuser la reclamation' }, language),
    refuseHelp: getLocalizedText({ ar: 'كتب سبب الرفض. الحالة غادي تولّي تلقائياً "مرفوضة".', fr: 'Ajoutez le motif du refus. Le statut deviendra automatiquement "rejete".' }, language),
    refusePlaceholder: getLocalizedText({ ar: 'شرح علاش هاد الشكاية ترفضات...', fr: 'Expliquez pourquoi la reclamation est refusee...' }, language),
    cancel: getLocalizedText({ ar: 'إلغاء', fr: 'Annuler' }, language),
    processing: getLocalizedText({ ar: 'جاري المعالجة...', fr: 'En cours...' }, language),
    confirmRefuse: getLocalizedText({ ar: 'تأكيد الرفض', fr: 'Confirmer le refus' }, language),
  };

  const fetchAll = async () => {
    if (!user?.departement_id) {
      setRecs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await reclamationService.getAll({ departement_id: user.departement_id });
      const r = res.data?.data || res.data || [];
      setRecs(Array.isArray(r) ? r : []);
    } catch {
      setError(ui.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.departement_id) {
      setLoading(false);
      return;
    }

    fetchAll();
  }, [user?.departement_id]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await reclamationService.update(id, { status: newStatus });
      setSuccess(ui.statusUpdated);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || ui.statusError);
    } finally {
      setSaving(false);
    }
  };

  const openRefuseModal = (e, id) => {
    e.stopPropagation();
    setError('');
    setSuccess('');
    setRefuseId(id);
    setRefusalReason('');
  };

  const closeRefuseModal = () => {
    if (saving) return;
    setRefuseId(null);
    setRefusalReason('');
  };

  const handleRefuse = async () => {
    if (!refuseId || refusalReason.trim().length < 10) {
      setError(ui.refusalMin);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await reclamationService.refuse(refuseId, { refusal_reason: refusalReason.trim() });
      setSuccess(ui.refusalSuccess);
      closeRefuseModal();
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || ui.refusalError);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const todo = recs.filter((r) => r.status === 'en_attent' || r.status === 'en_cours');
  const resolved = recs.filter((r) => r.status === 'terminee' || r.status === 'rejete');
  const rejected = recs.filter((r) => r.status === 'rejete');
  const totalPages = Math.ceil(recs.length / itemsPerPage);
  const currentItems = recs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const groupedReclamations = groupReclamationsByDate(currentItems, language);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><WrenchIcon /></span>
          {t('employee.title')}
        </h2>
        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
          <ClipboardList size={18} />
          {t('employee.subtitle', { count: recs.length })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{todo.length}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('employee.todo')}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{resolved.length}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('employee.resolved')}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <XCircle size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{rejected.length}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('employee.rejected')}</div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {success && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <CheckCircle className="text-emerald-400" size={20} />
            <span className="text-sm font-bold">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 min-h-[400px]">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : recs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center text-4xl shadow-sm mb-6">
              0
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{ui.allClear}</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              {t('employee.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedReclamations).map(([dateLabel, items]) => (
              <section key={dateLabel} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{dateLabel}</h3>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="flex flex-col gap-4">
                  {items.map((r, index) => {
                    const isExpanded = expandedId === r.id;

                    return (
                      <div
                        key={r.id}
                        className={`bg-white border transition-all duration-300 rounded-2xl shadow-sm overflow-hidden ${isExpanded ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className="p-5 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
                          onClick={() => toggleExpand(r.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                {r.title}
                              </span>
                              <StatusBadge status={r.status} />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} /> {formatLocalizedDate(r.created_at, language, { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              {r.medias?.length > 0 && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Paperclip size={14} /> {r.medias.length} {ui.files}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                            {!isExpanded && r.status !== 'terminee' && r.status !== 'rejete' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => handleStatusUpdate(e, r.id, 'en_cours')}
                                  disabled={saving || r.status === 'en_cours'}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                  {ui.startProgress}
                                </button>
                              </div>
                            )}
                            <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 p-5 md:px-6 md:py-6 animate-in slide-in-from-top-4 duration-300">
                            {r.content && (
                              <div className="mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{ui.description}</h4>
                                <p className="text-slate-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                  {r.content}
                                </p>
                              </div>
                            )}

                            {r.refusal_reason && (
                              <div className="mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">{t('employee.refusalReason')}</h4>
                                <p className="text-red-700 text-sm leading-relaxed bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                                  {r.refusal_reason}
                                </p>
                              </div>
                            )}

                            {r.medias && r.medias.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                                  <Paperclip size={12} /> {ui.attachments} ({r.medias.length})
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                  {r.medias.map((m) => (
                                    <a
                                      key={m.id}
                                      href={`http://localhost:8000/storage/${m.path}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-sm font-bold text-slate-600 transition-all shadow-sm"
                                    >
                                      <Paperclip size={16} className="text-slate-400" />
                                      {ui.openFile}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {r.latitude && r.longitude && (
                              <div className="mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                                  <MapPin size={12} /> {ui.location}
                                </h4>
                                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
                                  <MapContainer
                                    center={[parseFloat(r.latitude), parseFloat(r.longitude)]}
                                    zoom={15}
                                    style={{ height: '250px', width: '100%', zIndex: 0 }}
                                    scrollWheelZoom={false}
                                  >
                                    <TileLayer
                                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[parseFloat(r.latitude), parseFloat(r.longitude)]}>
                                      <Popup className="font-bold">{r.title}</Popup>
                                    </Marker>
                                  </MapContainer>
                                </div>
                              </div>
                            )}

                            {r.status !== 'terminee' && r.status !== 'rejete' && (
                              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                                <button
                                  className="flex-1 flex justify-center items-center gap-2 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                                  onClick={(e) => handleStatusUpdate(e, r.id, 'en_cours')}
                                  disabled={saving || r.status === 'en_cours'}
                                >
                                  <Clock size={18} /> {ui.markProgress}
                                </button>

                                <button
                                  className="flex-1 flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                                  onClick={(e) => handleStatusUpdate(e, r.id, 'terminee')}
                                  disabled={saving}
                                >
                                  <CheckCircle2 size={18} /> {ui.closeDone}
                                </button>
                                <button
                                  className="flex-1 flex justify-center items-center gap-2 bg-red-50 border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                                  onClick={(e) => openRefuseModal(e, r.id)}
                                  disabled={saving}
                                >
                                  <XCircle size={18} /> {ui.refuse}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {!loading && recs.length > 0 && (
        <div className="mt-8">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={recs.length}
            onPageChange={setCurrentPage}
            labels={{
              page: 'Page',
              of: 'sur',
              results: 'resultats',
              previous: 'Precedent',
              next: 'Suivant',
            }}
            className="rounded-[2rem] border border-slate-200 bg-white shadow-sm"
          />
        </div>
      )}

      {refuseId && (
        <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6">
            <h3 className="text-xl font-black text-slate-900">{ui.refuseTitle}</h3>
            <p className="text-sm text-slate-500 mt-2">{ui.refuseHelp}</p>
            <textarea
              className="mt-4 w-full min-h-[150px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-red-400"
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder={ui.refusePlaceholder}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                onClick={closeRefuseModal}
                disabled={saving}
              >
                {ui.cancel}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                onClick={handleRefuse}
                disabled={saving}
              >
                {saving ? ui.processing : ui.confirmRefuse}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
