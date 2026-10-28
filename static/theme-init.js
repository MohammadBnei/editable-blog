// Applies the saved theme/width before first paint (keys written by +layout.svelte).
// Loaded from app.html as a classic blocking script, not a module: a deferred
// module would paint the default theme first. A separate file, not inline, so
// the per-page CSP needs no hash for it.
(function () {
  var w = localStorage.getItem('content-width');
  if (w === 'cozy' || w === 'comfortable' || w === 'wide') {
    document.documentElement.dataset.width = w;
  }
  var t = localStorage.getItem('theme');
  if (t === 'notebook' || t === 'notebook-dark') {
    document.documentElement.dataset.theme = t;
  }
})();
