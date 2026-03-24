export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="full-page">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div className="spinner-wrap">
      <div className="spinner"></div>
    </div>
  );
}
