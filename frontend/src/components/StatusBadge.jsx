const STATUS_MAP = {
  en_attent: { label: 'En Attente', cls: 'badge-pending',  icon: '⏳' },
  en_cours:  { label: 'En Cours',   cls: 'badge-progress', icon: '🔄' },
  traite:    { label: 'Traité',     cls: 'badge-done',     icon: '✅' },
  rejete:    { label: 'Rejeté',    cls: 'badge-rejected',  icon: '❌' },
};

export default function StatusBadge({ status }) {
  const map = STATUS_MAP[status] || { label: status, cls: 'badge-pending', icon: '⏳' };
  return (
    <span className={`badge ${map.cls}`}>
      {map.icon} {map.label}
    </span>
  );
}
