const THEME_KEYS = {
  bg_color: '--tg-bg-color',
  text_color: '--tg-text-color',
  hint_color: '--tg-hint-color',
  link_color: '--tg-link-color',
  button_color: '--tg-button-color',
  button_text_color: '--tg-button-text-color',
  secondary_bg_color: '--tg-secondary-bg-color',
  section_bg_color: '--tg-section-bg-color',
  section_header_text_color: '--tg-section-header-text-color',
  subtitle_text_color: '--tg-subtitle-text-color',
  destructive_text_color: '--tg-destructive-text-color',
  header_bg_color: '--tg-header-bg-color',
  bottom_bar_bg_color: '--tg-bottom-bar-bg-color',
  accent_text_color: '--tg-accent-text-color'
};

const FALLBACK_THEME = {
  bg_color: '#f5f7fb',
  text_color: '#111827',
  hint_color: '#64748b',
  link_color: '#229ed9',
  button_color: '#229ed9',
  button_text_color: '#ffffff',
  secondary_bg_color: '#eef3f8',
  section_bg_color: '#ffffff',
  section_header_text_color: '#229ed9',
  subtitle_text_color: '#64748b',
  destructive_text_color: '#ef4444',
  header_bg_color: '#ffffff',
  bottom_bar_bg_color: '#ffffff',
  accent_text_color: '#f8812d'
};

function getRoot() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.documentElement;
}

export function getTelegramWebApp() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.Telegram?.WebApp || null;
}

export function isTelegramMiniApp() {
  return Boolean(getTelegramWebApp()?.initData);
}

export function getLaunchParam(name) {
  if (typeof window === 'undefined') {
    return '';
  }

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  return hashParams.get(name) || url.searchParams.get(name) || '';
}

export function getTelegramStartParam(webApp = getTelegramWebApp()) {
  return (
    webApp?.initDataUnsafe?.start_param ||
    getLaunchParam('tgWebAppStartParam') ||
    getLaunchParam('startapp') ||
    getLaunchParam('start') ||
    ''
  );
}

export function getTelegramUser(webApp = getTelegramWebApp()) {
  return webApp?.initDataUnsafe?.user || null;
}

export function getRawTelegramInitData(webApp = getTelegramWebApp()) {
  return webApp?.initData || getLaunchParam('tgWebAppData') || '';
}

export function applyTelegramTheme(themeParams = {}) {
  const root = getRoot();
  if (!root) {
    return FALLBACK_THEME;
  }

  const theme = {
    ...FALLBACK_THEME,
    ...(themeParams || {})
  };

  Object.entries(THEME_KEYS).forEach(([key, variable]) => {
    root.style.setProperty(variable, theme[key] || FALLBACK_THEME[key]);
  });

  const colorScheme = theme.bg_color === '#000000' || String(theme.bg_color).toLowerCase().startsWith('#1')
    ? 'dark'
    : 'light';
  root.dataset.telegramTheme = colorScheme;

  return theme;
}

export function initializeTelegramMiniApp() {
  const webApp = getTelegramWebApp();
  const theme = applyTelegramTheme(webApp?.themeParams);

  if (!webApp) {
    return { webApp: null, theme, user: null, startParam: getTelegramStartParam(null), available: false };
  }

  try {
    webApp.ready?.();
    webApp.expand?.();
    webApp.setHeaderColor?.(theme.header_bg_color || theme.bg_color);
    webApp.setBackgroundColor?.(theme.bg_color);
  } catch (_error) {
    // Telegram clients differ by platform and version; unsupported calls are safe to ignore.
  }

  return {
    webApp,
    theme,
    user: getTelegramUser(webApp),
    startParam: getTelegramStartParam(webApp),
    available: true
  };
}

export function configureTelegramMainButton(webApp, {
  text,
  visible = true,
  enabled = true,
  loading = false,
  color,
  textColor,
  onClick
} = {}) {
  const button = webApp?.MainButton;
  if (!button) {
    return () => {};
  }

  if (text) {
    button.setText?.(text);
  }

  if (color && textColor) {
    button.setParams?.({ color, text_color: textColor });
  }

  if (enabled) {
    button.enable?.();
  } else {
    button.disable?.();
  }

  if (loading) {
    button.showProgress?.();
  } else {
    button.hideProgress?.();
  }

  if (visible) {
    button.show?.();
  } else {
    button.hide?.();
  }

  if (onClick) {
    button.onClick?.(onClick);
  }

  return () => {
    if (onClick) {
      button.offClick?.(onClick);
    }
    button.hideProgress?.();
    button.hide?.();
  };
}

export function configureTelegramSettingsButton(webApp, {
  visible = true,
  onClick
} = {}) {
  const button = webApp?.SettingsButton;
  if (!button) {
    return () => {};
  }

  if (visible) {
    button.show?.();
  } else {
    button.hide?.();
  }

  if (onClick) {
    button.onClick?.(onClick);
  }

  return () => {
    if (onClick) {
      button.offClick?.(onClick);
    }
  };
}

export function configureClosingConfirmation(webApp, enabled) {
  try {
    if (enabled) {
      webApp?.enableClosingConfirmation?.();
    } else {
      webApp?.disableClosingConfirmation?.();
    }
  } catch (_error) {
    // Closing confirmation is client/version dependent.
  }
}

export function configureVerticalSwipe(webApp, enabled) {
  try {
    if (enabled) {
      webApp?.enableVerticalSwipes?.();
    } else {
      webApp?.disableVerticalSwipes?.();
    }
  } catch (_error) {
    // Swipe behavior is client/version dependent.
  }
}

export function triggerTelegramImpact(style = 'light') {
  try {
    getTelegramWebApp()?.HapticFeedback?.impactOccurred?.(style);
  } catch (_error) {
    // Haptics are best-effort and unavailable in regular browsers.
  }
}

export function triggerTelegramNotification(type = 'success') {
  try {
    getTelegramWebApp()?.HapticFeedback?.notificationOccurred?.(type);
  } catch (_error) {
    // Haptics are best-effort and unavailable in regular browsers.
  }
}
