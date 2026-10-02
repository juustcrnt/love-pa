/* Chapter 1: Founder Mode (LO1, what private assets are and how a fund is organised). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const DOORS = [
    {
      id: 'ipo', icon: '🏛️', ok: false,
      label: { en: 'List on the stock exchange', fr: 'Entrer en bourse' },
      res: { en: '<b>Too early.</b> An IPO needs years of revenue, audited accounts, heavy regulation and high costs. Companies at your stage are almost always <b>private</b>.', fr: '<b>Trop tôt.</b> Une introduction en bourse exige des années de chiffre d’affaires, des comptes audités, une lourde réglementation et des coûts élevés. À votre stade, les entreprises sont presque toujours <b>privées</b>.' },
    },
    {
      id: 'bank', icon: '🏦', ok: false,
      label: { en: 'Ask a bank for a loan', fr: 'Demander un prêt à une banque' },
      res: { en: '<b>Partial.</b> The bank likes your plan, but it lends against assets and steady cash flows you don’t have yet. Maybe a small loan, but not 5 million.', fr: '<b>Partiel.</b> La banque apprécie votre projet, mais elle prête sur la base d’actifs et de flux de trésorerie réguliers que vous n’avez pas encore. Peut-être un petit prêt, mais pas 5 millions.' },
    },
    {
      id: 'fund', icon: '🦄', ok: true,
      label: { en: 'Pitch a venture capital / private equity fund', fr: 'Pitcher un fonds de capital-risque / private equity' },
      res: { en: '<b>Deal!</b> The fund invests 5 million for 25% of {company}. It joins your board and helps you grow. You’ve just raised <b>private capital</b>.', fr: '<b>Marché conclu !</b> Le fonds investit 5 millions pour 25 % de {company}. Il entre à votre conseil d’administration et vous aide à grandir. Vous venez de lever du <b>capital privé</b>.' },
    },
  ];

  const NODES = [
    {
      id: 'lp', icon: '🧑‍💼', name: { en: 'You: the LP', fr: 'Vous : le LP' }, sub: { en: 'Limited Partner', fr: 'Limited Partner (associé commanditaire)' },
      body: { en: 'You <b>commit</b> money to the fund. Your risk is limited to what you commit. You don’t pick the companies: you pick the <b>manager</b>.', fr: 'Vous <b>engagez</b> de l’argent dans le fonds. Votre risque est limité à votre engagement. Vous ne choisissez pas les entreprises : vous choisissez le <b>gérant</b>.' },
      pro: { en: 'LPs are typically pension funds, insurers, endowments, family offices and, increasingly, private clients via feeder funds.', fr: 'Les LP sont en général des caisses de pension, assureurs, fondations, family offices et, de plus en plus, des clients privés via des fonds nourriciers (feeders).' },
    },
    {
      id: 'fund', icon: '🏦', name: { en: 'The fund', fr: 'Le fonds' }, sub: { en: 'A pool with a fixed life', fr: 'Un véhicule à durée fixe' },
      body: { en: 'A vehicle that pools money from many investors, usually for <b>10–12 years</b>. It has a start date: its <b>vintage</b>.', fr: 'Un véhicule qui rassemble l’argent de nombreux investisseurs, généralement pour <b>10 à 12 ans</b>. Il a une date de naissance : son <b>millésime</b>.' },
      pro: { en: 'Usually a limited partnership (e.g. Luxembourg SCSp, Delaware LP, Swiss L-QIF or KmGK). Rules live in the LPA; an LP Advisory Committee handles conflicts of interest.', fr: 'Souvent une société en commandite (ex. SCSp luxembourgeoise, LP du Delaware, L-QIF ou SCPC suisse). Les règles figurent dans le LPA ; un comité consultatif des LP gère les conflits d’intérêts.' },
    },
    {
      id: 'gp', icon: '🧭', name: { en: 'The GP', fr: 'Le GP' }, sub: { en: 'General Partner, the manager', fr: 'General Partner, le gérant' },
      body: { en: 'The professional team that <b>finds, buys, improves and sells</b> companies. It also invests its own money alongside you.', fr: 'L’équipe de professionnels qui <b>trouve, achète, améliore et revend</b> les entreprises. Elle investit aussi son propre argent à vos côtés.' },
      pro: { en: 'GP commitment is typically 1–3% of the fund: “skin in the game”. The GP earns a management fee plus carried interest (Chapter 7).', fr: 'L’engagement du GP représente souvent 1 à 3 % du fonds : il « mouille sa chemise ». Il perçoit des frais de gestion et un carried interest (chapitre 7).' },
    },
    {
      id: 'port', icon: '🏭', name: { en: 'The portfolio', fr: 'Le portefeuille' }, sub: { en: '10 to 20 companies', fr: '10 à 20 entreprises' },
      body: { en: 'Companies like <b>{company}</b>, {p0}, {p1}, {p2}… The fund owns stakes, sits on their boards and helps them grow.', fr: 'Des entreprises comme <b>{company}</b>, {p0}, {p1}, {p2}… Le fonds détient des participations, siège à leurs conseils et les aide à grandir.' },
      pro: { en: 'Concentration is a feature: each deal is 5–10% of the fund, so a single company can make or break the result.', fr: 'La concentration est voulue : chaque opération pèse 5 à 10 % du fonds, une seule entreprise peut donc faire ou défaire la performance.' },
    },
  ];

  const VS = [
    { k: { en: 'Price', fr: 'Prix' }, pub: { en: 'Every second, on screen', fr: 'À chaque seconde, à l’écran' }, priv: { en: 'Estimated, usually each quarter', fr: 'Estimé, en général chaque trimestre' } },
    { k: { en: 'Selling', fr: 'Revente' }, pub: { en: 'In seconds', fr: 'En quelques secondes' }, priv: { en: 'Usually locked for years', fr: 'Généralement bloqué pendant des années' } },
    { k: { en: 'Access', fr: 'Accès' }, pub: { en: 'Anyone with an account', fr: 'Toute personne disposant d’un compte' }, priv: { en: 'Mostly qualified / professional investors, high minimums', fr: 'Surtout investisseurs qualifiés / professionnels, tickets élevés' } },
    { k: { en: 'Information', fr: 'Information' }, pub: { en: 'Public reports, analysts, news', fr: 'Rapports publics, analystes, presse' }, priv: { en: 'Detailed reports, to investors only', fr: 'Rapports détaillés, réservés aux investisseurs' } },
    { k: { en: 'Ownership', fr: 'Actionnariat' }, pub: { en: 'Passive, many small shareholders', fr: 'Passif, nombreux petits actionnaires' }, priv: { en: 'Active: board seats, strategy, often control', fr: 'Actif : sièges au conseil, stratégie, souvent le contrôle' } },
  ];

  PA.chapters.push({
    id: 'founder', icon: '🚀',
    title: { en: 'Founder Mode', fr: 'Mode fondateur' },
    tagline: { en: 'Raise money for {company}, and discover where it really comes from.', fr: 'Levez des fonds pour {company}, et découvrez d’où ils viennent vraiment.' },
    mission: { en: 'Understand what private assets are and how a private fund is organised.', fr: 'Comprendre ce que sont les actifs privés et comment un fonds privé est organisé.' },
    steps: [
      // 1. Pitch doors
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({
              en: '{name}, <b>{company}</b> is taking off! To grow, you need <b>5 million</b>. Knock on doors: who will fund you?',
              fr: '{name}, <b>{company}</b> décolle ! Pour grandir, il vous faut <b>5 millions</b>. Frappez aux portes : qui va vous financer ?',
            }))}
            <div class="doors">${DOORS.map((d) => `
              <button class="door" data-d="${d.id}"><span class="door-ic">${d.icon}</span><span class="door-lbl">${L(d.label)}</span><span class="door-res"></span></button>`).join('')}
            </div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        PA.$$('.door', root).forEach((el) => el.addEventListener('click', () => {
          if (el.classList.contains('open')) return;
          const d = DOORS.find((x) => x.id === el.dataset.d);
          el.classList.add('open', d.ok ? 'win' : 'lose');
          PA.$('.door-res', el).innerHTML = L(d.res);
          if (d.ok) { PA.sfx.coin(); PA.confetti(70); PA.addXP(50, el); PA.ui.enableNext(root); } else { PA.sfx.flip(); PA.addXP(10, el); }
        }));
        PA.ui.bindNext(root);
      },

      // 2. Definition
      PA.step.insight([
        { id: 'pa-def', icon: '🔐', title: { en: 'What are private assets?', fr: 'Que sont les actifs privés ?' },
          body: { en: 'Investments that are <b>not traded on a stock exchange</b>: stakes in private companies (<b>private equity</b>), loans to them (<b>private debt</b>), and real assets such as <b>infrastructure</b> and <b>real estate</b>.', fr: 'Des investissements <b>non cotés en bourse</b> : des participations dans des entreprises privées (<b>private equity</b>), des prêts à ces entreprises (<b>dette privée</b>), et des actifs réels comme les <b>infrastructures</b> et l’<b>immobilier</b>.' } },
        { id: 'pa-analogy', explorer: true, icon: '🍽️', title: { en: 'Think of it like this', fr: 'Pour faire simple' },
          body: { en: 'Buying a listed share is like buying a coffee: instant price, instant deal. A private asset is like buying a stake in a friend’s restaurant: you negotiate, you’re in for years, and its value is an <b>estimate</b> until it is sold.', fr: 'Acheter une action cotée, c’est comme acheter un café : prix immédiat, transaction immédiate. Un actif privé, c’est comme entrer au capital du restaurant d’un ami : on négocie, on s’engage pour des années, et sa valeur reste une <b>estimation</b> jusqu’à la revente.' } },
        { id: 'pa-size', pro: true, icon: '📈', title: { en: 'Market reality', fr: 'La réalité du marché' },
          body: { en: 'Private markets manage <b>well over US$13 trillion</b>. The number of US-listed companies has roughly <b>halved since the late 1990s</b>: companies raise more capital privately and list later, if ever. Much of the value creation now happens before an IPO.', fr: 'Les marchés privés gèrent <b>bien plus de 13 000 milliards de dollars</b>. Le nombre de sociétés cotées aux États-Unis a environ <b>été divisé par deux depuis la fin des années 1990</b> : les entreprises lèvent davantage en privé et entrent en bourse plus tard, voire jamais. Une grande partie de la création de valeur a désormais lieu avant l’IPO.' } },
      ], { say: { en: 'Congratulations, founder. Here’s what just happened behind the scenes.', fr: 'Félicitations, fondateur·rice. Voici ce qui vient de se passer en coulisses.' } }),

      // 3. Flip the table: LP / Fund / GP / Portfolio
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({
              en: '🔄 <b>Plot twist:</b> you’re no longer the founder. You are now the <b>investor</b>. Here’s how your money reaches companies like {company}. <b>Tap each piece.</b>',
              fr: '🔄 <b>Coup de théâtre :</b> vous n’êtes plus le fondateur. Vous êtes désormais l’<b>investisseur</b>. Voici comment votre argent atteint des entreprises comme {company}. <b>Touchez chaque élément.</b>',
            }))}
            <div class="structure">
              ${NODES.map((n, i) => `${i ? '<div class="flow-arrow">➜</div>' : ''}<button class="node" data-n="${n.id}"><span class="n-ic">${n.icon}</span><b>${L(n.name)}</b><small>${L(n.sub)}</small></button>`).join('')}
            </div>
            <div class="panel node-info"><em>${L(PA.S.tapAll)}</em></div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.node', () => PA.ui.enableNext(root));
        PA.$$('.node', root).forEach((el) => el.addEventListener('click', () => {
          const n = NODES.find((x) => x.id === el.dataset.n);
          PA.$$('.node', root).forEach((x) => x.classList.toggle('active', x === el));
          PA.$('.node-info', root).innerHTML = `<h3>${n.icon} ${L(n.name)}</h3><p>${L(n.body)}</p>${PA.isPro() ? `<p class="pro-note">◆ ${L(n.pro)}</p>` : ''}`;
          PA.sfx.flip();
          mark(el);
        }));
        PA.ui.bindNext(root);
      },

      // 4. Public vs private
      () => {
        const root = PA.ui.render(`
          <div class="center-col">
            ${PA.ui.guide(L({ en: 'Listed vs private: same economy, different rules. <b>Tap each row</b> to reveal.', fr: 'Coté ou privé : même économie, règles différentes. <b>Touchez chaque ligne</b> pour révéler.' }))}
            <div class="vs">
              <div class="vs-head"><span></span><span>📈 ${L({ en: 'Listed', fr: 'Coté' })}</span><span>🔐 ${L({ en: 'Private', fr: 'Privé' })}</span></div>
              ${VS.map((r, i) => `<button class="vs-row" data-r="${i}"><span class="vs-k">${L(r.k)}</span><span class="vs-v">${L(r.pub)}</span><span class="vs-v priv">${L(r.priv)}</span></button>`).join('')}
            </div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.vs-row', () => PA.ui.enableNext(root));
        PA.$$('.vs-row', root).forEach((el) => el.addEventListener('click', () => { if (!el.classList.contains('seen')) PA.sfx.flip(); mark(el); }));
        PA.ui.bindNext(root);
      },

      // 5. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'Which of these is a private asset?', fr: 'Lequel de ces placements est un actif privé ?' },
          options: [
            { en: 'A stake in a fund that owns 15 unlisted companies in {sector}', fr: 'Une part d’un fonds qui détient 15 entreprises non cotées dans {sector}' },
            { en: 'A share of a big company bought on the stock exchange', fr: 'Une action d’une grande entreprise achetée en bourse' },
            { en: 'A government bond', fr: 'Une obligation d’État' },
          ],
          answer: 0,
          explain: { en: 'Private assets are not traded on an exchange. You usually access them through a fund run by a manager (the GP).', fr: 'Les actifs privés ne sont pas négociés en bourse. On y accède généralement via un fonds piloté par un gérant (le GP).' },
          hint: { en: 'Look for the one that isn’t bought on a stock exchange.', fr: 'Cherchez celui qui ne s’achète pas en bourse.' },
        },
        pro: {
          q: { en: 'In a private equity fund, who decides on investments and who provides most of the capital?', fr: 'Dans un fonds de private equity, qui décide des investissements et qui apporte l’essentiel du capital ?' },
          options: [
            { en: 'The GP decides; the LPs provide most of the capital with limited liability', fr: 'Le GP décide ; les LP apportent l’essentiel du capital avec une responsabilité limitée' },
            { en: 'The LPs vote on every deal; the GP provides most of the capital', fr: 'Les LP votent chaque opération ; le GP apporte l’essentiel du capital' },
            { en: 'The custodian bank decides; LPs and GP contribute equally', fr: 'La banque dépositaire décide ; LP et GP contribuent à parts égales' },
          ],
          answer: 0,
          explain: { en: 'LPs are passive by design (that’s what protects their limited liability). The GP typically commits 1–3% and runs the portfolio.', fr: 'Les LP sont passifs par construction (c’est ce qui protège leur responsabilité limitée). Le GP engage généralement 1 à 3 % et pilote le portefeuille.' },
        },
      }),
    ],
  });
})();
