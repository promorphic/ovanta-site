// Hero line pattern: thick lines with a ragged edge, thin lines running through
const heroLines = document.getElementById("heroLines");
const buildLines = () => {
  const rows = Math.max(18, Math.round(heroLines.offsetHeight / 18));
  heroLines.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    const w = 72 + ((i * 37) % 11) + (i % 3 === 0 ? 3 : 0); // deterministic 72–86%
    const ln = document.createElement("div");
    ln.className = "ln";
    ln.style.setProperty("--w", w + "%");
    heroLines.appendChild(ln);
  }
};
buildLines();
window.addEventListener("resize", buildLines);

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
