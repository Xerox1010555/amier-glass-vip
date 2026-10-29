/* AMIER — Glass Edition · interactivity + 3D glass scene
   Glide everywhere: heavy lerp, no snapping. */
import * as THREE from "/vendor/three/three.module.js";
import { RoomEnvironment } from "/vendor/three/addons/environments/RoomEnvironment.js";

const D = window.AMIER_DATA;
const $ = (s) => document.querySelector(s);
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ?nov=1 (screenshot/print mode): everything visible immediately */
try {
  if (new URLSearchParams(location.search).has("nov")) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }
} catch { /* noop */ }

/* ---------- preloader (backup layer; js/veil.js is primary) ---------- */
const veil = $("#veil");
const hideVeil = () => { if (veil) veil.classList.add("done"); };
window.addEventListener("load", () => setTimeout(hideVeil, 350));
setTimeout(hideVeil, 3200); /* safety */

/* ---------- reveal (glide-in) ---------- */
const io = new IntersectionObserver((es) => {
  for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { threshold: 0.12, rootMargin: "0px 0px -36px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- clock ---------- */
const clockEl = $("#clock");
const tickClock = () => {
  try { clockEl.textContent = "CAI " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" }); }
  catch { clockEl.textContent = "CAI"; }
};
tickClock();
setInterval(tickClock, 20000);

/* ---------- marquee ---------- */
const items = [
  "12 live deployments", "Full-Stack ✱ 3D ✱ AI",
  "Next.js 15 · React 19 · Three.js", "Available for hire — Remote · Worldwide",
  "Reply within 24 hours", "Glass edition ✱ 2026",
];
$("#mq").innerHTML = [...items, ...items].map((m) => `<span>${m} <b class="ast">✱</b></span>`).join("");

/* ---------- filters + grid ---------- */
const counts = { all: D.projects.length };
for (const p of D.projects) counts[p.cat] = (counts[p.cat] || 0) + 1;
const filtersEl = $("#filters"), grid = $("#grid");
[{ id: "all", label: "All" }, ...D.filters].forEach((f, i) => {
  const b = document.createElement("button");
  b.className = "fbtn";
  b.dataset.id = f.id;
  b.setAttribute("aria-pressed", String(i === 0));
  b.innerHTML = `${f.label}<span class="cnt">${counts[f.id] || 0}</span>`;
  filtersEl.appendChild(b);
});
grid.innerHTML = D.projects.map((p, i) => `
  <article class="gcard reveal${p.live ? "" : " no-live"}" data-cat="${p.cat}" style="--d:${((i % 3) * 0.07).toFixed(2)}s">
    <div class="thumb">
      ${p.shot ? `<img src="${p.shot}" alt="${p.title}" loading="lazy" decoding="async">` : ""}
      <span class="glass cap mono">${p.kind}</span>
    </div>
    <div class="meta">
      <h3 class="k-title">${p.title}</h3>
      <span class="k-kind mono">${p.kind}</span>
      <p class="k-blurb">${p.blurb}</p>
      <div class="k-arms">
        ${p.live ? `<a class="gold" href="${p.live}" target="_blank" rel="noreferrer">Live ↗</a>` : ""}
        ${p.repo ? `<a class="ghost" href="${p.repo}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}
      </div>
    </div>
  </article>`).join("");
grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));
filtersEl.addEventListener("click", (e) => {
  const b = e.target.closest(".fbtn"); if (!b) return;
  filtersEl.querySelectorAll(".fbtn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  const id = b.dataset.id;
  grid.querySelectorAll(".gcard").forEach((c) => c.classList.toggle("hide", id !== "all" && c.dataset.cat !== id));
});

/* ---------- card tilt (damped glide) ---------- */
const tstate = [];
grid.querySelectorAll(".gcard").forEach((el) => {
  const s = { el, rx: 0, ry: 0, tx: 0, ty: 0 };
  tstate.push(s);
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    s.tx = (e.clientX - r.left) / r.width - 0.5;
    s.ty = (e.clientY - r.top) / r.height - 0.5;
  }, { passive: true });
  el.addEventListener("pointerleave", () => { s.tx = 0; s.ty = 0; });
});

/* ---------- cursor glow / rail / tick ---------- */
const glow = $("#cglow"), bar = $("#railBar");
let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
addEventListener("pointermove", (e) => { gx = e.clientX; gy = e.clientY; }, { passive: true });
let scrolled = 0;
addEventListener("scroll", () => { scrolled = scrollY; }, { passive: true });

(function uiLoop() {
  cx = lerp(cx, gx, 0.07); cy = lerp(cy, gy, 0.07);
  if (glow) glow.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
  const h = document.documentElement;
  bar.style.height = ((h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)) * 100).toFixed(1) + "%";
  for (const s of tstate) {
    s.rx = lerp(s.rx, s.ty * -4.5, 0.09);
    s.ry = lerp(s.ry, s.tx * 7, 0.09);
    s.el.style.transform = s.el.classList.contains("hide") ? "" :
      `perspective(950px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
  }
  requestAnimationFrame(uiLoop);
})();

/* ---------- copy email ---------- */
$("#copyMail").addEventListener("click", async () => {
  const b = $("#copyMail");
  try { await navigator.clipboard.writeText(D.link.email); }
  catch {
    const t = document.createElement("textarea");
    t.value = D.link.email; document.body.appendChild(t); t.select();
    document.execCommand("copy"); t.remove();
  }
  b.textContent = "Copied ✓";
  setTimeout(() => (b.textContent = "Copy"), 1800);
});

/* ================= 3D glass scene ================= */
const canvas = $("#bg");
try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  canvas.classList.add("bg-in");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 60);
  camera.position.set(0, 0, 8.4);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  const world = new THREE.Group();
  scene.add(world);

  /* central VIP gem */
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0xfdfdff, metalness: 0, roughness: 0.055, transmission: 1, thickness: 2.1,
    ior: 1.46, iridescence: 0.32, iridescenceIOR: 1.3, clearcoat: 1, clearcoatRoughness: 0.05,
    envMapIntensity: 1.35, transparent: true,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.38, 0), gemMat);
  gem.position.set(2.3, 0.3, 0);
  world.add(gem);

  const gem2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), gemMat);
  gem2.position.set(-2.9, -1.2, -1.1);
  world.add(gem2);

  /* drifting glass beads — the glide */
  const beadMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.08, transmission: 1, thickness: 0.7,
    ior: 1.42, clearcoat: 1, envMapIntensity: 1.12, transparent: true,
  });
  const beads = [];
  const beadCount = innerWidth < 760 ? 7 : 13;
  for (let i = 0; i < beadCount; i++) {
    const size = 0.09 + Math.random() * 0.2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(size, 30, 30), beadMat);
    b.position.set((Math.random() - 0.5) * 12.5, (Math.random() - 0.38) * 6.4, -1.8 - Math.random() * 4);
    b.userData = { sp: 0.22 + Math.random() * 0.45, ph: Math.random() * 6.28, y0: b.position.y, x0: b.position.x };
    beads.push(b); world.add(b);
  }

  /* champagne-gold rings */
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a254, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.017, 16, 220), goldMat);
  ring1.position.set(2.3, 0.3, -0.4); ring1.rotation.set(1.12, 0.4, 0.3);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.012, 16, 240), goldMat);
  ring2.position.set(2.3, 0.3, -0.95); ring2.rotation.set(1.72, -0.3, 0.9);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.008, 16, 260), goldMat);
  ring3.position.set(-1.2, 0, -1.5); ring3.rotation.set(0.42, 0.62, 2.4);
  world.add(ring1, ring2, ring3);

  /* gold dust */
  const N = 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 2] = -1 - Math.random() * 6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xdcb46a, size: 0.034, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  world.add(dust);

  /* parallax */
  const mouse = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clk = new THREE.Clock();
  let camX = 0, camY = 0;

  (function frameLoop() {
    const dt = Math.min(0.05, clk.getDelta());
    const t = clk.elapsedTime;
    if (!reduced) {
      gem.rotation.y = t * 0.16;
      gem.rotation.x = Math.sin(t * 0.34) * 0.22;
      gem.position.y = 0.3 + Math.sin(t * 0.55) * 0.17;
      gem2.rotation.y = -t * 0.21;
      ring1.rotation.z = t * 0.1;
      ring2.rotation.z = -t * 0.07;
      ring3.rotation.z = t * 0.05;
      for (const b of beads) {
        b.position.y = b.userData.y0 + Math.sin(t * b.userData.sp + b.userData.ph) * 0.55;
        b.position.x = b.userData.x0 + Math.cos(t * b.userData.sp * 0.66 + b.userData.ph) * 0.32;
      }
      dust.rotation.y = t * 0.013;
      dust.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
    /* heavy damping = the "slide" feel */
    camX = lerp(camX, mouse.x * 0.5, 0.035);
    camY = lerp(camY, -mouse.y * 0.34, 0.035);
    camera.position.x = camX;
    camera.position.y = camY - scrolled * 0.0022;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(frameLoop);
  })();
} catch (err) {
  /* no WebGL → velvet gradient already there via CSS */
  canvas.style.display = "none";
}

/* the app module reached the end — tells veil.js it can stay in "app mode" */
window.__appOk = true;
