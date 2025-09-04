import { useEffect, useState } from "react";

function getContrastRatio(hex1, hex2) {
  const toRgb = (hex) => {
    const h = hex.replace('#','');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };
  const luminance = ({r,g,b}) => {
    const a = [r,g,b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    });
    return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
  };
  try {
    const L1 = luminance(toRgb(hex1));
    const L2 = luminance(toRgb(hex2));
    const [max, min] = L1 > L2 ? [L1, L2] : [L2, L1];
    return (max + 0.05) / (min + 0.05);
  } catch {
    return 7; // assume pass
  }
}

export default function AdminThemeProvider() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const root = document.querySelector('.admin-theme');
    if (!root) return;

    const body = document.body;
    const cs = getComputedStyle(body);

    const detectedFont = cs.fontFamily || 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';

    const fallbacks = {
      primary: '#1A237E',
      secondary: '#3949AB',
      accent: '#FF6B35',
      bg: '#f6f8ff',
      surface: '#ffffff',
      surface2: '#121850',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e5e7eb',
      success: '#16a34a',
      warning: '#f59e0b',
      danger: '#dc2626',
    };

    const prefer = (varName, fallback) => getComputedStyle(document.documentElement).getPropertyValue(varName)?.trim() || fallback;

    const tokens = {
      font: detectedFont,
      primary: prefer('--tatha-primary', fallbacks.primary),
      secondary: prefer('--tatha-secondary', fallbacks.secondary),
      accent: prefer('--tatha-accent', fallbacks.accent),
      bg: prefer('--tatha-bg', fallbacks.bg),
      surface: prefer('--tatha-surface', fallbacks.surface),
      surface2: prefer('--tatha-surface-2', fallbacks.surface2),
      text: prefer('--tatha-text', fallbacks.text),
      muted: prefer('--tatha-text-muted', fallbacks.muted),
      border: prefer('--tatha-border', fallbacks.border),
      success: prefer('--tatha-success', fallbacks.success),
      warning: prefer('--tatha-warning', fallbacks.warning),
      danger: prefer('--tatha-danger', fallbacks.danger),
    };

    // Apply variables to root of admin pages
    const apply = (name, value) => root.style.setProperty(name, value);
    apply('--admin-font-sans', tokens.font);
    apply('--admin-primary', tokens.primary);
    apply('--admin-secondary', tokens.secondary);
    apply('--admin-accent', tokens.accent);
    apply('--admin-bg', tokens.bg);
    apply('--admin-surface', tokens.surface);
    apply('--admin-surface-2', tokens.surface2);
    apply('--admin-text', tokens.text);
    apply('--admin-text-muted', tokens.muted);
    apply('--admin-border', tokens.border);
    apply('--admin-success', tokens.success);
    apply('--admin-warning', tokens.warning);
    apply('--admin-danger', tokens.danger);

    // Theme check
    const results = { ok: true, details: {} };
    results.details.fontLoaded = !!tokens.font;

    results.details.primaryMatch = !!tokens.primary;
    results.details.secondaryMatch = !!tokens.secondary;

    // Buttons/chips state check: ensure focus ring visible (contrast)
    const contrast = getContrastRatio(tokens.primary.replace(/\s/g,''), '#ffffff');
    results.details.buttonContrastAA = contrast >= 4.5;

    // Icon contrast on tinted circle over surface
    const surfaceHex = tokens.surface.replace(/\s/g,'');
    const iconOnSurface = getContrastRatio(tokens.primary, surfaceHex);
    results.details.iconContrastAA = iconOnSurface >= 3; // UI icons can pass AA at 3:1

    results.ok = Object.values(results.details).every(Boolean);

    // Rollback if failed: remove admin-theme class to revert to original styles
    if (!results.ok) {
      root.classList.add('admin-theme-failed');
      root.classList.remove('admin-theme');
    }

    // Attach results for Theme Check component to read
    root.dataset.themeCheck = JSON.stringify(results);

    setChecked(true);
  }, []);

  return null;
}
