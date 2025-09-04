import { useEffect, useState } from "react";

export default function AdminThemeCheck() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const root = document.querySelector('.admin-theme') || document.querySelector('.admin-theme-failed');
    if (!root) return;
    try {
      const data = root.dataset.themeCheck ? JSON.parse(root.dataset.themeCheck) : null;
      setResult(data);
    } catch {
      setResult(null);
    }
  }, []);

  if (!result) return null;

  return (
    <div className="admin-theme-check">
      <strong>Theme Check:</strong>{' '}
      <span>{result.ok ? 'All checks passed' : 'Failed — reverted to original styles'}</span>
      <div>
        Font loaded: {String(result.details?.fontLoaded)} | Primary: {String(result.details?.primaryMatch)} | Secondary: {String(result.details?.secondaryMatch)} | Buttons contrast AA+: {String(result.details?.buttonContrastAA)} | Icon contrast AA+: {String(result.details?.iconContrastAA)}
      </div>
    </div>
  );
}
