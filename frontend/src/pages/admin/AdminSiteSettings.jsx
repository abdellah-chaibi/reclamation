import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Building2, CheckCircle, ImagePlus, Loader2, LocateFixed, Mail, MapPin, Phone } from 'lucide-react';
import { siteSettingsService } from '../../services/api';
import { getCurrentLanguage, getLocalizedText } from '../../utils/localization';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import SiteLogo from '../../components/SiteLogo';

export default function AdminSiteSettings() {
  const { i18n } = useTranslation();
  const { settings, refreshSettings } = useSiteSettings();
  const language = getCurrentLanguage(i18n.language);
  const [form, setForm] = useState({
    municipality_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    maps_url: '',
    logo: null,
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const text = {
    title: getLocalizedText({ ar: 'إعدادات البلدية', fr: 'Parametres de la municipalite' }, language),
    subtitle: getLocalizedText({ ar: 'بدّل الهوية الأساسية ديال المنصة باش تخدم مع أي جماعة.', fr: 'Adaptez la plateforme a n importe quelle commune marocaine.' }, language),
    municipality: getLocalizedText({ ar: 'اسم البلدية', fr: 'Nom de la municipalite' }, language),
    email: getLocalizedText({ ar: 'البريد الإلكتروني', fr: 'Email' }, language),
    phone: getLocalizedText({ ar: 'رقم الهاتف', fr: 'Telephone' }, language),
    locateMunicipality: getLocalizedText({ ar: 'تحديد البلدية تلقائيا', fr: 'Localiser la municipalite' }, language),
    locating: getLocalizedText({ ar: 'جاري تحديد الموقع...', fr: 'Localisation...' }, language),
    locationHint: getLocalizedText({ ar: 'كتب غير اسم البلدية ومن بعد استعمل هاد الزر باش يتعمر العنوان والخريطة تلقائيا.', fr: 'Saisissez seulement le nom de la municipalite puis utilisez ce bouton pour remplir automatiquement l adresse et la carte.' }, language),
    municipalityRequiredForLocation: getLocalizedText({ ar: 'كتب اسم البلدية أولا.', fr: 'Saisissez d abord le nom de la municipalite.' }, language),
    locationFailed: getLocalizedText({ ar: 'ما قدرناش نحددو موقع هاد البلدية. جرب اسم أوضح.', fr: 'Impossible de localiser cette municipalite. Essayez un nom plus precis.' }, language),
    locationReady: getLocalizedText({ ar: 'تم تحديد العنوان والخريطة تلقائيا.', fr: 'Adresse et carte detectees automatiquement.' }, language),
    logo: getLocalizedText({ ar: 'شعار البلدية', fr: 'Logo municipal' }, language),
    save: getLocalizedText({ ar: 'حفظ التغييرات', fr: 'Enregistrer' }, language),
    saving: getLocalizedText({ ar: 'جاري الحفظ...', fr: 'Enregistrement...' }, language),
    success: getLocalizedText({ ar: 'تم تحديث معلومات البلدية بنجاح.', fr: 'Les informations de la municipalite ont ete mises a jour.' }, language),
    failed: getLocalizedText({ ar: 'تعذر حفظ الإعدادات.', fr: "Impossible d enregistrer les parametres." }, language),
    hint: getLocalizedText({ ar: 'هاد المعطيات كيبانو فالفوتر والهوية ديال الموقع.', fr: 'Ces informations sont utilisees dans le footer et l identite du site.' }, language),
    uploadHint: getLocalizedText({ ar: 'PNG/JPG حتى 2MB', fr: 'PNG/JPG jusqu a 2MB' }, language),
  };

  useEffect(() => {
    setForm({
      municipality_name: settings.municipality_name || '',
      email: settings.email || '',
      phone: settings.phone || '',
      address_line_1: settings.address_line_1 || '',
      address_line_2: settings.address_line_2 || '',
      maps_url: settings.maps_url || '',
      logo: null,
    });
    setPreview(settings.logo_url || '');
  }, [settings]);

  useEffect(() => {
    if (!success && !error) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, logo: file }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(settings.logo_url || '');
    }
  };

  const normalizeQuery = (value) =>
    value
      .replace(/commune|municipalit[eé]|municipality/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

  const searchMunicipality = async (query) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=ma&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const results = await response.json();
    return Array.isArray(results) ? results[0] : null;
  };

  const applyMatch = (match, fallback) => {
    const address = match.address || {};
    const addressLine1 = [address.road, address.suburb || address.neighbourhood].filter(Boolean).join(', ');
    const addressLine2 = [
      address.city || address.town || address.village || address.municipality || fallback,
      address.state || address.region,
    ].filter(Boolean).join(', ');

    setForm((current) => ({
      ...current,
      address_line_1: addressLine1 || current.address_line_1 || fallback,
      address_line_2: addressLine2 || current.address_line_2 || 'Maroc',
      maps_url: `https://www.google.com/maps/search/?api=1&query=${match.lat},${match.lon}`,
    }));
    setSuccess(text.locationReady);
  };

  const handleLocateMunicipality = async () => {
    const rawQuery = form.municipality_name.trim();

    if (!rawQuery) {
      setError(text.municipalityRequiredForLocation);
      return;
    }

    setLocationLoading(true);
    setSuccess('');
    setError('');

    try {
      let match = await searchMunicipality(rawQuery);
      if (!match) {
        const cleaned = normalizeQuery(rawQuery) || rawQuery;
        match = await searchMunicipality(cleaned);
        if (!match) {
          throw new Error('municipality_not_found');
        }
        applyMatch(match, cleaned);
      } else {
        applyMatch(match, rawQuery);
      }
    } catch (_) {
      setError(text.locationFailed);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const payload = new FormData();
    payload.append('municipality_name', form.municipality_name);
    payload.append('email', form.email);
    payload.append('phone', form.phone);
    payload.append('address_line_1', form.address_line_1);
    payload.append('address_line_2', form.address_line_2);
    payload.append('maps_url', form.maps_url);

    if (form.logo) {
      payload.append('logo', form.logo);
    }

    try {
      await siteSettingsService.update(payload);
      await refreshSettings();
      setForm((current) => ({ ...current, logo: null }));
      setSuccess(text.success);
    } catch (err) {
      setError(err?.response?.data?.message || text.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8">
        <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
          <Building2 className="text-blue-600" size={28} />
          {text.title}
        </h2>
        <p className="text-sm font-medium text-slate-500">{text.subtitle}</p>
      </div>

      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {error ? <div className="pointer-events-auto flex items-center gap-3 rounded-lg border-l-4 border-red-500 bg-white p-4 font-bold text-red-700 shadow-2xl"><AlertCircle size={18} /> {error}</div> : null}
        {success ? <div className="pointer-events-auto flex items-center gap-3 rounded-lg border-l-4 border-emerald-500 bg-white p-4 font-bold text-emerald-700 shadow-2xl"><CheckCircle size={18} /> {success}</div> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-medium text-blue-700">
            {text.hint}
          </div>

          <div className="grid gap-5">
            <Field
              icon={Building2}
              label={text.municipality}
              name="municipality_name"
              value={form.municipality_name}
              onChange={handleChange}
            />

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-sm font-semibold leading-6 text-emerald-800">{text.locationHint}</p>
              <button
                type="button"
                onClick={handleLocateMunicipality}
                disabled={locationLoading || loading}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md shadow-emerald-100 transition hover:bg-emerald-700 disabled:bg-slate-400"
              >
                {locationLoading ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
                {locationLoading ? text.locating : text.locateMunicipality}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-slate-400" size={18} />
                <div className="text-sm">
                  <p className="font-bold text-slate-700">{form.address_line_1 || settings.address_line_1 || form.municipality_name}</p>
                  <p className="mt-1 text-slate-500">{form.address_line_2 || settings.address_line_2 || 'Maroc'}</p>
                </div>
              </div>
            </div>

            <Field
              icon={Mail}
              label={text.email}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Field
              icon={Phone}
              label={text.phone}
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{text.logo}</label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50/40">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-3 text-slate-500 shadow-sm">
                    <ImagePlus size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{text.logo}</p>
                    <p className="text-xs font-medium text-slate-400">{text.uploadHint}</p>
                  </div>
                </div>
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleLogoChange} />
                <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Upload</span>
              </label>
            </div>
          </div>

          <div className="mt-8">
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 disabled:bg-slate-400">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {loading ? text.saving : text.save}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Preview</p>
          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
                <SiteLogo src={preview} alt={form.municipality_name} className="max-h-14 w-auto object-contain" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">{form.municipality_name || settings.municipality_name}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{form.email || settings.email}</p>
                <p className="text-sm font-medium text-slate-500">{form.phone || settings.phone}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">{form.address_line_1 || settings.address_line_1}</p>
                <p className="text-sm font-medium text-slate-500">{form.address_line_2 || settings.address_line_2}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, name, type = 'text', value, onChange, required = true }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 text-slate-300" size={16} />
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-blue-400"
        />
      </div>
    </div>
  );
}
