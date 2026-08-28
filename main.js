/* Home loading screen */
const loadingScreen = document.getElementById('loadingScreen');
const loadingRings = document.getElementById('loadingRings');
let disposeLoadingRings = () => {};

if (loadingRings && window.THREE) {
  const vertexShader = `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const fragmentShader = `
    precision highp float;
    uniform float uTime, uAttenuation, uLineThickness, uBaseRadius, uRadiusStep, uScaleRate;
    uniform float uOpacity, uNoiseAmount, uRotation, uRingGap, uFadeIn, uFadeOut;
    uniform vec2 uResolution;
    uniform vec3 uColor, uColorTwo;
    uniform int uRingCount;
    const float HP = 1.5707963;
    const float CYCLE = 3.45;
    float fade(float t) { return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t); }
    float ring(vec2 p, float ri, float cut, float t0, float px) {
      float t = mod(uTime + t0, CYCLE);
      float r = ri + t / CYCLE * uScaleRate;
      float d = abs(length(p) - r);
      float a = atan(abs(p.y), abs(p.x)) / HP;
      float th = max(1.0 - a, 0.5) * px * uLineThickness;
      float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
      d += pow(cut * a, 3.0) * r;
      return h * exp(-uAttenuation * d) * fade(t);
    }
    void main() {
      float px = 1.0 / min(uResolution.x, uResolution.y);
      vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
      float cr = cos(uRotation), sr = sin(uRotation);
      p = mat2(cr, -sr, sr, cr) * p;
      vec3 c = vec3(0.0);
      float rcf = max(float(uRingCount) - 1.0, 1.0);
      for (int i = 0; i < 10; i++) {
        if (i >= uRingCount) break;
        float fi = float(i);
        vec3 rc = mix(uColor, uColorTwo, fi / rcf);
        c = mix(c, rc, vec3(ring(p, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
      }
      float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
      c += (n - 0.5) * uNoiseAmount;
      gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
    }
  `;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  loadingRings.appendChild(renderer.domElement);
  loadingScreen?.classList.add('has-webgl');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;
  const uniforms = {
    uTime: { value: 0 }, uAttenuation: { value: 10 }, uLineThickness: { value: 2 },
    uBaseRadius: { value: 0.35 }, uRadiusStep: { value: 0.1 }, uScaleRate: { value: 0.1 },
    uOpacity: { value: 1 }, uNoiseAmount: { value: 0.1 }, uRotation: { value: 0 },
    uRingGap: { value: 1.5 }, uFadeIn: { value: 0.7 }, uFadeOut: { value: 0.5 },
    uRingCount: { value: 6 }, uResolution: { value: new THREE.Vector2(1, 1) },
    uColor: { value: new THREE.Color('#D7AC36') }, uColorTwo: { value: new THREE.Color('#E8B254') }
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
  const resize = () => {
    const width = loadingRings.clientWidth;
    const height = loadingRings.clientHeight;
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(loadingRings);
  let frameId = 0;
  const animate = time => {
    uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  };
  frameId = requestAnimationFrame(animate);
  disposeLoadingRings = () => {
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    material.dispose();
    renderer.dispose();
  };
}
if (loadingScreen) {
  window.setTimeout(() => {
    loadingScreen.classList.add('is-hidden');
    loadingScreen.addEventListener('transitionend', () => {
      disposeLoadingRings();
      loadingScreen.remove();
    }, { once: true });
  }, 2500);
}

/* Header changes from blended to solid after the first scroll */
const header = document.querySelector('header');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
const introSection = document.querySelector('#top, .page-hero');
let lastScrollY = window.scrollY;
const updateHeaderVisibility = () => {
  const currentScrollY = window.scrollY;
  const introBottom = introSection ? introSection.offsetTop + introSection.offsetHeight : 0;
  const scrollDelta = currentScrollY - lastScrollY;
  if (Math.abs(scrollDelta) > 2) {
    const scrollingDown = scrollDelta > 0;
    const shouldHide = scrollingDown && currentScrollY > Math.max(introBottom - 80, 80);
    header?.classList.toggle('is-hidden', shouldHide);
  }
  lastScrollY = currentScrollY;
};
window.addEventListener('scroll', () => {
  updateHeader();
  updateHeaderVisibility();
}, { passive: true });
updateHeader();

/* Mobile navigation */
const navMenuToggle = document.getElementById('navMenuToggle');
const navMenu = document.getElementById('navMenu');
if (navMenuToggle && navMenu) {
  const closeNavMenu = () => {
    navMenu.classList.remove('is-open');
    navMenuToggle.setAttribute('aria-expanded', 'false');
    navMenuToggle.setAttribute('aria-label', 'Open navigation menu');
  };
  navMenuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navMenuToggle.setAttribute('aria-expanded', String(isOpen));
    navMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
  navMenu.addEventListener('click', closeNavMenu);
  document.addEventListener('click', event => {
    if (!navMenu.contains(event.target) && !navMenuToggle.contains(event.target)) closeNavMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNavMenu();
  });
}

/* Home-page quote dialog */
const whatsappOpen = document.getElementById('whatsappOpen');
const whatsappDialog = document.getElementById('whatsappDialog');
const whatsappClose = document.getElementById('whatsappClose');
const whatsappForm = document.getElementById('whatsappForm');
if (whatsappOpen && whatsappDialog && whatsappClose && whatsappForm) {
  const closeDialog = () => {
    whatsappDialog.hidden = true;
    whatsappOpen.setAttribute('aria-expanded', 'false');
    whatsappOpen.focus();
  };
  whatsappOpen.addEventListener('click', () => {
    whatsappDialog.hidden = false;
    whatsappOpen.setAttribute('aria-expanded', 'true');
    whatsappClose.focus();
  });
  whatsappClose.addEventListener('click', closeDialog);
  whatsappDialog.addEventListener('click', event => {
    if (event.target === whatsappDialog) closeDialog();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !whatsappDialog.hidden) closeDialog();
  });
  whatsappForm.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(whatsappForm);
    const message = [
      'Hello Fabrotech Engineers, I would like a quote.',
      `Product category: ${values.get('product')}`,
      `Quantity: ${values.get('quantity')}`,
      `Site location: ${values.get('location')}`,
      `Additional details: ${values.get('message') || 'None'}`
    ].join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    closeDialog();
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ScrollFloat-style character reveal for content outside the header */
document.querySelectorAll('.scroll-float').forEach(element => {
  let charIndex = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    [...node.nodeValue].forEach(character => {
      const char = document.createElement('span');
      char.className = 'scroll-float-char';
      char.style.setProperty('--char-index', charIndex++);
      char.textContent = character === ' ' ? '\u00a0' : character;
      fragment.appendChild(char);
    });
    node.parentNode.replaceChild(fragment, node);
  });
  const reveal = () => element.classList.add('is-visible');
  if (element.getBoundingClientRect().top < window.innerHeight) reveal();
  else new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) reveal(); }), { threshold: 0.2 }).observe(element);
});

/* Scroll progress rule */
const scrollFill = document.getElementById('scrollFill');
let scrollFrame = 0;
function updateScrollProgress(){
  if (!scrollFill) return;
  const h = document.documentElement;
  const scrollableHeight = h.scrollHeight - h.clientHeight;
  const scrolled = scrollableHeight > 0 ? (h.scrollTop / scrollableHeight) * 100 : 0;
  scrollFill.style.width = scrolled + '%';
}
document.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateScrollProgress();
    scrollFrame = 0;
  });
}, { passive:true });
updateScrollProgress();

/* Hero cursor spotlight (only on pages that have it) */
const heroEl = document.getElementById('top');
if (heroEl && !reduceMotion && finePointer){
  let heroFrame = 0;
  let heroEvent;
  heroEl.addEventListener('mousemove', (e) => {
    heroEvent = e;
    if (heroFrame) return;
    heroFrame = requestAnimationFrame(() => {
      const r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--mx', ((heroEvent.clientX - r.left) / r.width) * 100 + '%');
      heroEl.style.setProperty('--my', ((heroEvent.clientY - r.top) / r.height) * 100 + '%');
      heroFrame = 0;
    });
  });
}

/* Section hover glow that follows the cursor */
if (finePointer && !reduceMotion) document.querySelectorAll('section').forEach(section => {
  let sectionFrame = 0;
  let sectionEvent;
  const updateGlow = (e) => {
    sectionEvent = e;
    if (sectionFrame) return;
    sectionFrame = requestAnimationFrame(() => {
      const r = section.getBoundingClientRect();
      section.style.setProperty('--glow-x', ((sectionEvent.clientX - r.left) / r.width) * 100 + '%');
      section.style.setProperty('--glow-y', ((sectionEvent.clientY - r.top) / r.height) * 100 + '%');
      section.classList.add('is-hovered');
      sectionFrame = 0;
    });
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

/* Product accordion gallery */
document.querySelectorAll('[data-accordion-gallery]').forEach(gallery => {
  const panels = [...gallery.querySelectorAll('.ag-panel')];
  if (!panels.length) return;
  let active = panels.length - 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoTimer;
  let isPaused = false;
  const applyLayout = () => {
    const ratio = 0.52;
    const grow = panels.length > 1 ? (ratio * (panels.length - 1)) / (1 - ratio) : 1;
    panels.forEach((panel, index) => {
      const isActive = index === active;
      const rotation = isActive ? 0 : index < active ? 8 : -8;
      panel.style.flexGrow = isActive ? String(grow) : '1';
      panel.style.transform = reducedMotion ? 'none' : `rotateY(${rotation}deg)`;
      panel.style.setProperty('--ag-dim', isActive ? '0' : '.35');
      panel.style.setProperty('--ag-gray', isActive ? '0' : '1');
      panel.style.setProperty('--ag-shift', `${(active - index) * 8}px`);
      panel.style.setProperty('--ag-blur', isActive ? '0px' : '4px');
      const brand = panel.querySelector('.ag-letter');
      if (brand) brand.textContent = ['F', 'A', 'B', 'R', 'O', 'T', 'E', 'C', 'H'][index] || '';
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };
  const activate = index => { active = (index + panels.length) % panels.length; applyLayout(); };
  const startAuto = () => {
    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(() => {
      if (!isPaused) activate(active + 1);
    }, 2000);
  };
  panels.forEach((panel, index) => {
    panel.addEventListener('mouseenter', () => { isPaused = true; activate(index); });
    panel.addEventListener('focus', () => activate(index));
    panel.addEventListener('click', () => activate(index));
    panel.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); activate(index + 1); panels[active].focus(); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); activate(index - 1); panels[active].focus(); }
    });
  });
  gallery.addEventListener('mouseleave', () => { isPaused = false; });
  applyLayout();
  startAuto();
});

/* Spec-card and cert-card tilt toward cursor */
if (!reduceMotion && finePointer){
  document.querySelectorAll('.spec-card:not(.ag-panel), .cert-card').forEach(card => {
    let cardFrame = 0;
    let cardEvent;
    card.addEventListener('mousemove', (e) => {
      cardEvent = e;
      if (cardFrame) return;
      cardFrame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (cardEvent.clientX - r.left) / r.width - 0.5;
        const py = (cardEvent.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateZ(4px)`;
        cardFrame = 0;
      });
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
