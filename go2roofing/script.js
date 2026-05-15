/* ========================================
   Go2Roofing — Interactions
   ======================================== */

/* ---------- Email config ----------
   1. Go to https://web3forms.com, enter go2roofer@gmail.com
   2. Paste the access key you receive into WEB3FORMS_KEY below
   3. While the key is still the placeholder, forms fall back to
      opening the user's email client with the message pre-filled.
------------------------------------- */
const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_KEY_HERE';
const EMAIL_TO = 'go2roofer@gmail.com';

async function sendFormEmail({ subject, message, replyTo }) {
  const keyConfigured = WEB3FORMS_KEY && WEB3FORMS_KEY !== 'YOUR_WEB3FORMS_KEY_HERE';

  if (!keyConfigured) {
    // Fallback: open the user's email client with pre-filled content
    const url = 'mailto:' + EMAIL_TO
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(message);
    window.location.href = url;
    return { success: true, fallback: true };
  }

  const data = new FormData();
  data.append('access_key', WEB3FORMS_KEY);
  data.append('subject', subject);
  data.append('from_name', 'Go2Roofing Website');
  data.append('message', message);
  if (replyTo) data.append('replyto', replyTo);
  data.append('botcheck', '');

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' }
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Email send failed');
  return json;
}

function line(label, value, width = 14) {
  const v = value == null || value === '' ? '—' : String(value);
  return '  ' + (label + ':').padEnd(width) + v;
}

function rule(char = '═', n = 50) { return char.repeat(n); }

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initThemeToggle();
  initMobileNav();
  initCounters();
  initLeadForm();
  initLeakGuide();
  initCalculator();
  initRevealAnimations();
  initScrollSpy();
  initBudgetSlider();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------- Sticky header shadow ---------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  const update = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Theme toggle ---------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('g2r-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('g2r-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('g2r-theme', 'dark');
    }
  });
}

/* ---------- Mobile nav ---------- */
function initMobileNav() {
  const burger = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!burger) return;
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  }));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  counters.forEach(c => obs.observe(c));
}

/* ---------- Multi-step lead form ---------- */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const panels = form.querySelectorAll('.step-panel');
  const stepDots = document.querySelectorAll('.step');
  const stepNum = document.getElementById('stepNum');
  const bar = document.getElementById('progressBar');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const submit = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  let current = 1;
  const total = panels.length;

  const render = () => {
    panels.forEach(p => p.classList.toggle('active', +p.dataset.panel === current));
    stepDots.forEach(d => {
      const n = +d.dataset.step;
      d.classList.toggle('active', n === current);
      d.classList.toggle('done', n < current);
    });
    bar.dataset.step = current;
    stepNum.textContent = current;
    prev.disabled = current === 1;
    next.hidden = current === total;
    submit.hidden = current !== total;
  };

  const validateStep = () => {
    const panel = form.querySelector(`.step-panel[data-panel="${current}"]`);
    const required = panel.querySelectorAll('[required]');
    let ok = true;
    let firstInvalid = null;
    required.forEach(field => {
      if (field.type === 'radio') {
        const group = form.querySelectorAll(`input[name="${field.name}"]`);
        const checked = Array.from(group).some(r => r.checked);
        if (!checked) { ok = false; if (!firstInvalid) firstInvalid = field; }
      } else if (!field.value.trim()) {
        ok = false;
        field.style.borderColor = 'var(--danger)';
        if (!firstInvalid) firstInvalid = field;
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    if (!ok && firstInvalid) {
      const choiceCard = firstInvalid.closest('.choice-grid');
      if (choiceCard) choiceCard.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
        { duration: 280 }
      );
      else firstInvalid.focus();
    }
    return ok;
  };

  next.addEventListener('click', () => {
    if (!validateStep()) return;
    if (current < total) { current++; render(); }
  });
  prev.addEventListener('click', () => {
    if (current > 1) { current--; render(); }
  });
  stepDots.forEach(d => d.addEventListener('click', () => {
    const target = +d.dataset.step;
    if (target < current) { current = target; render(); }
  }));

  // Auto-advance on choice select (step 1 and 3)
  form.querySelectorAll('.choice input').forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked && current < total) {
        setTimeout(() => { current++; render(); }, 280);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const submitBtn = document.getElementById('submitBtn');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const d = new FormData(form);
    const fullName = ((d.get('firstName') || '') + ' ' + (d.get('lastName') || '')).trim();
    const subject = 'New Lead — ' + (fullName || 'Go2Roofing') + ' · ' + (d.get('service') || 'General');
    const message = [
      'NEW LEAD — Go2Roofing Website',
      rule('═'),
      '',
      'SERVICE REQUESTED',
      line('Service', d.get('service')),
      '',
      'TIMING & BUDGET',
      line('Timing', d.get('timing')),
      line('Budget', d.get('budget') ? '$' + Number(d.get('budget')).toLocaleString() : '—'),
      '',
      'PROPERTY',
      line('Type', d.get('propertyType')),
      line('Storeys', d.get('storeys')),
      line('Roof age', d.get('roofAge')),
      line('Square ft', d.get('sqft')),
      line('Notes', d.get('notes')),
      '',
      'CONTACT',
      line('Name', fullName),
      line('Email', d.get('email')),
      line('Phone', d.get('phone')),
      line('Address', d.get('address')),
      '',
      rule('─'),
      'Submitted: ' + new Date().toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' })
    ].join('\n');

    try {
      await sendFormEmail({ subject, message, replyTo: d.get('email') });
      form.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      form.querySelector('.form-nav').hidden = true;
      form.querySelector('.progress').hidden = true;
      success.hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      alert("Sorry, we couldn't send your request. Please call (548) 255-0465 or email go2roofer@gmail.com directly.");
    }
  });

  render();
}

