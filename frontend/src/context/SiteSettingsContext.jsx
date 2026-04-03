import { createContext, useContext, useEffect, useState } from 'react';
import { siteSettingsService } from '../services/api';

const SiteSettingsContext = createContext(null);

const fallbackSettings = {
  municipality_name: 'Commune Territoriale',
  email: 'contact@commune.ma',
  phone: '+212 5 00 00 00 00',
  logo_url: null,
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(fallbackSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const response = await siteSettingsService.get();
      setSettings({
        ...fallbackSettings,
        ...response.data,
      });
    } catch (_) {
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }

  return context;
}
