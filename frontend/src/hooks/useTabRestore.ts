import { useState, useCallback } from 'react';

/**
 * Persists the last active tab index per page key in sessionStorage.
 *
 * @param pageKey - Unique identifier for the page (e.g. "admin-donors", "volunteer-hours")
 * @param defaultTab - Default tab index if no persisted value exists
 * @returns [activeTab, setActiveTab] — use setActiveTab instead of raw setState
 */
export function useTabRestore(pageKey: string, defaultTab: number = 0): [number, (tab: number) => void] {
  const storageKey = `benetrack-tab-${pageKey}`;

  const [activeTab, setActiveTabState] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored !== null ? parseInt(stored, 10) : defaultTab;
    } catch {
      return defaultTab;
    }
  });

  const setActiveTab = useCallback((tab: number) => {
    setActiveTabState(tab);
    try {
      sessionStorage.setItem(storageKey, String(tab));
    } catch { /* ignore */ }
  }, [storageKey]);

  return [activeTab, setActiveTab];
}

export default useTabRestore;
