import fallbackLogo from './../assets/Logo.png';

export default function SiteLogo({ src, alt, className }) {
  return (
    <img
      src={src || fallbackLogo}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackLogo;
      }}
    />
  );
}
