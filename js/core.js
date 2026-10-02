/* Unicorn Quest — core engine: state, i18n, flow, UI building blocks, HUD, sound, effects. */
(() => {
  'use strict';
  const PA = (window.PA = window.PA || {});

  PA.CONFIG = {
    currency: 'CHF', // change to 'EUR' / 'USD' if needed
    targetMinutes: 20,
    startYear: new Date().getFullYear(),
  };

  const freshState = (keep) => ({
    lang: keep ? keep.lang : 'en',
    sound: keep ? keep.sound : true,
    name: '',
    sector: null,
    level: 'explorer',
    commitment: 1000000,
    xp: 0,
    codex: [],
    results: [],
    offered: {},
    done: {},
    startedAt: null,
  });
  PA.state = freshState();
  PA.resetState = () => { PA.state = freshState(PA.state); };

  PA.chapters = [];
  PA.intro = [];
  PA.finale = [];
  PA.ui = {};
  PA.step = {};

  /* ---------------- i18n & formatting ---------------- */
  PA.t = (v) => {
    if (v == null) return '';
    if (typeof v !== 'object') return String(v);
    const x = v[PA.state.lang];
    return x != null ? x : v.en != null ? v.en : '';
  };
  PA.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PA.sector = () => (PA.SECTORS || []).find((s) => s.id === PA.state.sector) || null;
  PA.playerName = () => PA.state.name || PA.t({ en: 'Partner', fr: 'Partenaire' });
  PA.locale = () => (PA.state.lang === 'fr' ? 'fr-CH' : 'en-GB');

  PA.money = (n) => {
    try {
      return new Intl.NumberFormat(PA.locale(), { style: 'currency', currency: PA.CONFIG.currency, maximumFractionDigits: 0 }).format(Math.round(n));
    } catch (e) {
      return PA.CONFIG.currency + ' ' + Math.round(n);
    }
  };
  PA.num = (n, d = 1) => new Intl.NumberFormat(PA.locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  PA.mult = (n) => PA.num(n, 2) + 'x';
  PA.pct = (n, d = 0, sign = true) => (sign && n > 0 ? '+' : '') + PA.num(n * 100, d) + (PA.state.lang === 'fr' ? ' %' : '%');

  PA.vars = () => {
    const s = PA.sector();
    const v = { name: PA.esc(PA.playerName()), year: PA.CONFIG.startYear, cur: PA.CONFIG.currency, commit: PA.money(PA.state.commitment) };
    if (s) {
      v.company = s.company;
      v.sector = PA.t(s.noun);
      v.sectorLabel = PA.t(s.label);
      v.exitBuyer = PA.t(s.exitBuyer);
      v.icon = s.icon;
      s.portfolio.forEach((p, i) => { v['p' + i] = p; });
    }
    return v;
  };
  PA.fill = (str, extra) => {
    const v = Object.assign(PA.vars(), extra || {});
    return String(str).replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m));
  };
  PA.L = (v, extra) => PA.fill(PA.t(v), extra);
  PA.isPro = () => PA.state.level === 'pro';
  PA.pick = (explorer, pro) => (PA.isPro() ? pro : explorer);
  PA.forLevel = (list) => list.filter((c) => c && (!c.pro || PA.isPro()) && (!c.explorer || !PA.isPro()));

  PA.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  PA.rng = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  /* Common UI strings */
  PA.S = {
    continue: { en: 'Continue', fr: 'Continuer' },
    challenge: { en: 'Challenge', fr: 'Défi' },
    perfect: { en: 'Perfect!', fr: 'Parfait !' },
    gotIt: { en: 'Got it!', fr: 'Bien vu !' },
    notQuite: { en: 'Not quite.', fr: 'Pas tout à fait.' },
    tryAgain: { en: 'Have another look and try again.', fr: 'Regardez à nouveau et réessayez.' },
    cardUnlocked: { en: 'Knowledge card unlocked', fr: 'Carte de savoir débloquée' },
    proInsight: { en: 'Pro insight', fr: 'Éclairage Pro' },
    chapter: { en: 'Chapter', fr: 'Chapitre' },
    mission: { en: 'Mission', fr: 'Mission' },
    play: { en: 'Play', fr: 'Jouer' },
    chapterDone: { en: 'Chapter complete', fr: 'Chapitre terminé' },
    explorer: { en: 'Explorer', fr: 'Explorateur' },
    pro: { en: 'Pro', fr: 'Pro' },
    codex: { en: 'Codex', fr: 'Codex' },
    close: { en: 'Close', fr: 'Fermer' },
    tapAll: { en: 'Tap every item to continue.', fr: 'Touchez chaque élément pour continuer.' },
    boss: { en: 'Final boss', fr: 'Boss final' },
    disclaimer: {
      en: 'Educational experience. All figures are simplified and illustrative. Not investment advice, not an offer, and past performance is no indication of future results.',
      fr: 'Expérience pédagogique. Tous les chiffres sont simplifiés et illustratifs. Ceci ne constitue ni un conseil en investissement ni une offre ; les performances passées ne préjugent pas des résultats futurs.',
    },
  };

  /* ---------------- timers & animation (auto-cleaned between steps) ---------------- */
  const timers = new Set();
  const rafs = new Set();
  PA.later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  };
  PA.anim = (dur, onFrame, onDone) => {
    const t0 = performance.now();
    let id;
    const tick = (now) => {
      rafs.delete(id);
      const p = Math.min(1, (now - t0) / dur);
      onFrame(p);
      if (p < 1) { id = requestAnimationFrame(tick); rafs.add(id); } else if (onDone) onDone();
    };
    id = requestAnimationFrame(tick);
    rafs.add(id);
  };
  PA.cleanup = () => {
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    rafs.forEach((id) => cancelAnimationFrame(id));
    rafs.clear();
  };

  /* ---------------- flow ---------------- */
  PA.flow = { steps: [], i: 0 };
  PA.buildFlow = () => {
    const steps = [];
    PA.intro.forEach((fn) => steps.push({ chapter: null, fn }));
    PA.chapters.forEach((ch, ci) => {
      steps.push({ chapter: ch.id, fn: () => PA.chapterIntro(ch, ci) });
      ch.steps.forEach((fn) => steps.push({ chapter: ch.id, fn }));
      steps.push({ chapter: ch.id, fn: () => PA.chapterDone(ch, ci) });
    });
    PA.finale.forEach((fn) => steps.push({ chapter: 'boss', fn }));
    PA.flow.steps = steps;
  };
  PA.go = (i) => {
    const s = PA.flow.steps[i];
    if (!s) return;
    PA.cleanup();
    PA.flow.i = i;
    PA.currentChapter = s.chapter;
    s.fn();
    PA.hud.update();
  };
  PA.next = () => PA.go(PA.flow.i + 1);
  PA.rerender = () => PA.go(PA.flow.i);
  PA.jumpChapter = (id) => {
    const i = PA.flow.steps.findIndex((s) => s.chapter === id);
    if (i >= 0) PA.go(i);
  };

  /* ---------------- sound (tiny WebAudio synth, no files) ---------------- */
  PA.sfx = (() => {
    let ctx = null;
    const tone = (f, d, type = 'sine', vol = 0.05, when = 0) => {
      if (!PA.state.sound) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        const t = ctx.currentTime + when;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + d + 0.02);
      } catch (e) { /* audio unavailable */ }
    };
    return {
      click: () => tone(720, 0.05, 'triangle', 0.04),
      good: () => { tone(660, 0.1, 'sine', 0.06); tone(880, 0.1, 'sine', 0.06, 0.08); tone(1320, 0.18, 'sine', 0.05, 0.16); },
      bad: () => { tone(200, 0.18, 'sawtooth', 0.025); tone(150, 0.22, 'sawtooth', 0.02, 0.1); },
      coin: () => { tone(988, 0.07, 'square', 0.025); tone(1319, 0.16, 'square', 0.025, 0.07); },
      flip: () => tone(440, 0.06, 'triangle', 0.04),
      level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.05, i * 0.1)),
      boom: () => { tone(90, 0.4, 'sawtooth', 0.04); tone(60, 0.5, 'sine', 0.06, 0.05); },
    };
  })();

  /* ---------------- UI building blocks ---------------- */
  PA.$ = (sel, root = document) => root.querySelector(sel);
  PA.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  PA.ui.render = (html, cls = '') => {
    const st = document.getElementById('stage');
    st.innerHTML = `<div class="screen ${cls}">${html}</div>`;
    window.scrollTo(0, 0);
    return st.firstElementChild;
  };
  PA.ui.guide = (text, cls = '') => `<div class="guide ${cls}"><div class="orb"><span></span></div><div class="bubble"><div class="who">NOVA</div><div class="say">${text}</div></div></div>`;
  PA.ui.btn = (label, attrs = '', cls = 'primary') => `<button class="btn ${cls}" ${attrs}>${label}</button>`;
  PA.ui.cont = (label, attrs = '') => `<div class="actions">${PA.ui.btn((label || PA.L(PA.S.continue)) + ' <span class="arr">▸</span>', 'data-next ' + attrs)}</div>`;
  PA.ui.bindNext = (root, cb) => PA.$$('[data-next]', root).forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; PA.sfx.click(); (cb || PA.next)(); }));
  PA.ui.enableNext = (root) => PA.$$('[data-next]', root).forEach((b) => { b.disabled = false; b.classList.add('pulse'); });

  PA.ui.toast = (text) => {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = text;
    box.appendChild(el);
    setTimeout(() => el.classList.add('out'), 1800);
    setTimeout(() => el.remove(), 2300);
  };

  PA.addXP = (n, anchor) => {
    PA.state.xp += n;
    PA.hud.update();
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.textContent = '+' + n + ' XP';
    const r = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
    el.style.left = r.left + r.width / 2 + 'px';
    el.style.top = r.top + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  };

  PA.codexAdd = (card) => {
    if (!card.id || PA.state.codex.find((c) => c.id === card.id)) return;
    PA.state.codex.push(card);
    PA.hud.update();
    const b = document.getElementById('hud-codex');
    if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  };

  PA.ui.insight = (card) => {
    PA.codexAdd(card);
    const tag = card.pro ? '◆ ' + PA.L(PA.S.proInsight) : '✦ ' + PA.L(PA.S.cardUnlocked);
    return `<div class="insight ${card.pro ? 'pro' : ''}">
      <div class="insight-tag">${tag}</div>
      <div class="insight-head"><span class="ic">${card.icon || '💡'}</span><h3>${PA.L(card.title)}</h3></div>
      <div class="insight-body">${PA.L(card.body)}</div>
    </div>`;
  };

  /* Interactive challenge (multiple choice with retry). def = {explorer:{q,options,answer,explain,hint}, pro:{...}} */
  PA.ui.challenge = (def, opts = {}) => {
    const lv = (PA.isPro() && def.pro) || def.explorer || def;
    const order = PA.shuffle(lv.options.map((_, i) => i));
    const root = PA.ui.render(`
      <div class="center-col">
        <div class="challenge">
          <div class="ch-tag">⚔️ ${PA.L(PA.S.challenge)}${PA.isPro() && def.pro ? ' · PRO' : ''}</div>
          <h2>${PA.L(lv.q)}</h2>
          <div class="options">${order.map((oi, k) => `<button class="opt" data-i="${oi}"><span class="key">${'ABCD'[k]}</span><span>${PA.L(lv.options[oi])}</span></button>`).join('')}</div>
          <div class="feedback" hidden></div>
        </div>
      </div>`);
    const fb = PA.$('.feedback', root);
    let tries = 0;
    let solved = false;
    PA.$$('.opt', root).forEach((btn) => btn.addEventListener('click', () => {
      if (solved || btn.disabled) return;
      tries++;
      const i = +btn.dataset.i;
      fb.hidden = false;
      if (i === lv.answer) {
        solved = true;
        btn.classList.add('correct');
        PA.$$('.opt', root).forEach((b) => { if (b !== btn) b.classList.add('dim'); });
        PA.sfx.good();
        PA.addXP(tries === 1 ? 100 : 40, btn);
        PA.state.results.push({ chapter: PA.currentChapter, first: tries === 1 });
        fb.className = 'feedback ok';
        fb.innerHTML = `<b>✓ ${PA.L(tries === 1 ? PA.S.perfect : PA.S.gotIt)}</b> ${PA.L(lv.explain)}` + PA.ui.cont();
        PA.ui.bindNext(fb, opts.onDone);
      } else {
        btn.classList.add('wrong', 'shake');
        btn.disabled = true;
        PA.sfx.bad();
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>✗ ${PA.L(PA.S.notQuite)}</b> ${PA.L(lv.hint || PA.S.tryAgain)}`;
      }
    }));
    return root;
  };

  /* Step factories */
  PA.step.say = (text, opts = {}) => () => {
    const extra = typeof opts.extra === 'function' ? opts.extra() : opts.extra || '';
    const root = PA.ui.render(`<div class="center-col">${opts.top || ''}${PA.ui.guide(PA.L(text))}${extra}${PA.ui.cont(opts.cta && PA.L(opts.cta))}</div>`);
    PA.ui.bindNext(root);
  };
  PA.step.insight = (cards, opts = {}) => () => {
    const list = PA.forLevel(typeof cards === 'function' ? cards() : cards);
    const say = opts.say ? PA.ui.guide(PA.L(typeof opts.say === 'function' ? opts.say() : opts.say)) : '';
    const root = PA.ui.render(`<div class="wide-col">${say}<div class="insights">${list.map(PA.ui.insight).join('')}</div>${PA.ui.cont()}</div>`);
    PA.ui.bindNext(root);
  };
  PA.step.challenge = (def) => () => PA.ui.challenge(def);

  /* Generic "tap every item" explorer. items: [{key, html}], onAll() */
  PA.ui.trackAll = (root, selector, onAll) => {
    const seen = new Set();
    const els = PA.$$(selector, root);
    return (el) => {
      seen.add(el);
      el.classList.add('seen');
      if (seen.size === els.length && onAll) { const f = onAll; onAll = null; f(); }
    };
  };

  /* ---------------- chapter intro / outro ---------------- */
  PA.chapterIntro = (ch, ci) => {
    const lvl = PA.isPro() ? PA.L(PA.S.pro) : PA.L(PA.S.explorer);
    const root = PA.ui.render(`
      <div class="chapter-intro">
        <div class="ch-num">${PA.L(PA.S.chapter)} ${ci + 1} / ${PA.chapters.length}</div>
        <div class="ch-icon">${ch.icon}</div>
        <h1 class="ch-title">${PA.L(ch.title)}</h1>
        <p class="ch-sub">${PA.L(ch.tagline)}</p>
        <div class="mission"><span>🎯 ${PA.L(PA.S.mission)}</span>${PA.L(ch.mission)}</div>
        <div class="mode-pill ${PA.isPro() ? 'pro' : ''}">${PA.isPro() ? '◆' : '✦'} ${lvl}</div>
        ${PA.ui.cont(PA.L(PA.S.play))}
      </div>`, 'intro-screen');
    PA.sfx.level();
    PA.ui.bindNext(root);
  };

  PA.chapterDone = (ch, ci) => {
    PA.state.done[ch.id] = true;
    const res = PA.state.results.filter((r) => r.chapter !== 'boss' && r.chapter !== 'calib');
    const last3 = res.slice(-3);
    const last2 = res.slice(-2);
    let offer = '';
    if (!PA.isPro() && ci >= 2 && last3.length === 3 && last3.every((r) => r.first) && !PA.state.offered.up) {
      PA.state.offered.up = true;
      offer = `<div class="offer">
        <div>🔥 ${PA.L({ en: 'Three perfect challenges in a row! You clearly know your stuff.', fr: 'Trois défis parfaits d’affilée ! Vous maîtrisez le sujet.' })}</div>
        <div class="actions"><button class="btn gold" data-lv="pro">◆ ${PA.L({ en: 'Level up to Pro mode', fr: 'Passer en mode Pro' })}</button><button class="btn ghost" data-lv="stay">${PA.L({ en: 'Stay in Explorer', fr: 'Rester en Explorateur' })}</button></div></div>`;
    } else if (PA.isPro() && last2.length === 2 && last2.every((r) => !r.first) && !PA.state.offered.down) {
      PA.state.offered.down = true;
      offer = `<div class="offer">
        <div>🧭 ${PA.L({ en: 'Pro mode is dense. Want Nova to slow down and focus on the essentials?', fr: 'Le mode Pro est dense. Voulez-vous que Nova ralentisse et se concentre sur l’essentiel ?' })}</div>
        <div class="actions"><button class="btn gold" data-lv="explorer">✦ ${PA.L({ en: 'Switch to Explorer', fr: 'Passer en Explorateur' })}</button><button class="btn ghost" data-lv="stay">${PA.L({ en: 'Keep Pro', fr: 'Garder Pro' })}</button></div></div>`;
    }
    const cards = PA.state.codex.length;
    const root = PA.ui.render(`
      <div class="chapter-done">
        <div class="trophy">🏆</div>
        <div class="ch-num">${PA.L(PA.S.chapterDone)}</div>
        <h1 class="ch-title">${PA.L(ch.title)}</h1>
        <div class="done-stats">
          <div><b>${PA.state.xp}</b><span>XP</span></div>
          <div><b>${cards}</b><span>${PA.L({ en: 'cards', fr: 'cartes' })}</span></div>
          <div><b>${ci + 1}/${PA.chapters.length}</b><span>${PA.L({ en: 'chapters', fr: 'chapitres' })}</span></div>
        </div>
        ${offer}
        ${PA.ui.cont()}
      </div>`, 'intro-screen');
    PA.confetti(80);
    PA.sfx.level();
    PA.$$('[data-lv]', root).forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.lv;
      if (v !== 'stay') { PA.state.level = v; PA.hud.update(); PA.sfx.level(); }
      PA.$('.offer', root).innerHTML = `<div>${v === 'stay' ? '👍' : '✨ ' + PA.L({ en: 'Mode updated — the next chapters adapt.', fr: 'Mode mis à jour — les prochains chapitres s’adaptent.' })}</div>`;
    }));
    PA.ui.bindNext(root);
  };

  /* ---------------- HUD ---------------- */
  PA.hud = {
    init() {
      const h = document.getElementById('hud');
      h.innerHTML = `
        <button class="brand" id="hud-menu" title="Menu"><span class="logo">🦄</span><span class="brand-txt">UNICORN<b>QUEST</b></span><span class="burger">☰</span></button>
        <div class="dots" id="hud-dots"></div>
        <div class="stats">
          <span class="xp" id="hud-xp">0 XP</span>
          <button class="chip" id="hud-codex">📚 <b>0</b></button>
          <button class="chip mode" id="hud-mode"></button>
          <span class="time" id="hud-time">00:00</span>
          <button class="chip" id="hud-sound"></button>
        </div>`;
      PA.$('#hud-menu').addEventListener('click', () => PA.overlay.menu());
      PA.$('#hud-codex').addEventListener('click', () => PA.overlay.codex());
      PA.$('#hud-mode').addEventListener('click', () => {
        PA.state.level = PA.isPro() ? 'explorer' : 'pro';
        PA.sfx.level();
        PA.hud.update();
        PA.ui.toast(PA.isPro()
          ? '◆ ' + PA.L({ en: 'Pro mode: the next steps go deeper.', fr: 'Mode Pro : les prochaines étapes vont plus loin.' })
          : '✦ ' + PA.L({ en: 'Explorer mode: focus on the essentials.', fr: 'Mode Explorateur : l’essentiel avant tout.' }));
      });
      PA.$('#hud-sound').addEventListener('click', () => { PA.state.sound = !PA.state.sound; PA.hud.update(); });
      setInterval(() => PA.hud.tick(), 1000);
    },
    tick() {
      const el = document.getElementById('hud-time');
      if (!el || !PA.state.startedAt) return;
      const s = Math.floor((Date.now() - PA.state.startedAt) / 1000);
      el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      el.classList.toggle('over', s > PA.CONFIG.targetMinutes * 60);
    },
    update() {
      const h = document.getElementById('hud');
      if (!h || !h.firstElementChild) return;
      h.hidden = PA.currentChapter === null && !PA.state.sector;
      PA.$('#hud-xp').textContent = PA.state.xp + ' XP';
      PA.$('#hud-codex b').textContent = PA.state.codex.length;
      const m = PA.$('#hud-mode');
      m.textContent = (PA.isPro() ? '◆ ' : '✦ ') + PA.L(PA.isPro() ? PA.S.pro : PA.S.explorer);
      m.classList.toggle('pro', PA.isPro());
      PA.$('#hud-sound').textContent = PA.state.sound ? '🔊' : '🔇';
      const dots = PA.chapters.map((c, i) => {
        const cls = PA.currentChapter === c.id ? 'cur' : PA.state.done[c.id] ? 'done' : '';
        return `<span class="dot ${cls}" title="${PA.esc(PA.L(c.title))}">${PA.state.done[c.id] ? '✓' : i + 1}</span>`;
      });
      dots.push(`<span class="dot boss ${PA.currentChapter === 'boss' ? 'cur' : ''}" title="${PA.esc(PA.L(PA.S.boss))}">★</span>`);
      PA.$('#hud-dots').innerHTML = dots.join('');
      document.documentElement.lang = PA.state.lang;
    },
  };

  /* ---------------- overlays (menu, codex) ---------------- */
  PA.overlay = {
    open(html) {
      const o = document.getElementById('overlay');
      o.innerHTML = `<div class="modal"><button class="x" aria-label="close">✕</button>${html}</div>`;
      o.hidden = false;
      o.onclick = (e) => { if (e.target === o || e.target.classList.contains('x')) PA.overlay.close(); };
      return o;
    },
    close() { const o = document.getElementById('overlay'); o.hidden = true; o.innerHTML = ''; },
    menu() {
      const L = PA.L;
      const chs = PA.chapters.map((c, i) => `<button class="menu-ch ${PA.state.done[c.id] ? 'done' : ''}" data-ch="${c.id}"><span>${c.icon}</span>${i + 1}. ${L(c.title)}</button>`).join('')
        + `<button class="menu-ch" data-ch="boss"><span>👑</span>${L(PA.S.boss)}</button>`;
      const o = PA.overlay.open(`
        <h2>☰ ${L({ en: 'Banker console', fr: 'Console du banquier' })}</h2>
        <div class="menu-row"><span>${L({ en: 'Language', fr: 'Langue' })}</span>
          <div class="seg"><button data-lang="en" class="${PA.state.lang === 'en' ? 'on' : ''}">English</button><button data-lang="fr" class="${PA.state.lang === 'fr' ? 'on' : ''}">Français</button></div></div>
        <div class="menu-row"><span>${L({ en: 'Difficulty', fr: 'Niveau' })}</span>
          <div class="seg"><button data-lvl="explorer" class="${!PA.isPro() ? 'on' : ''}">✦ ${L(PA.S.explorer)}</button><button data-lvl="pro" class="${PA.isPro() ? 'on' : ''}">◆ Pro</button></div></div>
        <div class="menu-sub">${L({ en: 'Jump to', fr: 'Aller à' })}</div>
        <div class="menu-chs">${PA.state.sector ? chs : `<em>${L({ en: 'Choose a sector first.', fr: 'Choisissez d’abord un secteur.' })}</em>`}</div>
        <div class="actions"><button class="btn ghost" data-restart>↺ ${L({ en: 'Restart the game', fr: 'Recommencer la partie' })}</button></div>`);
      PA.$$('[data-lang]', o).forEach((b) => b.addEventListener('click', () => { PA.state.lang = b.dataset.lang; PA.overlay.close(); PA.rerender(); }));
      PA.$$('[data-lvl]', o).forEach((b) => b.addEventListener('click', () => { PA.state.level = b.dataset.lvl; PA.overlay.close(); PA.rerender(); }));
      PA.$$('[data-ch]', o).forEach((b) => b.addEventListener('click', () => { PA.overlay.close(); PA.jumpChapter(b.dataset.ch); }));
      PA.$('[data-restart]', o).addEventListener('click', () => { PA.overlay.close(); PA.resetState(); PA.go(0); });
    },
    codex() {
      const L = PA.L;
      const cards = PA.state.codex;
      PA.overlay.open(`
        <h2>📚 ${L(PA.S.codex)} <small>${cards.length} ${L({ en: 'cards', fr: 'cartes' })}</small></h2>
        <div class="codex">${cards.length ? cards.map((c) => `<div class="codex-card ${c.pro ? 'pro' : ''}"><div class="ic">${c.icon || '💡'}</div><div><h4>${L(c.title)}</h4><p>${L(c.body)}</p></div></div>`).join('')
          : `<em>${L({ en: 'Your knowledge cards will appear here as you play.', fr: 'Vos cartes de savoir apparaîtront ici au fil du jeu.' })}</em>`}</div>`);
    },
  };

  /* ---------------- effects ---------------- */
  PA.confetti = (n = 120) => {
    const c = document.getElementById('fx');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const colors = ['#f5c86b', '#3ef2d0', '#8b7bff', '#ff6fa8', '#ffffff'];
    const parts = Array.from({ length: n }, () => ({
      x: c.width / 2 + (Math.random() - 0.5) * 200, y: c.height * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      s: Math.random() * 6 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      col: colors[(Math.random() * colors.length) | 0],
    }));
    let frames = 0;
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (++frames < 150) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height);
    };
    requestAnimationFrame(tick);
  };

  PA.starfield = () => {
    const c = document.getElementById('bg');
    const ctx = c.getContext('2d');
    let stars = [];
    const resize = () => {
      c.width = window.innerWidth; c.height = window.innerHeight;
      stars = Array.from({ length: Math.min(160, (c.width * c.height) / 9000) }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height, z: Math.random() * 0.8 + 0.2, t: Math.random() * 6,
      }));
    };
    resize();
    window.addEventListener('resize', resize);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach((s) => {
        if (!reduce) { s.y += s.z * 0.15; s.t += 0.02; if (s.y > c.height) { s.y = 0; s.x = Math.random() * c.width; } }
        const a = 0.25 + 0.35 * s.z + 0.2 * Math.sin(s.t);
        ctx.fillStyle = `rgba(200,215,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.z * 1.4, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  };

  /* ---------------- financial helpers ---------------- */
  PA.irr = (cfs) => {
    const npv = (r) => cfs.reduce((a, cf, t) => a + cf / Math.pow(1 + r, t), 0);
    let lo = -0.99, hi = 2;
    if (npv(lo) * npv(hi) > 0) return null;
    for (let k = 0; k < 100; k++) {
      const mid = (lo + hi) / 2;
      if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  };
})();
