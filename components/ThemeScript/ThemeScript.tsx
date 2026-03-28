// Inline script injected into <head> to set data-theme before first paint,
// preventing a flash of the wrong theme on load.
export default function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',t||(d?'dark':'light'));}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