/* ---------- Budget slider ---------- */
function initBudgetSlider() {
  const slider = document.getElementById('budgetSlider');
  const out = document.getElementById('budgetOut');
  if (!slider || !out) return;
  const fmt = (v) => '$' + Number(v).toLocaleString();
  const update = () => out.textContent = fmt(slider.value);
  slider.addEventListener('input', update);
  update();
}

/* ---------- Leak guide ---------- */
function initLeakGuide() {
  const tool = document.querySelector('.leak-tool');
  if (!tool) return;
  const state = { 1: null, 2: null, 3: null };
  const result = document.getElementById('leakResult');
  const empty = result.querySelector('.leak-empty');
  const card = result.querySelector('.leak-card');
  const tagEl = document.getElementById('leakTag');
  const titleEl = document.getElementById('leakTitle');
  const detailEl = document.getElementById('leakDetail');
  const costEl = document.getElementById('leakCost');
  const urgEl = document.getElementById('leakUrgency');

  tool.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = +chip.closest('.leak-q').dataset.q;
      chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[q] = chip.dataset.key;
      maybeShowResult();
    });
  });

  function maybeShowResult() {
    if (!state[1] || !state[2] || !state[3]) return;
    const r = diagnose(state);
    empty.hidden = true; card.hidden = false;
    tagEl.textContent = r.tag;
    titleEl.textContent = r.title;
    detailEl.textContent = r.detail;
    costEl.textContent = r.cost;
    urgEl.textContent = r.urgency;
    card.animate([
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 380, easing: 'cubic-bezier(.2,.65,.3,1)' });
  }

  function diagnose(s) {
    // Storm + ceiling/wall on a mid-to-old roof: lifted shingles/flashing
    if (s[2] === 'storm') {
      return {
        tag: 'Most likely cause',
        title: 'Wind-lifted shingles or flashing',
        detail: 'High winds during the storm have likely pulled up shingle tabs or step flashing along a valley or wall intersection. Water is now entering at the seam.',
        cost: '$280 – $950',
        urgency: 'Within 7 days'
      };
    }
    if (s[2] === 'thaw') {
      return {
        tag: 'Most likely cause',
        title: 'Ice damming at the eaves',
        detail: 'Snow melts on the warm part of the roof and re-freezes at the cold eave, backing water up under the shingles. The fix is venting + ice & water shield, not just clearing the ice.',
        cost: '$420 – $1,600',
        urgency: 'Within 14 days'
      };
    }
    if (s[1] === 'chimney') {
      return {
        tag: 'Most likely cause',
        title: 'Failed chimney flashing',
        detail: 'Chimney counter-flashing and step flashing fail long before the rest of the roof. A re-flash with new ice & water shield typically solves it for another 15+ years.',
        cost: '$650 – $1,800',
        urgency: 'Within 30 days'
      };
    }
    if (s[1] === 'window') {
      return {
        tag: 'Most likely cause',
        title: 'Sidewall step-flashing leak',
        detail: 'Where a sloped roof meets a wall above a window, step flashing is the seal. When it lifts or rusts, water tracks down inside the wall cavity.',
        cost: '$380 – $1,200',
        urgency: 'Within 14 days'
      };
    }
    if (s[3] === 'old' || s[2] === 'years') {
      return {
        tag: 'Most likely cause',
        title: 'End-of-life shingle failure',
        detail: 'Cracked, curled, or balding shingles let water through in dozens of small spots at once. Patches buy time but a full replacement is the durable fix.',
        cost: '$8,500 – $18,000',
        urgency: 'Plan within 6 months'
      };
    }
    if (s[1] === 'attic') {
      return {
        tag: 'Most likely cause',
        title: 'Ventilation condensation',
        detail: 'Often misdiagnosed as a leak — warm humid air condenses on cold roof sheathing and drips. The fix is balancing intake (soffit) and exhaust (ridge) ventilation.',
        cost: '$520 – $1,400',
        urgency: 'Within 30 days'
      };
    }
    return {
      tag: 'Most likely cause',
      title: 'Penetration boot failure',
      detail: 'Plumbing stacks, exhaust vents, and bath fans use rubber boots that crack within 8–12 years. A targeted boot replacement is fast and inexpensive.',
      cost: '$220 – $480',
      urgency: 'Within 30 days'
    };
  }
}

