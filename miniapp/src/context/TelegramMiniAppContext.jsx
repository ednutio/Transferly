import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyTelegramTheme,
  configureClosingConfirmation,
  configureTelegramMainButton,
  configureTelegramSettingsButton,
  configureVerticalSwipe,
  getTelegramStartParam,
  getTelegramUser,
  getTelegramWebApp,
  initializeTelegramMiniApp,
  triggerTelegramImpact,
  triggerTelegramNotification
} from '../lib/telegramMiniApp';

const TelegramMiniAppContext = createContext(null);
const HAPTICS_STORAGE_KEY = 'transferly_miniapp_haptics_enabled';

function readStoredBoolean(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  if (stored === null) {
    return fallback;
  }

  return stored === 'true';
}

export function TelegramMiniAppProvider({ children }) {
  const [state, setState] = useState(() => ({
    webApp: null,
    available: false,
    theme: {},
    user: null,
    startParam: '',
    hapticsEnabled: readStoredBoolean(HAPTICS_STORAGE_KEY, true),
    viewport: {
      height: typeof window === 'undefined' ? 0 : window.innerHeight,
      stableHeight: typeof window === 'undefined' ? 0 : window.innerHeight,
      isExpanded: false
    }
  }));

  useEffect(() => {
    const initialized = initializeTelegramMiniApp();
    const webApp = initialized.webApp;

    setState((previous) => ({
      ...previous,
      ...initialized,
      viewport: {
        height: webApp?.viewportHeight || previous.viewport.height,
        stableHeight: webApp?.viewportStableHeight || previous.viewport.stableHeight,
        isExpanded: Boolean(webApp?.isExpanded)
      }
    }));

    if (!webApp) {
      return undefined;
    }

    const handleThemeChanged = () => {
      const theme = applyTelegramTheme(webApp.themeParams);
      setState((previous) => ({ ...previous, theme }));
    };

    const handleViewportChanged = () => {
      setState((previous) => ({
        ...previous,
        viewport: {
          height: webApp.viewportHeight || previous.viewport.height,
          stableHeight: webApp.viewportStableHeight || previous.viewport.stableHeight,
          isExpanded: Boolean(webApp.isExpanded)
        }
      }));
    };

    webApp.onEvent?.('themeChanged', handleThemeChanged);
    webApp.onEvent?.('viewportChanged', handleViewportChanged);

    return () => {
      webApp.offEvent?.('themeChanged', handleThemeChanged);
      webApp.offEvent?.('viewportChanged', handleViewportChanged);
    };
  }, []);

  const refresh = useCallback(() => {
    const webApp = getTelegramWebApp();
    const theme = applyTelegramTheme(webApp?.themeParams);

    setState((previous) => ({
      ...previous,
      webApp,
      available: Boolean(webApp),
      theme,
      user: getTelegramUser(webApp),
      startParam: getTelegramStartParam(webApp),
      viewport: {
        height: webApp?.viewportHeight || previous.viewport.height,
        stableHeight: webApp?.viewportStableHeight || previous.viewport.stableHeight,
        isExpanded: Boolean(webApp?.isExpanded)
      }
    }));
  }, []);

  const setHapticsEnabled = useCallback((enabled) => {
    const nextValue = Boolean(enabled);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HAPTICS_STORAGE_KEY, String(nextValue));
    }

    setState((previous) => ({
      ...previous,
      hapticsEnabled: nextValue
    }));
  }, []);

  const value = useMemo(() => ({
    ...state,
    refresh,
    setHapticsEnabled,
    configureClosingConfirmation: (enabled) => configureClosingConfirmation(state.webApp, enabled),
    configureMainButton: (options) => configureTelegramMainButton(state.webApp, options),
    configureSettingsButton: (options) => configureTelegramSettingsButton(state.webApp, options),
    configureVerticalSwipe: (enabled) => configureVerticalSwipe(state.webApp, enabled),
    impact: (style) => {
      if (state.hapticsEnabled) {
        triggerTelegramImpact(style);
      }
    },
    notify: (type) => {
      if (state.hapticsEnabled) {
        triggerTelegramNotification(type);
      }
    }
  }), [refresh, setHapticsEnabled, state]);

  return (
    <TelegramMiniAppContext.Provider value={value}>
      {children}
    </TelegramMiniAppContext.Provider>
  );
}

export function useTelegramMiniApp() {
  const context = useContext(TelegramMiniAppContext);
  if (!context) {
    throw new Error('useTelegramMiniApp must be used inside TelegramMiniAppProvider');
  }

  return context;
}
