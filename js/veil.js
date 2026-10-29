/* Fail-safe: never trap the visitor behind the veil — runs without any dependency,
   before the 3D module (which may load slow or fail on weak networks). */
(function () {
  var veil = document.getElementById("veil");
  var hide = function () { if (veil) veil.classList.add("done"); };
  /* JS is alive — hand reveal control back to the app */
  document.documentElement.classList.remove("nojs");
  window.addEventListener("load", function () { setTimeout(hide, 350); });
  setTimeout(hide, 2600);
})();
