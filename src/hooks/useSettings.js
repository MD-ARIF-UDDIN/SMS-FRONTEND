import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const LOCAL_KEY = 'madrasa_settings';

const DEFAULT_SETTINGS = {
  madrasaNameBn: 'রংগিয়াঘোনা মনছুরিয়া ফাযিল (ডিগ্রী) মাদ্রাসা',
  madrasaNameEn: 'Rongiyaghona Monsuria Fazil (Degree) Madrasah',
  eiinNumber: '১৩২৪৫৬',
  email: 'info@aljamia.edu.bd',
  phone: '০১৮০০-০০০-০০০',
  altPhone: '০১৭০০-০০০-০০০',
  address: 'রংগিয়াঘোনা, বাঁশখালী, চট্টগ্রাম, বাংলাদেশ',
  establishedYear: '১৯৮৫',
  currentSession: '২০২৬-২০২৭',
  currencySymbol: '৳',
  passMarks: '৩৩',
  maxGpa: '৫.০০',
  receiptTitle: 'অফিশিয়াল মানি রসিদ',
  slogan: 'দ্বীনি শিক্ষা ও সুন্নাহ ভিত্তিক আদর্শ চরিত্র গঠন',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_KEY);
      return cached ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('madrasa_settings')
        .select('settings')
        .eq('id', 1)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data?.settings) {
        const merged = { ...DEFAULT_SETTINGS, ...data.settings };
        setSettings(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      }
    } catch (err) {
      console.error('useSettings fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (newSettings) => {
    try {
      const { error: dbError } = await supabase
        .from('madrasa_settings')
        .upsert(
          {
            id: 1,
            settings: newSettings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (dbError) throw dbError;

      localStorage.setItem(LOCAL_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      return { success: true };
    } catch (err) {
      console.error('useSettings save error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return { settings, loading, error, saveSettings, refetch: fetchSettings };
}
