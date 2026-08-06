/* Language toggle */
let currentLang = 'en';
const toggle = document.getElementById('langToggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-en]').forEach(el => {
      const val = el.getAttribute('data-' + currentLang);
      if (val !== null) el.innerHTML = val;
    });
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scroll progress rule */
const scrollFill = document.getElementById('scrollFill');
function updateScrollProgress(){
  if (!scrollFill) return;
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollFill.style.width = scrolled + '%';
}
document.addEventListener('scroll', updateScrollProgress, { passive:true });
updateScrollProgress();

/* Hero cursor spotlight (only on pages that have it) */
const heroEl = document.getElementById('top');
if (heroEl && !reduceMotion){
  heroEl.addEventListener('mousemove', (e) => {
    const r = heroEl.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    heroEl.style.setProperty('--mx', mx + '%');
    heroEl.style.setProperty('--my', my + '%');
  });
}

/* Section hover glow that follows the cursor */
document.querySelectorAll('section').forEach(section => {
  const updateGlow = (e) => {
    const r = section.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    section.style.setProperty('--glow-x', px + '%');
    section.style.setProperty('--glow-y', py + '%');
    section.classList.add('is-hovered');
    section.style.boxShadow = 'inset 0 0 0 1px rgba(215, 172, 54, 0.28), 0 0 42px rgba(215, 172, 54, 0.24)';
    section.style.outline = '1px solid rgba(215, 172, 54, 0.3)';
    section.style.outlineOffset = '8px';
    section.style.transform = 'translateY(-2px)';
  };

  section.addEventListener('mouseenter', updateGlow);
  section.addEventListener('mousemove', updateGlow);
  section.addEventListener('mouseleave', () => {
    section.classList.remove('is-hovered');
    section.style.setProperty('--glow-x', '50%');
    section.style.setProperty('--glow-y', '50%');
    section.style.boxShadow = '';
    section.style.outline = '';
    section.style.outlineOffset = '';
    section.style.transform = '';
  });
});

/* Spec-card and cert-card tilt toward cursor */
if (!reduceMotion){
  document.querySelectorAll('.spec-card, .cert-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
}

/* Scroll reveal for content blocks */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* Expansion-path dots and rail fill as they scroll into view */
const steps = document.querySelectorAll('.reach-step');
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const dot = entry.target.querySelector('.dot');
      const rail = entry.target.querySelector('.rail-fill');
      if (dot) dot.classList.add('is-visible');
      if (rail) rail.style.height = '100%';
      stepObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
steps.forEach(el => stepObserver.observe(el));
