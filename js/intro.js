/* Intro: language, player name, sector choice, knowledge calibration. */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  // 1. Title screen + language
  PA.intro.push(() => {
    const root = PA.ui.render(`
      <div class="title-screen">
        <div class="title-logo">🦄</div>
        <h1 class="game-title">UNICORN<span>QUEST</span></h1>
        <p class="title-sub">A private markets adventure<br><em>Une aventure dans les marchés privés</em></p>
        <div class="lang-pick">
          <button class="lang-btn" data-lang="en"><span class="flag">EN</span>English<small>Press start</small></button>
          <button class="lang-btn" data-lang="fr"><span class="flag">FR</span>Français<small>Appuyez sur start</small></button>
        </div>
        <p class="title-foot">⏱ ~20 min · 8 chapters / chapitres · 1 boss</p>
      </div>`, 'title');
    PA.$$('[data-lang]', root).forEach((b) => b.addEventListener('click', () => {
      PA.state.lang = b.dataset.lang;
      PA.sfx.level();
      PA.next();
    }));
  });

  // 2. Player name
  PA.intro.push(() => {
    const root = PA.ui.render(`
      <div class="center-col">
        ${PA.ui.guide(L({
          en: 'Hi, I’m <b>Nova</b>, your guide. In the next 20 minutes you’ll build a company, become an investor and take on the Investment Committee. First, what should I call you?',
          fr: 'Bonjour, je suis <b>Nova</b>, votre guide. Pendant les 20 prochaines minutes, vous allez créer une entreprise, devenir investisseur et affronter le Comité d’investissement. D’abord, comment dois-je vous appeler ?',
        }))}
        <div class="name-box">
          <input id="pname" maxlength="28" autocomplete="off" placeholder="${L({ en: 'Your first name', fr: 'Votre prénom' })}" value="${PA.esc(PA.state.name)}">
        </div>
        ${PA.ui.cont()}
      </div>`);
    const inp = PA.$('#pname', root);
    setTimeout(() => inp.focus(), 50);
    const go = () => { PA.state.name = inp.value.trim(); PA.next(); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { PA.sfx.click(); go(); } });
    PA.ui.bindNext(root, go);
  });

  // 3. Sector choice
  PA.intro.push(() => {
    const root = PA.ui.render(`
      <div class="wide-col">
        ${PA.ui.guide(L({
          en: 'Imagine you could start <b>any company</b> tomorrow, {name}. Which world would you build it in?',
          fr: 'Imaginez que vous puissiez créer <b>n’importe quelle entreprise</b> demain, {name}. Dans quel univers la lanceriez-vous ?',
        }))}
        <div class="sector-grid">
          ${PA.SECTORS.map((s) => `
            <button class="sector-card" data-s="${s.id}" style="--c:${s.color}">
              <span class="s-icon">${s.icon}</span>
              <span class="s-name">${L(s.label)}</span>
              <span class="s-pitch">${L(s.pitch)}</span>
            </button>`).join('')}
        </div>
      </div>`);
    PA.$$('[data-s]', root).forEach((b) => b.addEventListener('click', () => {
      PA.state.sector = b.dataset.s;
      if (!PA.state.startedAt) PA.state.startedAt = Date.now();
      PA.sfx.coin();
      PA.next();
    }));
  });

  // 4. Company reveal
  PA.intro.push(() => {
    const s = PA.sector();
    const root = PA.ui.render(`
      <div class="center-col">
        <div class="company-reveal" style="--c:${s.color}">
          <div class="cr-icon">${s.icon}</div>
          <div class="cr-label">${L({ en: 'Your company', fr: 'Votre entreprise' })}</div>
          <div class="cr-name">{company}</div>
          <div class="cr-pitch">“${L(s.pitch)}”</div>
        </div>
        ${PA.ui.guide(L({
          en: 'Meet <b>{company}</b>, your new venture in {sector}. Hold on to it: its story will guide you through the whole world of <b>private assets</b>.',
          fr: 'Voici <b>{company}</b>, votre nouvelle aventure dans {sector}. Gardez-la en tête : son histoire va vous guider à travers tout l’univers des <b>actifs privés</b>.',
        }))}
        ${PA.ui.cont()}
      </div>`.replace('{company}', s.company));
    PA.confetti(60);
    PA.ui.bindNext(root);
  });

  // 5. Calibration ("scouting round"), which sets Explorer / Pro
  const CALIB = [
    {
      q: { en: 'How familiar are you with private-market investments (private equity, private debt, infrastructure…)?', fr: 'Dans quelle mesure connaissez-vous les investissements sur les marchés privés (private equity, dette privée, infrastructures…) ?' },
      options: [
        { en: '🌱 New to me', fr: '🌱 C’est nouveau pour moi' },
        { en: '🌿 I’ve heard of them / own a little', fr: '🌿 J’en ai entendu parler / j’en détiens un peu' },
        { en: '🌳 I invest in them regularly', fr: '🌳 J’y investis régulièrement' },
      ],
      self: true,
    },
    {
      q: { en: 'A private equity fund “calls capital”. What does that mean?', fr: 'Un fonds de private equity « appelle du capital ». Qu’est-ce que cela signifie ?' },
      options: [
        { en: 'It asks investors to transfer part of the money they promised', fr: 'Il demande aux investisseurs de verser une partie de l’argent promis' },
        { en: 'It gives money back to investors', fr: 'Il rend de l’argent aux investisseurs' },
        { en: 'It closes the fund to new investors', fr: 'Il ferme le fonds aux nouveaux investisseurs' },
        { en: 'I’m not sure', fr: 'Je ne sais pas' },
      ],
      answer: 0,
    },
    {
      q: { en: 'What does the “J-curve” describe?', fr: 'Que décrit la « courbe en J » ?' },
      options: [
        { en: 'Negative returns in the early years, then gains as investments mature', fr: 'Des rendements négatifs les premières années, puis des gains à mesure que les investissements mûrissent' },
        { en: 'Fees that increase every year', fr: 'Des frais qui augmentent chaque année' },
        { en: 'The long-term trend of the stock market', fr: 'La tendance de long terme de la bourse' },
        { en: 'I’m not sure', fr: 'Je ne sais pas' },
      ],
      answer: 0,
    },
    {
      q: { en: 'A fund reports DPI = 0.4x and TVPI = 1.6x. What does this tell you?', fr: 'Un fonds affiche un DPI de 0,4x et un TVPI de 1,6x. Qu’est-ce que cela signifie ?' },
      options: [
        { en: '40% of the paid-in capital came back in cash; the rest of the value is still unrealised', fr: '40 % du capital versé est revenu en cash ; le reste de la valeur n’est pas encore réalisé' },
        { en: 'The fund has lost 60%', fr: 'Le fonds a perdu 60 %' },
        { en: 'Investors have already received 1.6x their money in cash', fr: 'Les investisseurs ont déjà reçu 1,6 fois leur mise en cash' },
        { en: 'I’m not sure', fr: 'Je ne sais pas' },
      ],
      answer: 0,
    },
  ];

  PA.intro.push(() => {
    let idx = 0;
    let self = 0;
    let correct = 0;
    const draw = () => {
      const c = CALIB[idx];
      // Keep self-assessment in order; shuffle knowledge answers but keep "I'm not sure" last.
      const last = c.options.length - 1;
      const order = c.self ? c.options.map((_, i) => i) : PA.shuffle(c.options.slice(0, last).map((_, i) => i)).concat(last);
      const root = PA.ui.render(`
        <div class="center-col">
          ${idx === 0 ? PA.ui.guide(L({
            en: 'Quick <b>scouting round</b>, so I can tune the game to you. There are no wrong answers here, and “not sure” is perfectly fine.',
            fr: 'Petit <b>tour de repérage</b> pour adapter le jeu à votre profil. Il n’y a pas de mauvaise réponse, et « je ne sais pas » est parfaitement acceptable.',
          })) : ''}
          <div class="challenge calib">
            <div class="ch-tag">🔭 ${L({ en: 'Scouting', fr: 'Repérage' })} ${idx + 1}/${CALIB.length}</div>
            <div class="calib-bar"><span style="width:${(idx / CALIB.length) * 100}%"></span></div>
            <h2>${L(c.q)}</h2>
            <div class="options">${order.map((i, k) => `<button class="opt" data-i="${i}"><span class="key">${'ABCD'[k]}</span><span>${L(c.options[i])}</span></button>`).join('')}</div>
          </div>
        </div>`);
      PA.$$('.opt', root).forEach((b) => b.addEventListener('click', () => {
        const i = +b.dataset.i;
        PA.sfx.click();
        if (c.self) self = i; else if (i === c.answer) correct++;
        b.classList.add('chosen');
        PA.later(() => {
          idx++;
          if (idx < CALIB.length) draw(); else result();
        }, 250);
      }));
    };
    const result = () => {
      const pro = correct >= 2 && (self >= 1 || correct === 3);
      PA.state.level = pro ? 'pro' : 'explorer';
      PA.state.results.push({ chapter: 'calib', first: true, self, correct });
      const root = PA.ui.render(`
        <div class="center-col">
          <div class="mode-result">
            <div class="mr-cards">
              <button class="mode-card ${!pro ? 'on' : ''}" data-m="explorer">
                <span class="mc-ic">✦</span><b>${L(PA.S.explorer)}</b>
                <small>${L({ en: 'Build it from the ground up: what, why and how, with plenty of examples.', fr: 'Tout construire depuis la base : quoi, pourquoi, comment, avec beaucoup d’exemples.' })}</small>
              </button>
              <button class="mode-card pro ${pro ? 'on' : ''}" data-m="pro">
                <span class="mc-ic">◆</span><b>Pro</b>
                <small>${L({ en: 'Go deep: DPI/TVPI/IRR, waterfalls & catch-up, secondaries, the denominator effect, semi-liquid structures.', fr: 'Aller en profondeur : DPI/TVPI/TRI, cascade & rattrapage, secondaire, effet dénominateur, fonds semi-liquides.' })}</small>
              </button>
            </div>
          </div>
          ${PA.ui.guide(L(pro
            ? { en: 'Impressive: you already speak the language. I’ve set the game to <b>Pro mode</b>. Expect harder challenges and deeper insights.', fr: 'Impressionnant : vous parlez déjà le langage. J’ai réglé le jeu en <b>mode Pro</b>. Attendez-vous à des défis plus corsés et des éclairages plus pointus.' }
            : { en: 'Perfect. I’ve set the game to <b>Explorer mode</b>: we’ll build everything step by step. If you breeze through, I’ll level you up along the way.', fr: 'Parfait. J’ai réglé le jeu en <b>mode Explorateur</b> : nous allons tout construire pas à pas. Si vous êtes à l’aise, je vous ferai monter de niveau en cours de route.' }))}
          ${PA.ui.cont(L({ en: 'Start the adventure', fr: 'Commencer l’aventure' }))}
        </div>`);
      PA.sfx.level();
      PA.$$('[data-m]', root).forEach((b) => b.addEventListener('click', () => {
        PA.state.level = b.dataset.m;
        PA.$$('[data-m]', root).forEach((x) => x.classList.toggle('on', x === b));
        PA.sfx.click();
        PA.hud.update();
      }));
      PA.ui.bindNext(root);
    };
    draw();
  });
})();
