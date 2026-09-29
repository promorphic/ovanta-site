// Hero line pattern: thick bars with a ragged edge that ripple toward the pointer
const heroLines = document.getElementById("heroLines");
const heroLeft = heroLines.parentElement;
const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let rows = [];
const buildLines = () => {
  const count = Math.max(18, Math.round(heroLines.offsetHeight / 18));
  heroLines.innerHTML = "";
  rows = [];
  for (let i = 0; i < count; i++) {
    const base = (72 + ((i * 37) % 11) + (i % 3 === 0 ? 3 : 0)) / 100; // deterministic 0.72–0.86
    const ln = document.createElement("div");
    ln.className = "ln";
    const bar = document.createElement("span");
    bar.style.transform = `scaleX(${base})`;
    ln.appendChild(bar);
    heroLines.appendChild(ln);
    rows.push({ bar, base, cur: base, y: 0 });
  }
  const top = heroLines.getBoundingClientRect().top;
  rows.forEach((r) => { const b = r.bar.getBoundingClientRect(); r.y = b.top - top + b.height / 2; });
};
buildLines();
window.addEventListener("resize", buildLines);

if (motionOK) {
  const pointer = { x: 0, y: 0, active: false };
  heroLeft.addEventListener("pointermove", (e) => {
    const r = heroLines.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
  });
  heroLeft.addEventListener("pointerleave", () => { pointer.active = false; });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(heroLeft);

  const spread = 90; // px radius of the ripple
  const tick = (t) => {
    if (visible) {
      rows.forEach((r, i) => {
        // Slow ambient wave travelling down the stack
        let target = r.base + 0.025 * Math.sin(t * 0.0018 - i * 0.42);
        // Pull bars near the pointer toward its x position
        if (pointer.active) {
          const d = r.y - pointer.y;
          const k = Math.exp(-(d * d) / (2 * spread * spread));
          target += (Math.min(Math.max(pointer.x, 0.15), 1) - target) * k;
        }
        r.cur += (target - r.cur) * 0.13;
        r.bar.style.transform = `scaleX(${r.cur.toFixed(4)})`;
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Floating nav shadow
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
const setMenu = (open) => {
  links.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
};
toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Reveal on scroll
const revealTargets = document.querySelectorAll(
  ".section-head, .stat, .thesis-card, .feature, .case, .table-wrap, .code-card, .chart-card, .trust, .banner"
);
revealTargets.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
revealTargets.forEach((el) => io.observe(el));

// Count-up stats
const fmt = (n, decimals) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const statIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll("[data-count]").forEach((el) => statIO.observe(el));

// CTA form
const form = document.getElementById("ctaForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.innerHTML = '<p class="thanks">Thanks — we’ll be in touch shortly.</p>';
});

// Live transaction feed
const agents = ["research-agent-07", "travel-concierge", "gpu-broker", "content-agent", "procure-bot", "ads-optimizer", "support-agent-3"];
const actions = [
  { label: "search.api · per request", amt: 0.0008, cls: "c-blue", tag: "API" },
  { label: "Compute · 4 GPU-min", amt: 0.16, cls: "c-purple", tag: "GPU" },
  { label: "Dataset license", amt: 12.5, cls: "c-yellow", tag: "DAT" },
  { label: "Task bounty received", amt: 1.75, cls: "c-green", tag: "IN", pos: true },
  { label: "Pay-per-crawl · 40 pages", amt: 0.04, cls: "c-blue", tag: "API" },
  { label: "Rail ticket · Paris", amt: 62.4, cls: "c-yellow", tag: "TRV" },
];
const list = document.getElementById("txList");
const fmtAmt = (v) => (v < 0.01 ? v.toFixed(4) : v.toFixed(2));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  setInterval(() => {
    if (document.hidden) return;
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const a = actions[Math.floor(Math.random() * actions.length)];
    const li = document.createElement("li");
    li.innerHTML = `<span class="tx-icon ${a.cls}">${a.tag}</span><div><b>${agent}</b><small>${a.label}</small></div><span class="amt${a.pos ? " pos" : ""}">${a.pos ? "+" : "−"}$${fmtAmt(a.amt)}</span>`;
    list.prepend(li);
    if (list.children.length > 4) list.lastElementChild.remove();
  }, 3000);
}
