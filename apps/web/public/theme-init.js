// Apply the saved/system palette before CSS and React render the page.
(() => {
  let preference;
  try { preference = localStorage.getItem('artopus-color-theme'); } catch { /* Storage can be unavailable. */ }
  const theme = preference === 'light' || preference === 'dark'
    ? preference
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
})();
