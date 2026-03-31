import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { reclamationService, departementService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import PaginationControls from '../components/PaginationControls';
import { formatLocalizedDate, translateDepartmentName } from '../utils/localization';
import {
  Plus, X, MapPin, Paperclip, Send, Building2,
  Calendar, AlertCircle, CheckCircle2, FileText,
  Image as ImageIcon, Video, RefreshCw, Lock
} from 'lucide-react';

const emptyForm = {
  title: '',
  content: '',
  latitude: '',
  longitude: '',
  departement_id: '',
  media: null,
};

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

export default function ReclamationPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [reclamations, setReclamations] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(reclamations.length / itemsPerPage);
  const currentItems = reclamations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const groupedReclamations = groupReclamationsByDate(currentItems, i18n.language);

  const fetchData = async () => {
    setLoadingList(true);
    try {
      const [rRes, dRes] = await Promise.all([
        reclamationService.getAll(),
        departementService.getAll(),
      ]);
      const all = rRes.data?.data || rRes.data || [];
      setReclamations(Array.isArray(all) ? all.filter((item) => item.user_id === user?.id) : []);
      const depts = dRes.data?.data || dRes.data || [];
      setDepartements(Array.isArray(depts) ? depts : []);
    } catch {
      setErrorMsg(t('reclamations.messages.loadError'));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, media: file }));
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, media: '' }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(t('reclamations.messages.geoUnsupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrors((prev) => ({ ...prev, latitude: '', longitude: '' }));
      },
      () => setErrorMsg(t('reclamations.messages.geoFailed'))
    );
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = t('reclamations.form.errors.titleRequired');
    if (!form.content.trim()) nextErrors.content = t('reclamations.form.errors.contentRequired');
    if (!form.departement_id) nextErrors.departement_id = t('reclamations.form.errors.departmentRequired');
    if (!form.latitude) nextErrors.latitude = t('reclamations.form.errors.locationRequired');
    if (!form.media) nextErrors.media = t('reclamations.form.errors.mediaRequired');
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('departement_id', form.departement_id);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('user_id', user.id);

      if (form.media) {
        formData.append('media[]', form.media);
      }

      await reclamationService.createWithMedia(formData);
      setSuccessMsg(t('reclamations.messages.submitSuccess'));
      setForm(emptyForm);
      setPreviewUrl(null);
      setShowForm(false);
      setCurrentPage(1);
      fetchData();
    } catch {
      setErrorMsg(t('reclamations.messages.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('reclamations.title')}</h1>
          <p className="text-slate-500 font-medium">{t('reclamations.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
            }`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? t('common.cancel') : t('reclamations.new')}
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
          <CheckCircle2 size={20} /> <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} /> <span className="font-bold text-sm">{errorMsg}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-2xl mb-12 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('reclamations.form.titleLabel')}</label>
                <input
                  name="title"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder={t('reclamations.form.titlePlaceholder')}
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && <p className="text-red-500 text-xs font-bold mt-1">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('reclamations.form.contentLabel')}</label>
                <textarea
                  name="content"
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder={t('reclamations.form.contentPlaceholder')}
                  value={form.content}
                  onChange={handleChange}
                />
                {errors.content && <p className="text-red-500 text-xs font-bold mt-1">{errors.content}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('reclamations.form.departmentLabel')}</label>
                <select
                  name="departement_id"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all appearance-none"
                  value={form.departement_id}
                  onChange={handleChange}
                >
                  <option value="">{t('reclamations.form.departmentPlaceholder')}</option>
                  {departements.map((dept) => <option key={dept.id} value={dept.id}>{translateDepartmentName(dept.name, i18n.language)}</option>)}
                </select>
                {errors.departement_id && <p className="text-red-500 text-xs font-bold mt-1">{errors.departement_id}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('reclamations.form.mediaLabel')}</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="relative group h-48 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
                >
                  {previewUrl ? (
                    form.media?.type.startsWith('video') ? (
                      <video src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    )
                  ) : (
                    <>
                      <div className="flex gap-2 text-slate-300 mb-2">
                        <ImageIcon size={32} /> <Video size={32} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500">{t('reclamations.form.mediaPlaceholder')}</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" multiple hidden accept="image/*,video/*" onChange={handleFileChange} />
                </div>
                {errors.media && <p className="text-red-500 text-xs font-bold mt-1">{errors.media}</p>}
              </div>

              <div className="bg-white-900 rounded-[2rem] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-700 ml-1">{t('reclamations.form.gpsLabel')}</span>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2 font-bold"
                  >
                    <MapPin size={14} /> {t('reclamations.form.detect')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">{form.latitude || '0.0000'}</span>
                    <Lock size={14} className="text-slate-600" title={t('reclamations.form.locked')} />
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">{form.longitude || '0.0000'}</span>
                    <Lock size={14} className="text-slate-600" title={t('reclamations.form.locked')} />
                  </div>
                </div>
                {errors.latitude && <p className="text-red-400 text-[10px] font-bold mt-2 uppercase tracking-tighter">{errors.latitude}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 transition-all"
              >
                {submitting ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                {t('reclamations.form.submit')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadingList ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : reclamations.length === 0 ? (
        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="font-bold text-slate-400">{t('reclamations.empty')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedReclamations).map(([dateLabel, items]) => (
            <section key={dateLabel} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{dateLabel}</h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {items.map((reclamation) => (
                  <div key={reclamation.id} className="group bg-white border border-slate-200 p-6 md:p-8 rounded-[2.5rem] hover:shadow-xl hover:border-blue-100 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900">{reclamation.title}</h3>
                          <StatusBadge status={reclamation.status} />
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{reclamation.content}</p>

                        {reclamation.status === 'rejete' && reclamation.refusal_reason && (
                          <div className="max-w-2xl bg-red-50 border border-red-100 rounded-2xl p-4">
                            <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">
                              {t('reclamations.refusalReason')}
                            </p>
                            <p className="text-red-700 text-sm font-medium leading-relaxed">
                              {reclamation.refusal_reason}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                            <Building2 size={14} /> {translateDepartmentName(reclamation.departement?.name, i18n.language) || t('reclamations.general')}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                            <Calendar size={14} /> {formatLocalizedDate(reclamation.created_at, i18n.language)}
                          </div>
                          {reclamation.latitude && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg">
                              <MapPin size={14} /> {t('reclamations.localized')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex md:flex-col justify-end gap-2">
                        {reclamation.medias?.map((media) => (
                          <a
                            key={media.id}
                            href={`http://localhost:8000/storage/${media.path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative h-24 w-full md:w-32 rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                          >
                            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                              <Paperclip className="text-white" size={16} />
                            </div>
                            <img src={`http://localhost:8000/storage/${media.path}`} className="w-full h-full object-cover" alt="PJ" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!loadingList && reclamations.length > 0 && (
        <div className="mt-8">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={reclamations.length}
            onPageChange={setCurrentPage}
            labels={{
              page: t('common.page', 'Page'),
              of: t('common.of', 'sur'),
              results: t('common.results', 'resultats'),
              previous: t('common.previous', 'Precedent'),
              next: t('common.next', 'Suivant'),
            }}
            className="rounded-[2rem] border border-slate-200 bg-white shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
