import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { reclamationService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Employes from './Employes';
import { formatLocalizedDate, getCurrentLanguage, getLocalizedText, translateDepartmentName } from '../../utils/localization';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  CheckCircle2, AlertCircle, ChevronDown,
  MapPin, Paperclip, Calendar, Clock, Inbox, ExternalLink, XCircle,
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

function ChefOverview() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [refuseId, setRefuseId] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const language = getCurrentLanguage(i18n.language);
  const text = {
    connectionError: getLocalizedText({ ar: 'وقع مشكل فالاتصال بالخادم.', fr: 'Probleme de connexion au serveur.' }, language),
    statusUpdated: getLocalizedText({ ar: 'تم تحديث الحالة بنجاح.', fr: 'Statut mis a jour avec succes.' }, language),
    statusError: getLocalizedText({ ar: 'وقع مشكل أثناء تغيير الحالة.', fr: 'Erreur lors du changement de statut.' }, language),
    refusalMin: getLocalizedText({ ar: 'خاص سبب الرفض يكون فيه على الأقل 10 أحرف.', fr: 'Le motif du refus doit contenir au moins 10 caracteres.' }, language),
    refusalSuccess: getLocalizedText({ ar: 'تم رفض الشكاية بنجاح.', fr: 'Reclamation refusee avec succes.' }, language),
    refusalError: getLocalizedText({ ar: 'وقع مشكل أثناء رفض الشكاية.', fr: 'Erreur lors du refus de la reclamation.' }, language),
    title: getLocalizedText({ ar: 'لوحة القيادة', fr: 'Tableau de bord' }, language),
    departmentLabel: getLocalizedText({ ar: 'قسم', fr: 'Service' }, language),
    totalLabel: getLocalizedText({ ar: 'المجموع', fr: 'total' }, language),
    fallbackDepartment: getLocalizedText({ ar: 'القسم', fr: 'Departement' }, language),
    inProgress: getLocalizedText({ ar: 'قيد المعالجة', fr: 'En cours' }, language),
    completed: getLocalizedText({ ar: 'مكتملة', fr: 'Terminees' }, language),
    syncing: getLocalizedText({ ar: 'جاري مزامنة المعطيات...', fr: 'Synchronisation des donnees...' }, language),
    emptyTitle: getLocalizedText({ ar: 'ما كاين حتى طلب', fr: 'Aucune tache trouvee' }, language),
    emptyText: getLocalizedText({ ar: 'اللائحة ديال الخدمة دابا خاوية.', fr: "Votre file d'attente est actuellement vide." }, language),
    files: getLocalizedText({ ar: 'ملفات', fr: 'fichiers' }, language),
    problemDescription: getLocalizedText({ ar: 'وصف المشكل', fr: 'Description du probleme' }, language),
    noDescription: getLocalizedText({ ar: 'ما كاين حتى وصف.', fr: 'Aucune description fournie.' }, language),
    refusalReason: getLocalizedText({ ar: 'سبب الرفض', fr: 'Motif du refus' }, language),
    attachments: getLocalizedText({ ar: 'المرفقات والوثائق', fr: 'Preuves et documents' }, language),
    attachment: getLocalizedText({ ar: 'ملف مرفق', fr: 'Fichier joint' }, language),
    location: getLocalizedText({ ar: 'الموقع الدقيق', fr: 'Localisation precise' }, language),
    noGps: getLocalizedText({ ar: 'ما كايناش إحداثيات GPS', fr: 'Aucune coordonnee GPS' }, language),
    startProgress: getLocalizedText({ ar: 'بدء المعالجة', fr: 'Mettre en cours' }, language),
    markDone: getLocalizedText({ ar: 'تعليم كمكتملة', fr: 'Marquer comme resolue' }, language),
    refuse: getLocalizedText({ ar: 'رفض', fr: 'Refuser' }, language),
    refuseTitle: getLocalizedText({ ar: 'رفض الشكاية', fr: 'Refuser la reclamation' }, language),
    refuseHelp: getLocalizedText({ ar: 'كتب سبب الرفض. الحالة غادي تولّي تلقائياً "مرفوضة".', fr: 'Ajoutez le motif du refus. Le statut deviendra automatiquement "rejete".' }, language),
    refusePlaceholder: getLocalizedText({ ar: 'شرح علاش هاد الشكاية ترفضات...', fr: 'Expliquez pourquoi la reclamation est refusee...' }, language),
    cancel: getLocalizedText({ ar: 'إلغاء', fr: 'Annuler' }, language),
    processing: getLocalizedText({ ar: 'جاري المعالجة...', fr: 'En cours...' }, language),
    confirmRefuse: getLocalizedText({ ar: 'تأكيد الرفض', fr: 'Confirmer le refus' }, language),
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await reclamationService.getAll();
      const all = res.data?.data || res.data || [];
      const myDeptId = user?.departement_id;
      setRecs(Array.isArray(all) ? all.filter((item) => item.departement_id === myDeptId) : []);
    } catch {
      setError(text.connectionError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.departement_id) {
      fetchAll();
    }
  }, [user?.departement_id]);

  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await reclamationService.update(id, { status: newStatus });
      setSuccess(text.statusUpdated);
      fetchAll();
    } catch {
      setError(text.statusError);
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
      setError(text.refusalMin);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await reclamationService.refuse(refuseId, { refusal_reason: refusalReason.trim() });
      setSuccess(text.refusalSuccess);
      closeRefuseModal();
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || text.refusalError);
    } finally {
      setSaving(false);
    }
  };

  const todo = recs.filter((item) => ['en_attent', 'en_cours'].includes(item.status));
  const resolved = recs.filter((item) => ['terminee', 'rejete'].includes(item.status));
  const groupedRecs = groupReclamationsByDate(recs, language);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{text.title}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              {text.departmentLabel} {user?.departement?.name ? translateDepartmentName(user.departement.name, language) : text.fallbackDepartment} - {text.totalLabel} {recs.length}
            </p>
          </div>

          <div className="flex gap-3 animate-in slide-in-from-right duration-700">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 min-w-[160px]">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><Clock size={20} /></div>
              <div>
                <p className="text-2xl font-black text-slate-900">{todo.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{text.inProgress}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 min-w-[160px]">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-2xl font-black text-slate-900">{resolved.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{text.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {(success || error) && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 font-bold text-sm shadow-sm ${success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {success || error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner />
            <p className="text-slate-400 font-bold animate-pulse">{text.syncing}</p>
          </div>
        ) : recs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-24 flex flex-col items-center text-center px-6">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4">?</div>
            <h3 className="text-xl font-black text-slate-900">{text.emptyTitle}</h3>
            <p className="text-slate-500 mt-2">{text.emptyText}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedRecs).map(([dateLabel, items]) => (
              <section key={dateLabel} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{dateLabel}</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {items.map((r, i) => (
                    <div
                      key={r.id}
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className={`group bg-white border transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer ${expandedId === r.id ? 'border-blue-400 ring-4 ring-blue-50 shadow-xl' : 'border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'}`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-5 items-start">
                          <div className={`p-4 rounded-2xl transition-colors ${expandedId === r.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                            <Inbox size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-black text-slate-900">{r.title}</h3>
                              <StatusBadge status={r.status} />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-slate-400 font-bold text-xs uppercase tracking-tight">
                              <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatLocalizedDate(r.created_at, language)}</span>
                              {r.medias?.length > 0 && <span className="flex items-center gap-1.5 text-blue-500"><Paperclip size={14} /> {r.medias.length} {text.files}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${expandedId === r.id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                            <ChevronDown size={20} />
                          </div>
                        </div>
                      </div>

                      {expandedId === r.id && (
                        <div className="px-6 pb-8 md:px-8 md:pb-10 animate-in slide-in-from-top-5 duration-500">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                            <div className="space-y-6">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{text.problemDescription}</label>
                                <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  {r.content || text.noDescription}
                                </p>
                              </div>

                              {r.refusal_reason && (
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-2">{text.refusalReason}</label>
                                  <p className="text-red-700 font-medium leading-relaxed bg-red-50 p-5 rounded-2xl border border-red-100">
                                    {r.refusal_reason}
                                  </p>
                                </div>
                              )}

                              {r.medias?.length > 0 && (
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">{text.attachments}</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {r.medias.map((m) => (
                                      <a
                                        key={m.id}
                                        href={`http://localhost:8000/storage/${m.path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all font-bold text-sm shadow-sm group/btn"
                                      >
                                        <span className="flex items-center gap-2 truncate"><Paperclip size={16} /> {text.attachment}</span>
                                        <ExternalLink size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              {r.latitude && r.longitude ? (
                                <div className="h-full min-h-[300px] flex flex-col">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 flex items-center gap-2"><MapPin size={12} /> {text.location}</label>
                                  <div className="flex-1 rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner z-0">
                                    <MapContainer
                                      center={[parseFloat(r.latitude), parseFloat(r.longitude)]}
                                      zoom={15}
                                      style={{ height: '100%', width: '100%' }}
                                      scrollWheelZoom={false}
                                    >
                                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                      <Marker position={[parseFloat(r.latitude), parseFloat(r.longitude)]}>
                                        <Popup className="font-bold">{r.title}</Popup>
                                      </Marker>
                                    </MapContainer>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-bold text-sm italic">
                                  {text.noGps}
                                </div>
                              )}
                            </div>
                          </div>

                          {['en_attent', 'en_cours'].includes(r.status) && (
                            <div className="mt-10 flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                              <button
                                onClick={(e) => handleStatusUpdate(e, r.id, 'en_cours')}
                                disabled={saving || r.status === 'en_cours'}
                                className="flex-1 min-w-[150px] bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-50 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Clock size={18} /> {text.startProgress}
                              </button>
                              <button
                                onClick={(e) => handleStatusUpdate(e, r.id, 'terminee')}
                                disabled={saving}
                                className="flex-[1.5] min-w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <CheckCircle2 size={18} /> {text.markDone}
                              </button>
                              <button
                                onClick={(e) => openRefuseModal(e, r.id)}
                                disabled={saving}
                                className="flex-1 min-w-[180px] bg-red-50 border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <XCircle size={18} /> {text.refuse}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {refuseId && (
        <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6">
            <h3 className="text-xl font-black text-slate-900">{text.refuseTitle}</h3>
            <p className="text-sm text-slate-500 mt-2">{text.refuseHelp}</p>
            <textarea
              className="mt-4 w-full min-h-[150px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-red-400"
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder={text.refusePlaceholder}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                onClick={closeRefuseModal}
                disabled={saving}
              >
                {text.cancel}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                onClick={handleRefuse}
                disabled={saving}
              >
                {saving ? text.processing : text.confirmRefuse}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChefDashboard() {
  return (
    <Routes>
      <Route index element={<ChefOverview />} />
      <Route path="employees" element={<Employes />} />
      <Route path="*" element={<Navigate to="/chef" replace />} />
    </Routes>
  );
}