/* ---------- Quote Calculator ---------- */
function initCalculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;

  const TIER_INFO = {
    shield30:  { name: 'Shield 30',     rate: 4.40, warranty: '30-year shingle / 5-year workmanship' },
    fortress50:{ name: 'Fortress 50',   rate: 6.30, warranty: '50-year shingle / Lifetime workmanship' },
    summit:    { name: 'Summit Stone',  rate: 10.40, warranty: 'Class-4 impact / Lifetime workmanship' }
  };
  const LABOUR_RATE = 1.85;     // $ / sqft baseline
  const TEAROFF_RATE = 0.85;    // $ / sqft per layer
  const DISPOSAL_RATE = 0.42;   // $ / sqft per layer
  const UNDERLAY_RATE = 0.45;   // $ / sqft synthetic
  const PERMIT_FEE = 185;       // fixed
  const HST = 0.13;
  const KW_PREFIXES = ['N1', 'N2', 'N3'];

  // Cache fields
  const f = (id) => document.getElementById(id);
  const fields = {
    postal:    f('calcPostal'),
    type:      f('calcType'),
    storeys:   f('calcStoreys'),
    sqft:      f('calcSqft'),
    pitch:     f('calcPitch'),
    complexity:f('calcComplex'),
    layers:    f('calcLayers'),
    access:    f('calcAccess'),
    iws:       f('calcIws'),
    drip:      f('calcDrip'),
    skylights: f('calcSkylights'),
    eaves:     f('calcEaves'),
    ridge:     f('calcRidge'),
    snow:      f('calcSnow'),
    name:      f('calcName'),
    email:     f('calcEmail'),
    phone:     f('calcPhone'),
    address:   f('calcAddress')
  };
  const errorBox = f('calcError');
  const errorList = f('calcErrorList');
  const result = f('calcResult');
  const postalHint = f('postalHint');

  // Live postal validation feedback
  fields.postal.addEventListener('input', () => {
    const v = fields.postal.value.replace(/\s+/g, '').toUpperCase();
    fields.postal.value = v.length > 3 ? v.slice(0, 3) + ' ' + v.slice(3, 6) : v;
    if (v.length >= 2) {
      const prefix = v.slice(0, 2);
      if (KW_PREFIXES.includes(prefix)) {
        postalHint.textContent = '✓ ' + cityForPostal(prefix) + ' — fully serviced.';
        postalHint.className = 'field-hint ok';
      } else if (v.startsWith('N')) {
        postalHint.textContent = 'Slightly outside our core area — service available with travel fee.';
        postalHint.className = 'field-hint warn';
      } else {
        postalHint.textContent = '⚠ Outside our K-W service region. Submit anyway and we&apos;ll refer you to a partner.';
        postalHint.className = 'field-hint err';
      }
    } else {
      postalHint.textContent = 'We service postal codes starting with N1, N2, N3 (K-W region).';
      postalHint.className = 'field-hint';
    }
  });

  function cityForPostal(prefix) {
    if (prefix === 'N2') return 'Kitchener-Waterloo / Cambridge';
    if (prefix === 'N1') return 'Guelph area';
    if (prefix === 'N3') return 'Cambridge / Brantford area';
    return 'Ontario southwest';
  }

  // Phone format helper
  fields.phone.addEventListener('input', () => {
    const d = fields.phone.value.replace(/\D/g, '').slice(0, 10);
    let v = d;
    if (d.length > 6) v = `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    else if (d.length > 3) v = `(${d.slice(0,3)}) ${d.slice(3)}`;
    else if (d.length > 0) v = `(${d}`;
    fields.phone.value = v;
  });

  // Validation
  function validate() {
    const errors = [];
    const required = [
      ['postal', 'Postal code'],
      ['type', 'Property type'],
      ['storeys', 'Number of storeys'],
      ['sqft', 'Roof square footage'],
      ['pitch', 'Roof pitch'],
      ['complexity', 'Roof complexity'],
      ['layers', 'Existing layers'],
      ['access', 'Access difficulty'],
      ['name', 'Full name'],
      ['email', 'Email'],
      ['phone', 'Phone']
    ];

    // Clear previous error states
    form.querySelectorAll('.field.error').forEach(el => el.classList.remove('error'));

    required.forEach(([k, label]) => {
      const el = fields[k];
      if (!el.value || !el.value.toString().trim()) {
        errors.push(label + ' is required');
        el.closest('.field')?.classList.add('error');
      }
    });

    // Tier
    const tier = form.querySelector('input[name="tier"]:checked');
    if (!tier) errors.push('Choose a roofing system tier');

    // Sqft sanity
    const sqft = +fields.sqft.value;
    if (sqft && (sqft < 400 || sqft > 12000)) {
      errors.push('Roof square footage should be between 400 and 12,000');
      fields.sqft.closest('.field')?.classList.add('error');
    }

    // Email format
    if (fields.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
      errors.push('Email looks invalid');
      fields.email.closest('.field')?.classList.add('error');
    }

    // Phone format
    if (fields.phone.value && fields.phone.value.replace(/\D/g,'').length < 10) {
      errors.push('Phone must be 10 digits');
      fields.phone.closest('.field')?.classList.add('error');
    }

    // Postal
    if (fields.postal.value && !/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(fields.postal.value.toUpperCase())) {
      errors.push('Postal code format should be like N2L 3G1');
      fields.postal.closest('.field')?.classList.add('error');
    }

    return errors;
  }

  // Pricing engine
  function compute() {
    const sqft = +fields.sqft.value;
    const tierKey = form.querySelector('input[name="tier"]:checked').value;
    const tier = TIER_INFO[tierKey];

    // Multipliers
    const pitchMult = +fields.pitch.selectedOptions[0].dataset.mult;
    const complexMult = +fields.complexity.selectedOptions[0].dataset.mult;
    const storeyMult = +fields.storeys.selectedOptions[0].dataset.mult;
    const accessMult = +fields.access.selectedOptions[0].dataset.mult;
    const typeMult = +fields.type.selectedOptions[0].dataset.mult;
    const layers = +fields.layers.value;

    // Lines
    const lines = [];

    // Material (shingles + accessories baked into tier rate)
    const matCost = round100(sqft * tier.rate);
    lines.push({
      label: tier.name + ' shingle system',
      detail: sqft.toLocaleString() + ' sqft × $' + tier.rate.toFixed(2) + '/sqft',
      amount: matCost
    });

    // Labour
    const labourBase = sqft * LABOUR_RATE;
    const labourTotal = round100(labourBase * pitchMult * complexMult * storeyMult * accessMult * typeMult);
    const detailParts = [];
    if (pitchMult > 1) detailParts.push('pitch ×' + pitchMult.toFixed(2));
    if (complexMult > 1) detailParts.push('complexity ×' + complexMult.toFixed(2));
    if (storeyMult > 1) detailParts.push('storeys ×' + storeyMult.toFixed(2));
    if (accessMult > 1) detailParts.push('access ×' + accessMult.toFixed(2));
    if (typeMult !== 1) detailParts.push('property ×' + typeMult.toFixed(2));
    lines.push({
      label: 'Professional installation labour',
      detail: detailParts.length ? detailParts.join(' · ') : 'Standard rate',
      amount: labourTotal
    });

    // Tear-off + disposal
    if (layers > 0) {
      const tearoff = round100(sqft * TEAROFF_RATE * layers);
      const disposal = round100(sqft * DISPOSAL_RATE * layers);
      lines.push({ label: 'Tear-off existing roof', detail: layers + ' layer' + (layers>1?'s':'') + ' × $' + TEAROFF_RATE.toFixed(2) + '/sqft', amount: tearoff });
      lines.push({ label: 'Disposal &amp; dump fees', detail: layers + ' layer' + (layers>1?'s':'') + ' to landfill', amount: disposal });
    }

    // Synthetic underlay
    const underlay = round100(sqft * UNDERLAY_RATE);
    lines.push({ label: 'Synthetic underlayment', detail: 'Full deck coverage', amount: underlay });

    // Ice & water shield
    const iwsOpt = fields.iws.selectedOptions[0];
    const iwsRate = +iwsOpt.dataset.rate;
    const iwsLabel = iwsOpt.textContent.trim();
    let iwsAmount;
    if (iwsRate < 5) iwsAmount = round100(sqft * iwsRate);
    else iwsAmount = iwsRate;
    lines.push({ label: 'Ice &amp; water shield', detail: iwsLabel.replace(' — $0.95/sqft',''), amount: iwsAmount });

    // Drip edge upgrade
    const dripOpt = fields.drip.selectedOptions[0];
    const dripRate = +dripOpt.dataset.rate;
    if (dripRate > 0) {
      lines.push({ label: 'Drip edge &amp; flashing upgrade', detail: dripOpt.textContent.trim().replace(/ \(\+\$.*\)/,''), amount: dripRate });
    } else {
      lines.push({ label: 'Drip edge &amp; flashing', detail: 'Standard aluminum (included)', amount: 0 });
    }

    // Ridge venting
    if (fields.ridge.checked) {
      lines.push({ label: 'Ridge venting + balance audit', detail: 'Improves attic airflow', amount: 480 });
    }

    // Skylights
    const skyCount = +fields.skylights.value || 0;
    if (skyCount > 0) {
      lines.push({ label: 'Skylight replacement', detail: skyCount + ' unit' + (skyCount>1?'s':'') + ' × $1,250', amount: skyCount * 1250 });
    }

    // Eaves
    const eavesLf = +fields.eaves.value || 0;
    if (eavesLf > 0) {
      lines.push({ label: 'Seamless eavestrough', detail: eavesLf + ' lin ft × $11/lf', amount: eavesLf * 11 });
    }

    // Snow guards (estimate count from perimeter)
    if (fields.snow.checked) {
      const perimeter = Math.round(Math.sqrt(sqft) * 4); // rough perimeter
      const guardCount = Math.ceil(perimeter / 4);
      lines.push({ label: 'Snow guards', detail: '~' + guardCount + ' units × $24', amount: guardCount * 24 });
    }

    // Permit
    lines.push({ label: 'Municipal permit &amp; inspection', detail: 'City of ' + cityForPostal(fields.postal.value.slice(0,2)).split(' ')[0], amount: PERMIT_FEE });

    const subtotal = lines.reduce((s, l) => s + l.amount, 0);
    const tax = Math.round(subtotal * HST);
    const total = subtotal + tax;

    return { tier, lines, subtotal, tax, total };
  }

  function round100(n) { return Math.round(n / 50) * 50; }

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      errorBox.hidden = false;
      errorList.innerHTML = errors.map(er => '<li>' + er + '</li>').join('');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorBox.hidden = true;

    const submitBtn = document.getElementById('calcSubmit');
    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const q = compute();
    const quoteId = 'GO2-' + Date.now().toString().slice(-6);
    const pad = (s, n = 38) => String(s).padEnd(n);

    const linesText = q.lines.map(l =>
      '  ' + pad(l.label.replace(/&amp;/g, '&'), 38) + '$' + Math.round(l.amount).toLocaleString()
    ).join('\n');

    const subject = 'New Quote Request — ' + fields.name.value + ' · $' + Math.round(q.total).toLocaleString();
    const message = [
      'NEW QUOTE REQUEST — Go2Roofing Website',
      rule('═'),
      '',
      'Quote ID: ' + quoteId,
      '',
      'CUSTOMER',
      line('Name', fields.name.value),
      line('Email', fields.email.value),
      line('Phone', fields.phone.value),
      line('Address', fields.address.value),
      line('Postal', fields.postal.value),
      '',
      'PROPERTY',
      line('Type', fields.type.selectedOptions[0].textContent),
      line('Storeys', fields.storeys.value),
      line('Sq ft', Number(fields.sqft.value).toLocaleString()),
      line('Pitch', fields.pitch.selectedOptions[0].textContent),
      line('Complexity', fields.complexity.selectedOptions[0].textContent),
      line('Layers', fields.layers.selectedOptions[0].textContent),
      line('Access', fields.access.selectedOptions[0].textContent),
      '',
      'SYSTEM SELECTED',
      '  ' + q.tier.name,
      '  ' + q.tier.warranty,
      '',
      'ADD-ONS',
      line('Ice & water', fields.iws.selectedOptions[0].textContent.replace(' — $0.95/sqft', '')),
      line('Drip edge', fields.drip.selectedOptions[0].textContent),
      line('Skylights', (+fields.skylights.value || 0) + ' unit(s)'),
      line('Eavestrough', (+fields.eaves.value || 0) + ' linear ft'),
      line('Ridge vent', fields.ridge.checked ? 'Yes' : 'No'),
      line('Snow guards', fields.snow.checked ? 'Yes' : 'No'),
      '',
      'ITEMIZED QUOTE',
      rule('─'),
      linesText,
      rule('─'),
      '  ' + pad('Subtotal', 38) + '$' + Math.round(q.subtotal).toLocaleString(),
      '  ' + pad('HST (13%)', 38) + '$' + Math.round(q.tax).toLocaleString(),
      '  ' + pad('TOTAL', 38) + '$' + Math.round(q.total).toLocaleString(),
      '',
      rule('─'),
      'Submitted: ' + new Date().toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' })
    ].join('\n');

    try {
      await sendFormEmail({ subject, message, replyTo: fields.email.value });
      renderQuote(q);
      result.hidden = false;
      form.style.opacity = '.4';
      form.style.pointerEvents = 'none';
      setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
      alert("Sorry, we couldn't send your quote request. Please call (548) 255-0465 or email go2roofer@gmail.com directly.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });

  // Reset
  form.addEventListener('reset', () => {
    result.hidden = true;
    errorBox.hidden = true;
    form.style.opacity = '1';
    form.style.pointerEvents = '';
    form.querySelectorAll('.field.error').forEach(el => el.classList.remove('error'));
    postalHint.textContent = 'We service postal codes starting with N1, N2, N3 (K-W region).';
    postalHint.className = 'field-hint';
  });

  // Render quote
  function renderQuote(q) {
    const id = 'GO2-' + Date.now().toString().slice(-6);
    f('quoteId').textContent = id;
    f('quoteCustomer').textContent = fields.name.value + ' · ' + fields.email.value;
    f('quoteAddress').textContent = (fields.address.value || fields.postal.value) || '';
    f('quoteDate').textContent = new Date().toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });

    f('quoteSystem').innerHTML = `
      <div class="system-pill">
        <span class="system-label">Selected system</span>
        <strong>${q.tier.name}</strong>
        <small>${q.tier.warranty}</small>
      </div>`;

    const tbody = f('quoteLines');
    tbody.innerHTML = q.lines.map(l => `
      <tr>
        <td>${l.label}</td>
        <td class="quote-detail">${l.detail}</td>
        <td class="num">${fmt(l.amount)}</td>
      </tr>`).join('');

    f('quoteSubtotal').textContent = fmt(q.subtotal);
    f('quoteTax').textContent = fmt(q.tax);
    f('quoteTotal').textContent = fmt(q.total);

    // Financing — 12 months 0%
    const monthly = Math.round(q.total / 12);
    f('quoteFinance').textContent = '$' + monthly.toLocaleString();
  }

  function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  // Quote actions
  f('quoteEdit').addEventListener('click', () => {
    result.hidden = true;
    form.style.opacity = '1';
    form.style.pointerEvents = '';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  f('quotePrint').addEventListener('click', () => window.print());
  f('quoteBook').addEventListener('click', () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------- Scroll reveal ---------- */
function initRevealAnimations() {
  const els = document.querySelectorAll('.service-card, .tier, .review-card, .timeline li, .section-head');
  els.forEach(el => el.classList.add('fade-in'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ---------- Nav scroll spy ---------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.getAttribute('id');
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}
