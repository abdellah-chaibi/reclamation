import { Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const STATUS_MAP = {
  en_attent: { label: 'En Attente', cls: 'badge-pending', icon: Clock },
  en_cours:  { label: 'En Cours',   cls: 'badge-progress', icon: RefreshCw },
  traite:    { label: 'Traité',     cls: 'badge-done',     icon: CheckCircle },
  rejete:    { label: 'Rejeté',     cls: 'badge-rejected',  icon: XCircle },
  // optional: if your backend uses "terminee", add an alias
  terminee:  { label: 'Terminée',   cls: 'badge-done',     icon: CheckCircle },
};

export default function StatusBadge({ status }) {
  const map = STATUS_MAP[status] || { label: status, cls: 'badge-pending', icon: Clock };
  const IconComponent = map.icon;
  return (
    <span className={`badge ${map.cls} inline-flex items-center gap-1.5`}>
      <IconComponent size={14} className="inline-block" />
      <span>{map.label}</span>
    </span>
  );
}