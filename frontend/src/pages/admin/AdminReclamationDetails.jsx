import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  MapPin,
  Paperclip,
  Route,
  ShieldAlert,
  TimerReset,
  User,
} from 'lucide-react';
import { reclamationService, userService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  getCurrentLanguage,
  getLocalizedText,
  translateDepartmentName,
} from '../../utils/localization';

const BACKEND_STORAGE_URL = 'http://localhost:8000/storage';

function InfoCard({ icon: Icon, label, value, tone = 'slate' }) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`rounded-3xl border p-5 ${toneClasses[tone] || toneClasses.slate}`}>
      <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-sm font-semibold leading-relaxed">{value || '-'}</div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children, aside }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <Icon size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function TimelineStep({ icon: Icon, title, subtitle, date, active = false, done = false, last = false, tone = 'slate' }) {
  const tones = {
    slate: {
      chip: 'border-slate-200 bg-slate-50 text-slate-600',
      line: 'bg-slate-200',
    },
    blue: {
      chip: 'border-blue-200 bg-blue-50 text-blue-700',
      line: 'bg-blue-200',
    },
    emerald: {
      chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      line: 'bg-emerald-200',
    },
    red: {
      chip: 'border-red-200 bg-red-50 text-red-700',
      line: 'bg-red-200',
    },
  };

  const palette = tones[tone] || tones.slate;

  return (
    <div className="relative flex gap-4">
      <div className="relative flex w-12 shrink-0 justify-center">
        {!last && <div className={`absolute top-12 h-[calc(100%-1rem)] w-px ${palette.line}`} />}
        <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border ${palette.chip} ${active ? 'ring-4 ring-blue-100' : ''}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className={`flex-1 rounded-3xl border p-5 ${palette.chip}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.14em]">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{subtitle}</p>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">
            {done ? date : '...'}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value, language) {
  if (!value) return '-';
  const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';
  return new Date(value).toLocaleString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminReclamationDetails() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const [reclamation, setReclamation] = useState(null);
  const [assignedEmployeeName, setAssignedEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const language = getCurrentLanguage(i18n.language);
  const text = useMemo(() => ({
    back: getLocalizedText({ ar: 'الرجوع إلى الشكايات', fr: 'Retour aux reclamations' }, language),
    title: getLocalizedText({ ar: 'تفاصيل تتبع الشكاية', fr: 'Details du suivi de la reclamation' }, language),
    subtitle: getLocalizedText(
      { ar: 'عرض جميع المعلومات الخاصة بالشكاية وتتبع معالجتها.', fr: 'Consultez toutes les informations de la reclamation et son suivi.' },
      language,
    ),
    loadError: getLocalizedText({ ar: 'تعذر تحميل تفاصيل الشكاية.', fr: 'Impossible de charger les details de la reclamation.' }, language),
    notFound: getLocalizedText({ ar: 'الشكاية غير موجودة.', fr: 'Reclamation introuvable.' }, language),
    reclamationInfo: getLocalizedText({ ar: 'معلومات الشكاية', fr: 'Informations reclamation' }, language),
    citizenInfo: getLocalizedText({ ar: 'معلومات صاحب الشكاية', fr: 'Coordonnées du requérant' }, language),
    attachedMedia: getLocalizedText({ ar: 'الملفات المرفقة', fr: 'Pieces jointes' }, language),
    noMedia: getLocalizedText({ ar: 'لا توجد ملفات مرفقة.', fr: 'Aucune piece jointe.' }, language),
    history: getLocalizedText({ ar: 'سجل التتبع', fr: 'Historique du suivi' }, language),
    historySubtitle: getLocalizedText(
      { ar: 'تتبع المراحل الأساسية لمعالجة هذه الشكاية.', fr: 'Suivez les principales etapes de traitement de cette reclamation.' },
      language,
    ),
    reclamationId: getLocalizedText({ ar: 'رقم الشكاية', fr: 'ID reclamation' }, language),
    citizen: getLocalizedText({ ar: 'صاحب الشكاية', fr: 'Citoyen' }, language),
    responsibleEmployee: getLocalizedText({ ar: 'الموظف المسؤول', fr: 'Employe responsable' }, language),
    email: getLocalizedText({ ar: 'البريد الإلكتروني', fr: 'Email' }, language),
    cin: getLocalizedText({ ar: 'البطاقة الوطنية', fr: 'CIN' }, language),
    role: getLocalizedText({ ar: 'الدور', fr: 'Role' }, language),
    department: getLocalizedText({ ar: 'القسم', fr: 'Departement' }, language),
    status: getLocalizedText({ ar: 'الحالة', fr: 'Statut' }, language),
    createdAt: getLocalizedText({ ar: 'تاريخ الإنشاء', fr: 'Date de creation' }, language),
    updatedAt: getLocalizedText({ ar: 'آخر تحديث', fr: 'Derniere mise a jour' }, language),
    location: getLocalizedText({ ar: 'الموقع', fr: 'Localisation' }, language),
    description: getLocalizedText({ ar: 'الوصف', fr: 'Description' }, language),
    refusalReason: getLocalizedText({ ar: 'سبب الرفض', fr: 'Motif du refus' }, language),
    unassigned: getLocalizedText({ ar: 'غير معين', fr: 'Non assigne' }, language),
    unavailable: getLocalizedText({ ar: 'غير متوفر', fr: 'Non disponible' }, language),
    openMedia: getLocalizedText({ ar: 'فتح الملف', fr: 'Ouvrir le fichier' }, language),
    employeeUnavailable: getLocalizedText(
      { ar: 'غير محدد في النظام الحالي', fr: 'Non trouve dans le systeme actuel' },
      language,
    ),
    rejectedNotice: getLocalizedText(
      { ar: 'تم رفض هذه الشكاية وإغلاقها.', fr: 'Cette reclamation a ete rejetee puis cloturee.' },
      language,
    ),
    submittedStep: getLocalizedText({ ar: 'المرحلة 1: تم الإيداع', fr: 'Etape 1 : Soumise' }, language),
    processingStep: getLocalizedText({ ar: 'المرحلة 2: قيد المعالجة', fr: 'Etape 2 : En cours de traitement' }, language),
    resolvedStep: getLocalizedText({ ar: 'المرحلة 3: محلولة / مغلقة', fr: 'Etape 3 : Resolue / Cloturee' }, language),
    rejectedStep: getLocalizedText({ ar: 'المرحلة 3: مرفوضة / مغلقة', fr: 'Etape 3 : Rejetee / Cloturee' }, language),
    submittedDesc: getLocalizedText(
      { ar: 'تم إنشاء الشكاية وإرسالها من طرف المواطن.', fr: 'La reclamation a ete creee et envoyee par le citoyen.' },
      language,
    ),
    processingDesc: getLocalizedText(
      { ar: 'تم توجيه الشكاية إلى القسم المختص وتعيين الموظف المسؤول.', fr: "La reclamation a ete orientee vers le service concerne et affectee a l'employe responsable." },
      language,
    ),
    inProgressDesc: getLocalizedText(
      { ar: 'الشكاية قيد المعالجة حاليا داخل القسم المختص من طرف الموظف المسؤول.', fr: "La reclamation est en cours de traitement dans le service concerne par l'employe responsable." },
      language,
    ),
    resolvedDesc: getLocalizedText(
      { ar: 'تم إنهاء معالجة الشكاية وإغلاقها.', fr: 'La reclamation a ete resolue et cloturee.' },
      language,
    ),
    rejectedDesc: getLocalizedText(
      { ar: 'تم رفض الشكاية ثم إغلاقها.', fr: 'La reclamation a ete rejetee puis cloturee.' },
      language,
    ),
    pendingDesc: getLocalizedText(
      { ar: 'هذه المرحلة لم تصلها الشكاية بعد.', fr: "Cette etape n'a pas encore ete atteinte." },
      language,
    ),
    overview: getLocalizedText({ ar: 'نظرة عامة', fr: 'Vue d ensemble' }, language),
    currentStage: getLocalizedText({ ar: 'المرحلة الحالية', fr: 'Etat actuel' }, language),
    lastActivity: getLocalizedText({ ar: 'آخر نشاط', fr: 'Derniere activite' }, language),
  }), [language]);

  useEffect(() => {
    let active = true;

    const fetchReclamation = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await reclamationService.getById(id);
        const item = response.data?.data || response.data;

        if (!active) return;

        if (!item) {
          setError(text.notFound);
          setReclamation(null);
          return;
        }

        setReclamation(item);
      } catch {
        if (active) {
          setError(text.loadError);
          setReclamation(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchReclamation();

    return () => {
      active = false;
    };
  }, [id, text.loadError, text.notFound]);

  useEffect(() => {
    let active = true;

    const resolveAssignedEmployee = async () => {
      if (reclamation?.assigned_employee?.name) {
        setAssignedEmployeeName(reclamation.assigned_employee.name);
        return;
      }

      if (!reclamation?.assigned_to) {
        setAssignedEmployeeName('');
        return;
      }

      try {
        const response = await userService.getById(reclamation.assigned_to);
        const user = response.data?.data || response.data;

        if (active) {
          setAssignedEmployeeName(user?.name || '');
        }
      } catch {
        if (active) {
          setAssignedEmployeeName('');
        }
      }
    };

    resolveAssignedEmployee();

    return () => {
      active = false;
    };
  }, [reclamation]);

  const citizen = reclamation?.user;
  const departmentName = translateDepartmentName(reclamation?.departement?.name, language) || text.unassigned;
  const coordinates = reclamation?.latitude && reclamation?.longitude
    ? `${reclamation.latitude}, ${reclamation.longitude}`
    : text.unavailable;
  const responsibleEmployee = assignedEmployeeName || reclamation?.assigned_employee?.name || text.employeeUnavailable;
  const isResolved = reclamation?.status === 'terminee';
  const isRejected = reclamation?.status === 'rejete';
  const isInProgress = reclamation?.status === 'en_cours';
  const hasAssignment = Boolean(reclamation?.departement_id);
  const stageLabel = isRejected
    ? text.rejectedStep
    : isResolved
      ? text.resolvedStep
      : isInProgress
        ? text.processingStep
        : text.submittedStep;
  const timeline = [
    {
      icon: Clock3,
      title: text.submittedStep,
      subtitle: `${text.submittedDesc} ${formatDateTime(reclamation?.created_at, language)}`,
      date: formatDateTime(reclamation?.created_at, language),
      done: true,
      active: !hasAssignment && !isInProgress && !isResolved && !isRejected,
      tone: 'blue',
    },
    {
      icon: TimerReset,
      title: text.processingStep,
      subtitle: isInProgress
        ? `${text.inProgressDesc} ${departmentName}. ${text.responsibleEmployee}: ${responsibleEmployee}.`
        : hasAssignment
          ? `${text.processingDesc} ${departmentName}. ${text.responsibleEmployee}: ${responsibleEmployee}.`
          : text.pendingDesc,
      date: hasAssignment || isInProgress || isResolved || isRejected
        ? formatDateTime(reclamation?.updated_at || reclamation?.created_at, language)
        : '-',
      done: hasAssignment || isInProgress || isResolved || isRejected,
      active: isInProgress,
      tone: isInProgress ? 'blue' : 'slate',
    },
    {
      icon: CheckCircle2,
      title: isRejected ? text.rejectedStep : text.resolvedStep,
      subtitle: isRejected
        ? `${text.rejectedDesc}${reclamation?.refusal_reason ? ` ${reclamation.refusal_reason}` : ''}`
        : isResolved
          ? text.resolvedDesc
          : text.pendingDesc,
      date: isResolved || isRejected ? formatDateTime(reclamation?.updated_at, language) : '-',
      done: isResolved || isRejected,
      active: isResolved || isRejected,
      tone: isRejected ? 'red' : isResolved ? 'emerald' : 'slate',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/reclamations"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          {text.back}
        </Link>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-3 font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            to="/admin/reclamations"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            {text.back}
          </Link>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{text.title}</h1>
            <p className="text-sm font-medium text-slate-500">{text.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{text.reclamationId}</p>
            <p className="text-lg font-black text-slate-900">#{reclamation.id}</p>
          </div>
          <StatusBadge status={reclamation.status} />
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-6">
          <SectionCard
            icon={FileText}
            title={text.reclamationInfo}
            aside={<StatusBadge status={reclamation.status} />}
          >
            <div className="space-y-5">
              {isRejected && (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="text-sm font-bold text-red-700">{text.rejectedNotice}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{text.description}</p>
                <h3 className="mb-3 text-2xl font-black text-slate-900">{reclamation.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{reclamation.content || text.unavailable}</p>
              </div>

              {reclamation.refusal_reason && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                    <ShieldAlert size={14} />
                    {text.refusalReason}
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-red-700">{reclamation.refusal_reason}</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={Route}
            title={text.history}
            aside={<p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{text.currentStage}: {stageLabel}</p>}
          >
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <InfoCard icon={Route} label={text.currentStage} value={stageLabel} tone="blue" />
              <InfoCard icon={Calendar} label={text.lastActivity} value={formatDateTime(reclamation.updated_at, language)} />
              <InfoCard icon={User} label={text.responsibleEmployee} value={responsibleEmployee} tone={isRejected ? 'red' : 'slate'} />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-500">{text.historySubtitle}</p>
            </div>

            <div className="space-y-5">
              {timeline.map((step, index) => (
                <TimelineStep
                  key={step.title}
                  icon={step.icon}
                  title={step.title}
                  subtitle={step.subtitle}
                  date={step.date}
                  done={step.done}
                  active={step.active}
                  tone={step.tone}
                  last={index === timeline.length - 1}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Paperclip} title={text.attachedMedia}>

            {reclamation.medias?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {reclamation.medias.map((media) => {
                  const mediaUrl = `${BACKEND_STORAGE_URL}/${media.path}`;
                  return (
                    <a
                      key={media.id}
                      href={mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
                        <img
                          src={mediaUrl}
                          alt={media.name || text.openMedia}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="truncate text-sm font-bold text-slate-800">{media.name || text.openMedia}</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">{text.openMedia}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-400">
                {text.noMedia}
              </div>
            )}
          </SectionCard>
        </section>

        <aside className="space-y-6">
          <SectionCard icon={User} title={text.citizenInfo}>
            <div className="grid gap-4">
              <InfoCard icon={User} label={text.citizen} value={citizen?.name || text.unavailable} />
              <InfoCard icon={Hash} label={text.email} value={citizen?.email || text.unavailable} />
              <InfoCard icon={Hash} label={text.cin} value={citizen?.cin || text.unavailable} />
              {/* <InfoCard icon={User} label={text.role} value={citizen?.role || text.unavailable} /> */}
              {/* <InfoCard icon={User} label={text.responsibleEmployee} value={responsibleEmployee} tone={isRejected ? 'red' : 'slate'} /> */}
            </div>
          </SectionCard>

          <SectionCard icon={Building2} title={text.overview}>
            <div className="grid gap-4">
              <InfoCard icon={Building2} label={text.department} value={departmentName} tone="blue" />
              <InfoCard icon={Calendar} label={text.createdAt} value={formatDateTime(reclamation.created_at, language)} />
              <InfoCard icon={Calendar} label={text.updatedAt} value={formatDateTime(reclamation.updated_at, language)} />
              <InfoCard icon={MapPin} label={text.location} value={coordinates} />
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{text.status}</div>
                <StatusBadge status={reclamation.status} />
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
