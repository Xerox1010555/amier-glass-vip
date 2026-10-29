/* Fail-safe: the veil must NEVER trap a visitor.
   Runs first in <head>, before the 3D module — zero dependencies, no imports.
   Layers (any ONE of them opens the veil):
   1) ?nov=1         -> opens instantly (screenshot / print mode)
   2) DOMContentLoaded + load -> opens shortly after
   3) hard 2.6s timer        -> opens regardless of network speed
   4) styles.css: pure-CSS animation opens it even if every script is dead
   5) if the app module never came up, html gets .nojs back -> CSS shows all content
   NOTE: the element is looked up AT CALL TIME — this script runs before <body> exists. */
(function () {
  var open = function () {
    var v = document.getElementById("veil");
    if (v) v.classList.add("done");
  };
  var html = document.documentElement;

  /* JS is alive — reveals stay under the app's control */
  html.classList.remove("nojs");

  var nov = false;
  try { nov = new URLSearchParams(location.search).has("nov"); } catch (e) { nov = false; }
  if (nov) html.classList.add("nov");

  document.addEventListener("DOMContentLoaded", function () {
    if (nov) open();
    window.setTimeout(open, 1100);
  });
  window.addEventListener("load", function () { window.setTimeout(open, 350); });
  window.setTimeout(open, 2600);

  /* if app.js died or never arrived: fail open — CSS shows everything */
  window.setTimeout(function () {
    if (!window.__appOk) html.classList.add("nojs");
  }, 3800);
})();
