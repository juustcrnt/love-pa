/* Finale: The Investment Committee (boss), certificate and the "regulatory question" moment. */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const Q_EXPLORER = [
    { lo: 1, q: { en: 'Which of these is a private asset?', fr: 'Lequel de ces placements est un actif privé ?' }, o: [{ en: 'A stake in a fund owning unlisted companies', fr: 'Une part d’un fonds détenant des entreprises non cotées' }, { en: 'A share bought on the stock exchange', fr: 'Une action achetée en bourse' }, { en: 'A savings account', fr: 'Un compte d’épargne' }], e: { en: 'Private assets are not traded on an exchange.', fr: 'Les actifs privés ne sont pas négociés en bourse.' } },
    { lo: 2, q: { en: 'A fund lends money to companies and earns interest. This is…', fr: 'Un fonds prête de l’argent à des entreprises et perçoit des intérêts. C’est…' }, o: [{ en: 'Private debt', fr: 'De la dette privée' }, { en: 'Venture capital', fr: 'Du capital-risque' }, { en: 'Real estate', fr: 'De l’immobilier' }], e: { en: 'Private debt = lending; income comes mainly from interest.', fr: 'Dette privée = prêter ; le revenu vient surtout des intérêts.' } },
    { lo: 2, q: { en: 'A wind farm selling power under a 20-year contract is typically…', fr: 'Un parc éolien vendant son électricité via un contrat de 20 ans relève généralement…' }, o: [{ en: 'Infrastructure', fr: 'Des infrastructures' }, { en: 'Buyout', fr: 'Du LBO' }, { en: 'Venture capital', fr: 'Du capital-risque' }], e: { en: 'Essential long-life assets with long contracts = infrastructure.', fr: 'Actif essentiel de long terme avec contrats longs = infrastructures.' } },
    { lo: 3, q: { en: 'In a classic private equity fund, how long is your money typically committed?', fr: 'Dans un fonds de private equity classique, combien de temps votre argent est-il généralement engagé ?' }, o: [{ en: 'Around 10 years or more', fr: 'Environ 10 ans ou plus' }, { en: 'About 1 year', fr: 'Environ 1 an' }, { en: 'I can withdraw at any time', fr: 'Je peux retirer à tout moment' }], e: { en: 'Illiquidity is the price of admission.', fr: 'L’illiquidité est le prix d’entrée.' } },
    { lo: 4, q: { en: 'You commit 1 million to a fund. When do you pay it?', fr: 'Vous engagez 1 million dans un fonds. Quand le versez-vous ?' }, o: [{ en: 'Gradually, when the manager sends capital calls over several years', fr: 'Progressivement, lorsque le gérant envoie des appels de fonds sur plusieurs années' }, { en: 'All on day one', fr: 'En totalité le premier jour' }, { en: 'Only at the end of the fund', fr: 'Seulement à la fin du fonds' }], e: { en: 'A commitment is called gradually, so keep liquidity ready.', fr: 'Un engagement est appelé progressivement : gardez des liquidités prêtes.' } },
    { lo: 4, q: { en: 'What does the J-curve show?', fr: 'Que montre la courbe en J ?' }, o: [{ en: 'Negative returns in the early years, then gains as investments mature and are sold', fr: 'Des rendements négatifs les premières années, puis des gains à mesure que les investissements mûrissent et sont vendus' }, { en: 'Fees rising each year', fr: 'Des frais en hausse chaque année' }, { en: 'Guaranteed growth from year 1', fr: 'Une croissance garantie dès l’année 1' }], e: { en: 'Down first, then up: patience is part of the deal.', fr: 'D’abord vers le bas, puis vers le haut : la patience fait partie du contrat.' } },
    { lo: 5, q: { en: 'How is a private fund usually valued?', fr: 'Comment un fonds privé est-il généralement valorisé ?' }, o: [{ en: 'Quarterly, using estimates (NAV) published with a delay', fr: 'Chaque trimestre, par des estimations (VNI) publiées avec retard' }, { en: 'Every second, like a share', fr: 'À chaque seconde, comme une action' }, { en: 'Never, until the end', fr: 'Jamais, jusqu’à la fin' }], e: { en: 'NAV is an estimate: smooth doesn’t mean safe.', fr: 'La VNI est une estimation : lisse ne veut pas dire sans risque.' } },
    { lo: 6, q: { en: 'What is true about risk in private assets?', fr: 'Qu’est-ce qui est vrai concernant le risque des actifs privés ?' }, o: [{ en: 'You can lose part or all of your investment; results vary widely between managers', fr: 'On peut perdre tout ou partie de son investissement ; les résultats varient fortement selon les gérants' }, { en: 'Capital is protected because companies are private', fr: 'Le capital est protégé car les entreprises sont privées' }, { en: 'All managers deliver similar returns', fr: 'Tous les gérants obtiennent des rendements similaires' }], e: { en: 'No capital guarantee, so diversify and select managers carefully.', fr: 'Aucune garantie en capital : diversifiez et choisissez soigneusement les gérants.' } },
    { lo: 7, q: { en: 'How are private equity managers typically paid?', fr: 'Comment les gérants de private equity sont-ils généralement rémunérés ?' }, o: [{ en: 'A management fee (~1.5–2%/yr) + carried interest (~20% of profits above a hurdle)', fr: 'Des frais de gestion (~1,5–2 %/an) + un carried interest (~20 % des profits au-delà d’un hurdle)' }, { en: 'No fees: companies pay them', fr: 'Aucun frais : ce sont les entreprises qui paient' }, { en: 'A single 0.1% fee', fr: 'Un frais unique de 0,1 %' }], e: { en: 'Always judge returns net of fees.', fr: 'Jugez toujours les rendements nets de frais.' } },
    { lo: 8, q: { en: 'What’s true about evergreen (semi-liquid) private funds?', fr: 'Qu’est-ce qui est vrai pour les fonds privés evergreen (semi-liquides) ?' }, o: [{ en: 'Redemptions are possible periodically but can be limited (gated)', fr: 'Les rachats sont possibles périodiquement mais peuvent être limités (gate)' }, { en: 'They are as liquid as a bank account', fr: 'Ils sont aussi liquides qu’un compte bancaire' }, { en: 'They cannot lose value', fr: 'Ils ne peuvent pas perdre de valeur' }], e: { en: 'Semi-liquid ≠ liquid.', fr: 'Semi-liquide ≠ liquide.' } },
  ];

  const Q_PRO = [
    { lo: 1, q: { en: 'In a fund structure, the LP…', fr: 'Dans la structure d’un fonds, le LP…' }, o: [{ en: 'Provides capital with limited liability and no say over individual deals', fr: 'Apporte du capital avec une responsabilité limitée, sans voix sur les opérations' }, { en: 'Selects and executes deals', fr: 'Sélectionne et exécute les opérations' }, { en: 'Guarantees the debt of portfolio companies', fr: 'Garantit la dette des sociétés du portefeuille' }], e: { en: 'Passivity is what protects the LP’s limited liability.', fr: 'C’est la passivité qui protège la responsabilité limitée du LP.' } },
    { lo: 2, q: { en: 'Which strategy typically offers floating-rate, senior-secured income?', fr: 'Quelle stratégie offre généralement un revenu à taux variable, senior et sécurisé ?' }, o: [{ en: 'Direct lending (private debt)', fr: 'Le prêt direct (dette privée)' }, { en: 'Growth equity', fr: 'Le capital-croissance' }, { en: 'Value-add real estate', fr: 'L’immobilier value-add' }], e: { en: 'Direct lending dominates private debt.', fr: 'Le prêt direct domine la dette privée.' } },
    { lo: 3, q: { en: 'You need liquidity from a 4-year-old buyout fund. Most realistic route?', fr: 'Vous avez besoin de liquidité sur un fonds LBO de 4 ans. Voie la plus réaliste ?' }, o: [{ en: 'Sell the stake on the secondary market, likely at a discount, with GP consent', fr: 'Céder la part sur le marché secondaire, probablement avec décote, avec l’accord du GP' }, { en: 'Redeem at NAV next quarter', fr: 'Racheter à la VNI au prochain trimestre' }, { en: 'Ask the GP to accelerate all exits', fr: 'Demander au GP d’accélérer toutes les sorties' }], e: { en: 'LP-led secondaries are the main exit valve.', fr: 'Le secondaire LP-led est la principale soupape de sortie.' } },
    { lo: 4, q: { en: 'A fund has called 60% of your commitment. The remaining 40% is…', fr: 'Un fonds a appelé 60 % de votre engagement. Les 40 % restants sont…' }, o: [{ en: 'An unfunded commitment you must keep liquidity for', fr: 'Un engagement non appelé pour lequel vous devez garder de la liquidité' }, { en: 'Carried interest', fr: 'Du carried interest' }, { en: 'Already distributed capital', fr: 'Du capital déjà distribué' }], e: { en: 'Unfunded commitments are a real liability to plan for.', fr: 'Les engagements non appelés sont un vrai passif à planifier.' } },
    { lo: 4, q: { en: 'A fund reports DPI 0.6x and RVPI 1.0x. Its TVPI is…', fr: 'Un fonds affiche DPI 0,6x et RVPI 1,0x. Son TVPI est…' }, o: [{ en: '1.6x', fr: '1,6x' }, { en: '0.4x', fr: '0,4x' }, { en: '0.6x', fr: '0,6x' }], e: { en: 'TVPI = DPI + RVPI.', fr: 'TVPI = DPI + RVPI.' } },
    { lo: 5, q: { en: 'Smoothed, lagged NAVs mainly cause…', fr: 'Des VNI lissées et décalées entraînent principalement…' }, o: [{ en: 'Understated volatility and correlation with public markets', fr: 'Une sous-estimation de la volatilité et de la corrélation avec les marchés cotés' }, { en: 'Overstated fees', fr: 'Une surestimation des frais' }, { en: 'Higher liquidity', fr: 'Une liquidité accrue' }], e: { en: 'Hence the denominator effect in sell-offs.', fr: 'D’où l’effet dénominateur lors des baisses.' } },
    { lo: 6, q: { en: 'Why diversify across vintage years?', fr: 'Pourquoi diversifier entre millésimes ?' }, o: [{ en: 'Entry valuations and exit conditions vary by year; it reduces timing risk', fr: 'Les valorisations d’entrée et conditions de sortie varient selon les années ; cela réduit le risque de calendrier' }, { en: 'To lower management fees', fr: 'Pour réduire les frais de gestion' }, { en: 'Because regulators require it', fr: 'Parce que les régulateurs l’exigent' }], e: { en: 'Commitment pacing smooths the cycle.', fr: 'Un rythme d’engagement régulier lisse le cycle.' } },
    { lo: 7, q: { en: 'In a European (whole-fund) waterfall, carry is paid…', fr: 'Dans une cascade européenne (fonds entier), le carried interest est versé…' }, o: [{ en: 'Only after LPs receive all contributed capital plus the preferred return', fr: 'Seulement après que les LP ont reçu tout le capital versé plus le rendement préférentiel' }, { en: 'Deal by deal, as each exit happens', fr: 'Opération par opération, à chaque sortie' }, { en: 'Upfront at the first close', fr: 'D’avance, au premier closing' }], e: { en: 'Deal-by-deal is the American model, protected by clawback.', fr: 'L’opération par opération est le modèle américain, protégé par le clawback.' } },
    { lo: 8, q: { en: 'A semi-liquid fund hits its 5% quarterly redemption limit. What happens?', fr: 'Un fonds semi-liquide atteint sa limite de rachat de 5 % par trimestre. Que se passe-t-il ?' }, o: [{ en: 'Requests are pro-rated; the rest is queued or resubmitted', fr: 'Les demandes sont servies au prorata ; le reste est mis en attente ou resoumis' }, { en: 'The bank pays the difference', fr: 'La banque paie la différence' }, { en: 'The fund must sell assets at any price', fr: 'Le fonds doit vendre des actifs à n’importe quel prix' }], e: { en: 'Gates prevent fire sales.', fr: 'Les gates évitent les ventes forcées.' } },
  ];

  const LO_STATEMENTS = [
    { en: 'What private assets are, and how a fund (LP / GP) works', fr: 'Ce que sont les actifs privés et comment fonctionne un fonds (LP / GP)' },
    { en: 'The main families: private equity, private debt, infrastructure, real estate', fr: 'Les grandes familles : private equity, dette privée, infrastructures, immobilier' },
    { en: 'Illiquidity: a 10+ year horizon and costly early exits', fr: 'L’illiquidité : un horizon de 10 ans et plus, des sorties anticipées coûteuses' },
    { en: 'How a vintage fund works: commitment, capital calls, distributions, J-curve', fr: 'Le fonctionnement d’un fonds millésimé : engagement, appels de fonds, distributions, courbe en J' },
    { en: 'Valuation: estimated, quarterly, delayed NAVs', fr: 'La valorisation : des VNI estimées, trimestrielles et publiées avec retard' },
    { en: 'Risks: possible loss of capital, manager dispersion, the need to diversify', fr: 'Les risques : perte en capital possible, dispersion des gérants, nécessité de diversifier' },
    { en: 'Fees: management fee, hurdle, carried interest, gross vs net', fr: 'Les frais : frais de gestion, hurdle, carried interest, brut vs net' },
    { en: 'Access, evergreen funds & gates, and the place in a portfolio', fr: 'L’accès, les fonds evergreen & gates, et la place dans un portefeuille' },
  ];

  // Boss battle
  PA.finale.push(() => {
    const qs = PA.isPro() ? Q_PRO : Q_EXPLORER;
    let i = 0;
    let first = 0;
    const intro = () => {
      const root = PA.ui.render(`
        <div class="chapter-intro boss-intro">
          <div class="ch-num">${L(PA.S.boss)}</div>
          <div class="ch-icon">👑</div>
          <h1 class="ch-title">${L({ en: 'The Investment Committee', fr: 'Le Comité d’investissement' })}</h1>
          <p class="ch-sub">${L({ en: 'Three seasoned partners. {n} questions. Convince them that you understand private assets.', fr: 'Trois associés chevronnés. {n} questions. Convainquez-les que vous comprenez les actifs privés.' }, { n: qs.length })}</p>
          <div class="judges"><span>🧔</span><span>👩‍💼</span><span>👨‍🦳</span></div>
          ${PA.ui.cont(L({ en: 'Face the Committee', fr: 'Affronter le Comité' }))}
        </div>`, 'intro-screen');
      PA.sfx.level();
      PA.ui.bindNext(root, ask);
    };
    const ask = () => {
      const q = qs[i];
      const order = PA.shuffle(q.o.map((_, k) => k));
      const conv = Math.round((i / qs.length) * 100);
      const root = PA.ui.render(`
        <div class="center-col boss">
          <div class="boss-top">
            <div class="judges small"><span>🧔</span><span>👩‍💼</span><span>👨‍🦳</span></div>
            <div class="conv"><small>${L({ en: 'Committee conviction', fr: 'Conviction du Comité' })}</small><div class="conv-bar"><span style="width:${conv}%"></span></div><b>${conv}%</b></div>
          </div>
          <div class="challenge">
            <div class="ch-tag">⚖️ ${L({ en: 'Question', fr: 'Question' })} ${i + 1}/${qs.length}</div>
            <h2>${L(q.q)}</h2>
            <div class="options">${order.map((k, n) => `<button class="opt" data-k="${k}"><span class="key">${'ABC'[n]}</span><span>${L(q.o[k])}</span></button>`).join('')}</div>
            <div class="feedback" hidden></div>
          </div>
        </div>`);
      let tries = 0;
      let solved = false;
      const fb = PA.$('.feedback', root);
      PA.$$('.opt', root).forEach((b) => b.addEventListener('click', () => {
        if (solved || b.disabled) return;
        tries++;
        fb.hidden = false;
        if (+b.dataset.k === 0) {
          solved = true;
          if (tries === 1) first++;
          b.classList.add('correct');
          PA.sfx.good();
          PA.addXP(tries === 1 ? 120 : 40, b);
          PA.state.results.push({ chapter: 'boss', first: tries === 1 });
          const nc = Math.round(((i + 1) / qs.length) * 100);
          PA.$('.conv-bar span', root).style.width = nc + '%';
          PA.$('.conv b', root).textContent = nc + '%';
          fb.className = 'feedback ok';
          fb.innerHTML = `<b>✓ ${L(tries === 1 ? PA.S.perfect : PA.S.gotIt)}</b> ${L(q.e)}` + PA.ui.cont();
          PA.ui.bindNext(fb, () => { i++; if (i < qs.length) ask(); else { PA.state.bossScore = { first, total: qs.length }; PA.next(); } });
        } else {
          b.classList.add('wrong', 'shake');
          b.disabled = true;
          PA.sfx.bad();
          fb.className = 'feedback bad';
          fb.innerHTML = `<b>✗ ${L(PA.S.notQuite)}</b> ${L({ en: 'The Committee raises an eyebrow… try again.', fr: 'Le Comité hausse un sourcil… réessayez.' })}`;
        }
      }));
    };
    intro();
  });

  // Certificate + regulatory question
  PA.finale.push(() => {
    const sc = PA.state.bossScore || { first: 0, total: 9 };
    const ratio = sc.first / sc.total;
    const rank = ratio >= 0.85
      ? { en: 'Private Markets Strategist', fr: 'Stratège des marchés privés' }
      : ratio >= 0.6 ? { en: 'Private Markets Investor', fr: 'Investisseur des marchés privés' } : { en: 'Private Markets Explorer', fr: 'Explorateur des marchés privés' };
    const date = new Date().toLocaleDateString(PA.locale(), { day: 'numeric', month: 'long', year: 'numeric' });
    const s = PA.sector();
    const root = PA.ui.render(`
      <div class="wide-col">
        <div class="certificate" id="cert">
          <div class="cert-badge">🦄</div>
          <div class="cert-k">${L({ en: 'Certificate of completion', fr: 'Certificat de réussite' })}</div>
          <div class="cert-name">${PA.esc(PA.playerName())}</div>
          <div class="cert-rank">${L(rank)}</div>
          <div class="cert-meta">${s.icon} {company} · ${PA.isPro() ? '◆ Pro' : '✦ ' + L(PA.S.explorer)} · ${PA.state.xp} XP · ${L({ en: 'Committee', fr: 'Comité' })} ${sc.first}/${sc.total} · ${date}</div>
          <div class="cert-list">
            <div class="cert-sub">${L({ en: 'I can explain:', fr: 'Je sais expliquer :' })}</div>
            ${LO_STATEMENTS.map((x) => `<div class="cert-item">✓ ${L(x)}</div>`).join('')}
          </div>
        </div>
        <div class="regq panel">
          <div class="regq-k">📝 ${L({ en: 'The question you will see on your investor profile', fr: 'La question que vous verrez sur votre profil investisseur' })}</div>
          <div class="regq-q">${L({ en: '“Do you have knowledge of, and understand the features and risks of, private-market investments (private equity, private debt, infrastructure)?”', fr: '« Avez-vous des connaissances sur les investissements dans les marchés privés (private equity, dette privée, infrastructures) et en comprenez-vous les caractéristiques et les risques ? »' })}</div>
          <div class="actions"><button class="btn gold yes" id="yes">${L({ en: 'YES', fr: 'OUI' })}</button><button class="btn ghost" id="notyet">${L({ en: 'Not yet, show me again', fr: 'Pas encore, je veux revoir' })}</button></div>
          <div class="regq-out"></div>
        </div>
        <div class="actions">
          <button class="btn ghost" id="codex">📚 ${L(PA.S.codex)} (${PA.state.codex.length})</button>
          <button class="btn ghost" id="print">🖨️ ${L({ en: 'Print certificate', fr: 'Imprimer le certificat' })}</button>
          <button class="btn ghost" id="again">↺ ${L({ en: 'Play again', fr: 'Rejouer' })}</button>
        </div>
      </div>`.replace('{company}', s.company));
    PA.confetti(160);
    PA.sfx.level();
    PA.$('#yes', root).addEventListener('click', () => {
      PA.confetti(200);
      PA.sfx.level();
      PA.$('.regq-out', root).innerHTML = PA.ui.guide(L({
        en: '🎉 And now you can say it with confidence. You’ve experienced a fund’s whole life, from capital calls to the J-curve, seen the risks and fees, and convinced the Committee. Answer honestly, and your banker is right here to go deeper on any point.',
        fr: '🎉 Et désormais vous pouvez le dire en toute confiance. Vous avez vécu toute la vie d’un fonds, des appels de fonds à la courbe en J, vu les risques et les frais, et convaincu le Comité. Répondez en toute sincérité : votre banquier est là pour approfondir chaque point.',
      }));
    });
    PA.$('#notyet', root).addEventListener('click', () => {
      PA.$('.regq-out', root).innerHTML = PA.ui.guide(L({
        en: 'That’s a perfectly good answer, and an honest one. Open the menu (☰) to replay any chapter, or browse your Codex, and ask your banker about anything that’s unclear.',
        fr: 'C’est une très bonne réponse, et une réponse honnête. Ouvrez le menu (☰) pour rejouer un chapitre, ou parcourez votre Codex, et posez à votre banquier toutes vos questions.',
      }));
    });
    PA.$('#codex', root).addEventListener('click', () => PA.overlay.codex());
    PA.$('#print', root).addEventListener('click', () => window.print());
    PA.$('#again', root).addEventListener('click', () => { PA.resetState(); PA.go(0); });
  });
})();
