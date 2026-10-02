/* Chapter 8: The Exit (LO8, exits, closed-end vs evergreen/semi-liquid, access & suitability, portfolio fit). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const ROUTES = [
    { id: 'ipo', icon: '🔔', t: { en: 'IPO: list on the stock exchange', fr: 'IPO : introduction en bourse' }, r: { en: '{company} lists. The fund sells its shares gradually after a lock-up period. Great visibility, but it depends on market mood.', fr: '{company} entre en bourse. Le fonds cède ses actions progressivement après une période de blocage. Belle visibilité, mais dépendante de l’humeur des marchés.' } },
    { id: 'trade', icon: '🤝', t: { en: 'Trade sale to {exitBuyer}', fr: 'Cession à {exitBuyer}' }, r: { en: 'A strategic buyer pays a premium for synergies. Fast, clean, 100% cash: the most common exit.', fr: 'Un acquéreur stratégique paie une prime pour les synergies. Rapide, net, 100 % cash : la sortie la plus fréquente.' } },
    { id: 'sbo', icon: '🔄', t: { en: 'Sale to another private equity fund', fr: 'Cession à un autre fonds de private equity' }, r: { en: 'A “secondary buyout”: a bigger fund takes {company} to its next stage. Common in buyout.', fr: 'Un « LBO secondaire » : un fonds plus grand emmène {company} à l’étape suivante. Fréquent en LBO.' } },
  ];

  const CHECKS = [
    { en: 'I can lock this money away for <b>10+ years</b>', fr: 'Je peux immobiliser cet argent <b>10 ans ou plus</b>' },
    { en: 'I keep enough cash for <b>capital calls</b> and life’s surprises', fr: 'Je garde assez de liquidités pour les <b>appels de fonds</b> et les imprévus' },
    { en: 'I can absorb a <b>loss</b> on part, or all, of this investment', fr: 'Je peux supporter une <b>perte</b> sur une partie, voire la totalité, de cet investissement' },
    { en: 'I understand the <b>fees</b> and judge funds on a <b>net</b> basis', fr: 'Je comprends les <b>frais</b> et je juge les fonds en <b>net</b>' },
    { en: 'It is <b>one part</b> of a diversified portfolio, not all of it', fr: 'C’est <b>une partie</b> d’un portefeuille diversifié, pas sa totalité' },
  ];

  PA.chapters.push({
    id: 'exit', icon: '🏁',
    title: { en: 'The Grand Exit', fr: 'La grande sortie' },
    tagline: { en: 'Cash out, choose your vehicle, and find the right place in your portfolio.', fr: 'Encaisser, choisir son véhicule, et trouver la bonne place dans son portefeuille.' },
    mission: { en: 'Know how investments exit, how evergreen funds differ, who can invest, and how private assets fit in a portfolio.', fr: 'Savoir comment se font les sorties, en quoi diffèrent les fonds evergreen, qui peut investir et comment les actifs privés s’intègrent dans un portefeuille.' },
    steps: [
      // 1. Exit route for {company}
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'Seven years later, <b>{company}</b> is a leader in {sector}. The fund that backed you wants to <b>exit</b>. You’re on the board: choose the route.', fr: 'Sept ans plus tard, <b>{company}</b> est un leader dans {sector}. Le fonds qui vous a soutenu veut <b>sortir</b>. Vous siégez au conseil : choisissez la voie.' }))}
            <div class="doors">${ROUTES.map((r) => `<button class="door" data-r="${r.id}"><span class="door-ic">${r.icon}</span><span class="door-lbl">${L(r.t)}</span><span class="door-res"></span></button>`).join('')}</div>
            <div class="exit-res"></div>
          </div>`);
        let done = false;
        PA.$$('.door', root).forEach((el) => el.addEventListener('click', () => {
          if (done) return;
          done = true;
          const r = ROUTES.find((x) => x.id === el.dataset.r);
          el.classList.add('open', 'win');
          PA.$$('.door', root).forEach((x) => { if (x !== el) x.classList.add('dim'); });
          PA.$('.door-res', el).innerHTML = L(r.r);
          PA.sfx.level();
          PA.confetti(140);
          PA.addXP(30, el);
          PA.$('.exit-res', root).innerHTML = `<div class="exit-banner">💰 ${L({ en: 'EXIT AT 4.0x!', fr: 'SORTIE À 4,0x !' })}</div>`
            + PA.ui.guide(L({ en: 'The fund turns its 5 million into 20 million. That cash flows back to the LPs as a <b>distribution</b>. This is the moment the J-curve was waiting for.', fr: 'Le fonds transforme ses 5 millions en 20 millions. Ce cash revient aux LP sous forme de <b>distribution</b>. C’est le moment qu’attendait la courbe en J.' }))
            + PA.ui.cont();
          PA.ui.bindNext(root);
        }));
      },

      // 2. Closed-end vs evergreen + redemption day
      () => {
        const ask = PA.money(200000);
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'Not every private fund is a 10-year locked box. Meet the two main vehicles.', fr: 'Tous les fonds privés ne sont pas des coffres bloqués 10 ans. Voici les deux grands véhicules.' }))}
            <div class="compare">
              <div class="cmp-card">
                <h3>📦 ${L({ en: 'Closed-end fund', fr: 'Fonds fermé' })}</h3>
                <ul>
                  <li>${L({ en: 'Commitment + capital calls', fr: 'Engagement + appels de fonds' })}</li>
                  <li>${L({ en: 'Fixed life: ~10–12 years', fr: 'Durée fixe : ~10 à 12 ans' })}</li>
                  <li>${L({ en: 'No redemptions; cash back as assets are sold', fr: 'Pas de rachats ; cash rendu au fil des cessions' })}</li>
                  <li>${L({ en: 'J-curve, single vintage', fr: 'Courbe en J, un seul millésime' })}</li>
                </ul>
              </div>
              <div class="cmp-card ever">
                <h3>♾️ ${L({ en: 'Evergreen / semi-liquid fund', fr: 'Fonds evergreen / semi-liquide' })}</h3>
                <ul>
                  <li>${L({ en: 'Invested from day one, no capital calls', fr: 'Investi dès le premier jour, pas d’appels de fonds' })}</li>
                  <li>${L({ en: 'No end date; many vintages inside', fr: 'Pas de date de fin ; de nombreux millésimes à l’intérieur' })}</li>
                  <li>${L({ en: 'Periodic subscriptions & redemptions (monthly/quarterly)', fr: 'Souscriptions & rachats périodiques (mensuels/trimestriels)' })}</li>
                  <li>⚠️ ${L({ en: 'Redemptions can be <b>limited (“gated”)</b>', fr: 'Les rachats peuvent être <b>limités (« gates »)</b>' })}</li>
                </ul>
              </div>
            </div>
            <div class="panel redemption">
              <h3>📆 ${L({ en: 'Redemption day: stress test', fr: 'Jour de rachat : test de résistance' })}</h3>
              <p>${L({ en: 'Markets are nervous. Many investors in your evergreen fund ask to withdraw <b>15%</b> of the fund this quarter, but the rules allow at most <b>5% of NAV</b> per quarter.', fr: 'Les marchés sont nerveux. De nombreux investisseurs de votre fonds evergreen demandent à retirer <b>15 %</b> du fonds ce trimestre, mais le règlement autorise au maximum <b>5 % de la VNI</b> par trimestre.' })}</p>
              <div class="actions"><button class="btn primary" id="redeem">🏧 ${L({ en: 'Request to redeem {a}', fr: 'Demander le rachat de {a}' }, { a: ask })}</button></div>
              <div class="redeem-out"></div>
            </div>
            <div class="slot-next"></div>
          </div>`);
        PA.$('#redeem', root).addEventListener('click', (e) => {
          e.target.disabled = true;
          PA.sfx.click();
          const out = PA.$('.redeem-out', root);
          out.innerHTML = `<div class="gate-anim"><div class="gate-fill"></div></div>`;
          PA.later(() => {
            PA.sfx.bad();
            out.innerHTML = `<div class="gate-res">
              <div class="gr"><span>${L({ en: 'Requested', fr: 'Demandé' })}</span><b>${ask}</b></div>
              <div class="gr ok"><span>${L({ en: 'Paid this quarter', fr: 'Versé ce trimestre' })}</span><b>${PA.money(200000 / 3)}</b></div>
              <div class="gr wait"><span>${L({ en: 'Queued for next quarter(s)', fr: 'En file d’attente' })}</span><b>${PA.money((200000 * 2) / 3)}</b></div>
            </div>${PA.ui.guide(L({ en: '🚧 <b>The gate is down.</b> Requests are cut <b>pro rata</b>: you get about one third now. Semi-liquid means <b>partly</b> liquid, and the gate protects remaining investors from fire sales.', fr: '🚧 <b>La gate est activée.</b> Les demandes sont servies <b>au prorata</b> : vous recevez environ un tiers maintenant. Semi-liquide signifie <b>partiellement</b> liquide, et la gate protège les investisseurs restants des ventes forcées.' }))}`;
            PA.addXP(30);
            PA.$('.slot-next', root).innerHTML = PA.ui.cont();
            PA.ui.bindNext(root);
          }, 1300);
        });
      },

      // 3. Who can invest + allocation & checklist
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'Last stop: <b>where do private assets fit in your wealth?</b> Move the slider, then tick every item on the investor checklist.', fr: 'Dernière étape : <b>quelle place pour les actifs privés dans votre patrimoine ?</b> Déplacez le curseur, puis cochez chaque point de la check-list de l’investisseur.' }))}
            <div class="fit-grid">
              <div class="panel">
                <h3>🥧 ${L({ en: 'Share of total wealth in private assets', fr: 'Part du patrimoine total en actifs privés' })}</h3>
                <div class="pie-wrap"><div class="pie" id="pie"></div><div class="pie-v" id="piev">10%</div></div>
                <input type="range" id="alloc" min="0" max="60" step="5" value="10">
                <div class="alloc-msg" id="allocmsg"></div>
              </div>
              <div class="panel">
                <h3>✅ ${L({ en: 'Investor checklist', fr: 'Check-list de l’investisseur' })}</h3>
                <div class="checks">${CHECKS.map((c, i) => `<button class="check" data-i="${i}"><span class="box-c"></span><span>${L(c)}</span></button>`).join('')}</div>
              </div>
            </div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const msg = (v) => {
          if (v === 0) return { en: 'No private assets: full liquidity, but no access to this part of the economy and its potential premium.', fr: 'Aucun actif privé : liquidité totale, mais aucun accès à cette part de l’économie ni à sa prime potentielle.' };
          if (v <= 20) return { en: 'A range many long-term investors consider <b>when liquidity needs are covered</b>.', fr: 'Une fourchette envisagée par de nombreux investisseurs de long terme <b>lorsque leurs besoins de liquidité sont couverts</b>.' };
          if (v <= 35) return { en: 'A meaningful allocation: requires solid liquidity planning, a long horizon and a real <b>capacity to absorb losses</b>.', fr: 'Une allocation significative : elle exige une planification solide de la liquidité, un horizon long et une réelle <b>capacité à supporter des pertes</b>.' };
          return { en: '⚠️ Very high. Could you still meet capital calls and your life plans if <b>no distributions came for years</b>?', fr: '⚠️ Très élevé. Pourriez-vous honorer les appels de fonds et vos projets de vie si <b>aucune distribution n’arrivait pendant des années</b> ?' };
        };
        const upd = () => {
          const v = +PA.$('#alloc', root).value;
          PA.$('#pie', root).style.setProperty('--p', v);
          PA.$('#piev', root).textContent = v + (PA.state.lang === 'fr' ? ' %' : '%');
          PA.$('#allocmsg', root).innerHTML = L(msg(v)) + `<small>${L({ en: 'Illustrative only. The right level depends on your situation, and your banker will assess what is suitable for you.', fr: 'À titre purement illustratif. Le bon niveau dépend de votre situation ; votre banquier évaluera ce qui vous convient.' })}</small>`;
          PA.$('#pie', root).classList.toggle('hot', v > 35);
        };
        PA.$('#alloc', root).addEventListener('input', () => { upd(); PA.sfx.click(); });
        upd();
        const mark = PA.ui.trackAll(root, '.check', () => { PA.addXP(40); PA.sfx.level(); PA.ui.enableNext(root); });
        PA.$$('.check', root).forEach((el) => el.addEventListener('click', () => { if (!el.classList.contains('seen')) PA.sfx.good(); mark(el); }));
        PA.ui.bindNext(root);
      },

      // 4. Insights
      PA.step.insight([
        { id: 'fit-exit', icon: '🏁', title: { en: 'Exits drive your returns', fr: 'Les sorties font votre rendement' }, body: { en: 'Trade sale, IPO or sale to another fund: the exit turns paper value (NAV) into real cash for you. Exit windows depend on markets.', fr: 'Cession industrielle, IPO ou vente à un autre fonds : la sortie transforme la valeur papier (VNI) en cash réel. Les fenêtres de sortie dépendent des marchés.' } },
        { id: 'fit-ever', icon: '♾️', title: { en: 'Semi-liquid ≠ liquid', fr: 'Semi-liquide ≠ liquide' }, body: { en: 'Evergreen funds offer easier access and periodic liquidity, but redemptions can be <b>limited or suspended</b> when many investors want out at the same time.', fr: 'Les fonds evergreen offrent un accès simplifié et une liquidité périodique, mais les rachats peuvent être <b>limités ou suspendus</b> quand de nombreux investisseurs veulent sortir en même temps.' } },
        { id: 'fit-access', icon: '🎟️', title: { en: 'Who can invest?', fr: 'Qui peut investir ?' }, body: { en: 'Because they are complex and illiquid, many private-asset funds are reserved for <b>qualified or professional investors</b>, with high minimums. Your bank must check that the product is <b>appropriate and suitable</b> for you: your knowledge, experience, objectives and capacity for loss. That’s why you are asked about it.', fr: 'Parce qu’ils sont complexes et illiquides, de nombreux fonds d’actifs privés sont réservés aux <b>investisseurs qualifiés ou professionnels</b>, avec des montants minimums élevés. Votre banque doit vérifier que le produit est <b>approprié et adéquat</b> pour vous : connaissances, expérience, objectifs et capacité à supporter des pertes. C’est pourquoi on vous pose la question.' } },
        { id: 'fit-reg', pro: true, icon: '⚖️', title: { en: 'Regulatory landscape', fr: 'Cadre réglementaire' }, body: { en: '🇨🇭 FinSA/CISA: many funds are open only to qualified investors (e.g. clients with a discretionary or advisory mandate, or high-net-worth individuals opting out: ≥ CHF 2m in financial assets, or ≥ CHF 500k plus relevant knowledge); the <b>L-QIF</b> is unsupervised by FINMA and reserved for them. 🇪🇺 MiFID II appropriateness/suitability; <b>ELTIF 2.0</b> opened private assets more widely to retail investors with safeguards. 🇬🇧 <b>LTAF</b>. Semi-liquid structures typically hold a 10–20% liquidity sleeve and may use credit lines, which creates cash drag and fee layers to assess.', fr: '🇨🇭 LSFin/LPCC : de nombreux fonds sont réservés aux investisseurs qualifiés (ex. clients sous mandat de gestion ou de conseil, ou particuliers fortunés ayant opté pour ce statut : ≥ 2 MCHF d’actifs financiers, ou ≥ 500 kCHF avec des connaissances suffisantes) ; le <b>L-QIF</b>, non soumis à la surveillance de la FINMA, leur est réservé. 🇪🇺 Caractère approprié/adéquation MiFID II ; l’<b>ELTIF 2.0</b> a élargi l’accès des particuliers aux actifs privés, avec garde-fous. 🇬🇧 <b>LTAF</b>. Les structures semi-liquides détiennent souvent une poche de liquidité de 10–20 % et peuvent recourir à des lignes de crédit : coût de portage et couches de frais à évaluer.' } },
      ]),

      // 5. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'What is true about an evergreen (semi-liquid) private fund?', fr: 'Qu’est-ce qui est vrai pour un fonds privé evergreen (semi-liquide) ?' },
          options: [
            { en: 'I can request redemptions periodically, but the fund can limit (gate) them', fr: 'Je peux demander des rachats périodiquement, mais le fonds peut les limiter (gate)' },
            { en: 'It is as liquid as a bank account', fr: 'Il est aussi liquide qu’un compte bancaire' },
            { en: 'It cannot lose value because it is evergreen', fr: 'Il ne peut pas perdre de valeur car il est evergreen' },
          ],
          answer: 0,
          explain: { en: 'Liquidity is offered, not guaranteed. Under stress, gates protect remaining investors.', fr: 'La liquidité est proposée, pas garantie. En période de tension, les gates protègent les investisseurs restants.' },
          hint: { en: 'Remember Redemption Day.', fr: 'Souvenez-vous du jour de rachat.' },
        },
        pro: {
          q: { en: 'A semi-liquid fund hits its 5% quarterly redemption limit. What typically happens?', fr: 'Un fonds semi-liquide atteint sa limite de rachat de 5 % par trimestre. Que se passe-t-il généralement ?' },
          options: [
            { en: 'Requests are pro-rated; the rest is queued or must be resubmitted next window', fr: 'Les demandes sont servies au prorata ; le reste est mis en attente ou doit être resoumis à la prochaine fenêtre' },
            { en: 'The distributing bank pays the difference from its own balance sheet', fr: 'La banque distributrice paie la différence sur son propre bilan' },
            { en: 'The fund must sell assets immediately at any price', fr: 'Le fonds doit vendre immédiatement des actifs à n’importe quel prix' },
          ],
          answer: 0,
          explain: { en: 'Gates exist precisely to avoid fire sales of illiquid assets. Check the fund’s liquidity terms (frequency, notice, gate, lock-up, early-redemption fees).', fr: 'Les gates existent justement pour éviter les ventes forcées d’actifs illiquides. Vérifiez les conditions de liquidité (fréquence, préavis, gate, période de blocage, frais de sortie anticipée).' },
        },
      }),
    ],
  });
})();
