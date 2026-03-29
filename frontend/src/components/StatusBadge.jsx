import { Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STATUS_MAP = {
  en_attent: { key: 'status.en_attent', cls: 'badge-pending', icon: Clock },
  en_cours: { key: 'status.en_cours', cls: 'badge-progress', icon: RefreshCw },
  traite: { key: 'status.traite', cls: 'badge-done', icon: CheckCircle },
  rejete: { key: 'status.rejete', cls: 'badge-rejected', icon: XCircle },
  terminee: { key: 'status.terminee', cls: 'badge-done', icon: CheckCircle },
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const map = STATUS_MAP[status] || { key: null, cls: 'badge-pending', icon: Clock };
  const IconComponent = map.icon;

  return (
    <span className={`badge ${map.cls} inline-flex items-center gap-1.5`}>
      <IconComponent size={14} className="inline-block" />
      <span>{map.key ? t(map.key) : status}</span>
    </span>
  );
}
