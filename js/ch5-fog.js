/* Chapter 5: The Fog (LO5, valuation: NAV, quarterly, lagged, smoothed). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const QD = 63; // trading days per quarter
  const LISTED = [100, 106, 84, 90, 99];
  const NAV = [100, 104, 97, 93, 96];
  const LAG = 28; // reports published ~a month+ after quarter end
  const XMAX = 4 * QD + LAG + 4;

  const listedPath = (() => {
    const rnd = PA.rng(7);
    const pts = [];
    for (let q = 0; q < 4; q++) {
      const a = LISTED[q], b = LISTED[q + 1];
      let w = 0;
      const walk = [0];
      for (let i = 1; i <= QD; i++) { w += (rnd() - 0.5) * 2.2; walk.push(w); }
      for (let i = q === 0 ? 0 : 1; i <= QD; i++) {
        const bridge = walk[i] - (i / QD) * walk[QD];
        pts.push(a + ((b - a) * i) / QD + bridge);
      }
    }
    return pts; // 4*QD+1 points
  })();

  const W = 640, H = 280, x0 = 40, x1 = 624, yT = 16, yB = 250, vmin = 76, vmax = 114;
  const X = (d) => x0 + ((x1 - x0) * d) / XMAX;
  const Y = (v) => yT + ((vmax - v) / (vmax - vmin)) * (yB - yT);

  const draw = (svg, day) => {
    const n = Math.min(listedPath.length, Math.floor(day) + 1);
    let d = '';
    for (let i = 0; i < n; i++) d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(listedPath[i]).toFixed(1);
    // NAV step line: value known only after each report date
    let nav = `M${X(0)} ${Y(NAV[0])}`;
    let dots = '';
    let lastV = NAV[0];
    for (let q = 1; q <= 4; q++) {
      const rd = q * QD + LAG;
      if (day >= rd) {
        nav += ` L${X(rd)} ${Y(lastV)} L${X(rd)} ${Y(NAV[q])}`;
        lastV = NAV[q];
        dots += `<circle cx="${X(rd)}" cy="${Y(NAV[q])}" r="6" class="nav-dot"/><text x="${X(rd) + 10}" y="${Y(NAV[q]) - 10}" class="nav-lbl">${PA.L({ en: 'Q', fr: 'T' })}${q}</text>`;
      }
    }
    nav += ` L${X(Math.min(day, XMAX))} ${Y(lastV)}`;
    const qlines = [1, 2, 3, 4].map((q) => `<line x1="${X(q * QD)}" x2="${X(q * QD)}" y1="${yT}" y2="${yB}" class="qline"/><text x="${X(q * QD) - 4}" y="${yT + 10}" class="axis" text-anchor="end">${PA.L({ en: 'End Q', fr: 'Fin T' })}${q}</text>`).join('');
    svg.innerHTML = `${qlines}
      <line x1="${x0}" x2="${x1}" y1="${Y(100)}" y2="${Y(100)}" class="grid"/>
      <text x="${x0 - 6}" y="${Y(100) + 4}" class="axis" text-anchor="end">100</text>
      <path d="${d}" class="listed-line"/>
      <path d="${nav}" class="nav-line"/>${dots}`;
  };

  PA.chapters.push({
    id: 'fog', icon: '🌫️',
    title: { en: 'Into the Fog', fr: 'Dans le brouillard' },
    tagline: { en: 'No screen, no ticker. So what is your investment worth?', fr: 'Pas d’écran, pas de cotation. Alors, combien vaut votre investissement ?' },
    mission: { en: 'Understand how private assets are valued (NAV): estimated, quarterly, delayed and smoothed.', fr: 'Comprendre comment les actifs privés sont valorisés (VNI) : estimés, trimestriels, publiés avec retard et lissés.' },
    steps: [
      // 1. Animated race: listed vs private
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            <div class="fog-say">${PA.ui.guide(L({
              en: 'Two investments, one year. 🔵 A <b>listed</b> {sector} company, priced every second. 🟡 Your <b>private fund</b>, valued by the manager only <b>once a quarter</b>, published weeks later. Press play.',
              fr: 'Deux investissements, une année. 🔵 Une entreprise <b>cotée</b> dans {sector}, valorisée à chaque seconde. 🟡 Votre <b>fonds privé</b>, valorisé par le gérant <b>une fois par trimestre</b> et publié des semaines plus tard. Lancez la lecture.',
            }))}</div>
            <div class="panel chart-panel fog-panel">
              <svg viewBox="0 0 ${W} ${H}" class="fogchart"></svg>
              <div class="fog-cloud"></div>
              <div class="legend"><span class="lg listed"></span>${L({ en: 'Listed share (daily)', fr: 'Action cotée (quotidien)' })}<span class="lg nav"></span>${L({ en: 'Private fund NAV (reported)', fr: 'VNI du fonds privé (publiée)' })}</div>
            </div>
            <div class="fog-q"></div>
            <div class="actions"><button class="btn primary" id="play">▶ ${L({ en: 'Play', fr: 'Lecture' })}</button></div>
          </div>`);
        const svg = PA.$('.fogchart', root);
        draw(svg, 0);
        const stopAt = 2 * QD + LAG + 2;
        const playBtn = PA.$('#play', root);
        playBtn.addEventListener('click', () => {
          playBtn.disabled = true;
          PA.sfx.click();
          PA.anim(4200, (p) => draw(svg, p * stopAt), () => ask());
        });
        const ask = () => {
          const q = PA.$('.fog-q', root);
          const opts = [
            { t: { en: 'About −20%, like the market', fr: 'Environ −20 %, comme le marché' }, ok: false },
            { t: { en: 'About −7%', fr: 'Environ −7 %' }, ok: true },
            { t: { en: 'Up about +3%', fr: 'En hausse d’environ +3 %' }, ok: false },
          ];
          q.innerHTML = `<div class="challenge mini">
            <h3>${L({ en: '📉 In Q2 the listed market crashed about 20%. What did your fund’s Q2 report show?', fr: '📉 Au T2, le marché coté a chuté d’environ 20 %. Qu’a montré le rapport T2 de votre fonds ?' })}</h3>
            <div class="options row">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span>${L(o.t)}</span></button>`).join('')}</div></div>`;
          PA.sfx.flip();
          PA.$$('.opt', q).forEach((b) => b.addEventListener('click', () => {
            const o = opts[+b.dataset.i];
            PA.$$('.opt', q).forEach((x) => { x.disabled = true; if (opts[+x.dataset.i].ok) x.classList.add('correct'); });
            if (o.ok) { PA.sfx.good(); PA.addXP(50, b); } else { b.classList.add('wrong'); PA.sfx.bad(); }
            q.insertAdjacentHTML('beforeend', `<div class="feedback ${o.ok ? 'ok' : 'bad'}">${L({
              en: 'The reported NAV fell only <b>~7%</b>, and it arrived <b>weeks after</b> the crash. Watch what happens next…',
              fr: 'La VNI publiée n’a baissé que d’<b>environ 7 %</b>, et elle est arrivée <b>des semaines après</b> le krach. Regardez la suite…',
            })}</div>`);
            PA.later(() => PA.anim(2600, (p) => draw(svg, stopAt + p * (XMAX - stopAt)), () => end()), 1400);
          }));
        };
        const end = () => {
          PA.$('.fog-say', root).innerHTML = PA.ui.guide(L({
            en: 'See it? In Q3 the listed share was already <b>recovering</b>, while your fund was still <b>marking down</b>. The real value didn’t escape the crash. It just showed up <b>slowly and smoothly</b>. Private values are <b>estimates</b>, not prices.',
            fr: 'Vous voyez ? Au T3, l’action cotée <b>remontait déjà</b>, tandis que votre fonds <b>dépréciait encore</b>. La valeur réelle n’a pas échappé au krach. Elle est simplement apparue <b>lentement et de façon lissée</b>. Les valeurs privées sont des <b>estimations</b>, pas des prix.',
          }));
          PA.$('.fog-cloud', root).classList.add('lift');
          const a = PA.$('.actions', root);
          a.innerHTML = PA.ui.btn(L(PA.S.continue) + ' <span class="arr">▸</span>', 'data-next');
          PA.ui.bindNext(root);
        };
      },

      // 2. How is a private company valued?
      () => {
        const methods = [
          { icon: '🔍', t: { en: 'Comparables', fr: 'Comparables' }, b: { en: 'What are similar listed companies or recent deals worth? Apply the same <b>multiple</b> (e.g. × profits).', fr: 'Combien valent des sociétés cotées ou des transactions similaires ? On applique le même <b>multiple</b> (ex. × bénéfices).' } },
          { icon: '🔮', t: { en: 'Discounted cash flows', fr: 'Flux actualisés (DCF)' }, b: { en: 'Forecast the company’s future cash and discount it to today. Sensitive to assumptions.', fr: 'Prévoir le cash futur de l’entreprise et le ramener à aujourd’hui. Sensible aux hypothèses.' } },
          { icon: '🤝', t: { en: 'Recent transaction', fr: 'Transaction récente' }, b: { en: 'The price paid in the last funding round or a recent offer for the company.', fr: 'Le prix payé lors du dernier tour de table ou d’une offre récente sur l’entreprise.' } },
        ];
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'So who decides what {company} is worth? The manager does, every quarter, using recognised methods, checked by auditors once a year. <b>Flip the three cards.</b>', fr: 'Alors qui décide de la valeur de {company} ? Le gérant, chaque trimestre, avec des méthodes reconnues, vérifiées par les auditeurs une fois par an. <b>Retournez les trois cartes.</b>' }))}
            <div class="flip-row">${methods.map((m, i) => `<button class="flip" data-i="${i}"><div class="flip-in"><div class="flip-front"><span>${m.icon}</span><b>${L(m.t)}</b><small>${L({ en: 'tap to flip', fr: 'touchez pour retourner' })}</small></div><div class="flip-back"><b>${m.icon} ${L(m.t)}</b><p>${L(m.b)}</p></div></div></button>`).join('')}</div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.flip', () => PA.ui.enableNext(root));
        PA.$$('.flip', root).forEach((el) => el.addEventListener('click', () => { if (!el.classList.contains('seen')) PA.sfx.flip(); el.classList.add('flipped'); mark(el); }));
        PA.ui.bindNext(root);
      },

      // 3. Insights
      PA.step.insight([
        { id: 'val-nav', icon: '🧾', title: { en: 'NAV = Net Asset Value', fr: 'VNI = Valeur nette d’inventaire' }, body: { en: 'Your statement shows a <b>NAV</b>: the manager’s estimate of what the remaining companies are worth. Usually <b>quarterly</b>, published <b>1–4 months later</b>.', fr: 'Votre relevé indique une <b>VNI</b> (NAV) : l’estimation par le gérant de la valeur des entreprises restantes. En général <b>trimestrielle</b>, publiée <b>1 à 4 mois plus tard</b>.' } },
        { id: 'val-smooth', icon: '🌫️', title: { en: 'Smooth ≠ safe', fr: 'Lisse ≠ sans risque' }, body: { en: 'Private values look calmer than the stock market because they are estimated less often. The <b>real</b> risk is still there; you just see it later.', fr: 'Les valeurs privées semblent plus calmes que la bourse parce qu’elles sont estimées moins souvent. Le risque <b>réel</b> est toujours là ; on le voit simplement plus tard.' } },
        { id: 'val-real', explorer: true, icon: '🏠', title: { en: 'Like valuing a house', fr: 'Comme estimer une maison' }, body: { en: 'You know roughly what your house is worth from similar sales nearby, but you only know the <b>real</b> price on the day you sell.', fr: 'Vous savez à peu près ce que vaut votre maison grâce aux ventes voisines, mais vous ne connaissez le <b>vrai</b> prix que le jour de la vente.' } },
        { id: 'val-ipev', pro: true, icon: '📐', title: { en: 'Fair value & its side effects', fr: 'Juste valeur & effets secondaires' }, body: { en: 'NAVs follow fair-value standards (IFRS 13 / ASC 820, IPEV guidelines) and are audited annually. Smoothing understates true <b>volatility and correlation</b> with equities (“volatility laundering”), and when listed markets fall, private allocations can jump above target: the <b>denominator effect</b>, which can pause new commitments.', fr: 'Les VNI suivent les normes de juste valeur (IFRS 13 / ASC 820, lignes directrices IPEV) et sont auditées chaque année. Le lissage sous-estime la vraie <b>volatilité et la corrélation</b> avec les actions (« volatility laundering »). Quand la bourse chute, la poche privée peut dépasser sa cible : c’est l’<b>effet dénominateur</b>, qui peut freiner de nouveaux engagements.' } },
      ]),

      // 4. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'Why does a private fund’s value look smoother than the stock market?', fr: 'Pourquoi la valeur d’un fonds privé paraît-elle plus lisse que la bourse ?' },
          options: [
            { en: 'Its value is an estimate, updated quarterly with a delay, so ups and downs show up gradually', fr: 'Sa valeur est une estimation, mise à jour chaque trimestre avec retard, donc les hausses et baisses apparaissent progressivement' },
            { en: 'Because private companies can never lose value', fr: 'Parce que les entreprises privées ne peuvent jamais perdre de valeur' },
            { en: 'Because the fund is guaranteed by the bank', fr: 'Parce que le fonds est garanti par la banque' },
          ],
          answer: 0,
          explain: { en: 'Smooth reporting doesn’t mean lower risk. Real values can fall, and you only see it later.', fr: 'Un reporting lisse ne signifie pas un risque plus faible. Les valeurs réelles peuvent baisser ; on le voit simplement plus tard.' },
          hint: { en: 'Think about the yellow staircase in the chart.', fr: 'Repensez à l’escalier jaune du graphique.' },
        },
        pro: {
          q: { en: 'Listed equities fall 25%; your PE NAVs barely move, so private assets now exceed their target weight. This is called…', fr: 'Les actions cotées chutent de 25 % ; vos VNI de PE bougent à peine, la poche privée dépasse donc sa cible. On appelle cela…' },
          options: [{ en: 'The denominator effect', fr: 'L’effet dénominateur' }, { en: 'The J-curve', fr: 'La courbe en J' }, { en: 'The catch-up', fr: 'Le rattrapage (catch-up)' }],
          answer: 0,
          explain: { en: 'The total portfolio (the denominator) shrinks while lagged private NAVs don’t, mechanically raising the private weight. That can constrain new commitments or force secondary sales.', fr: 'Le portefeuille total (le dénominateur) baisse alors que les VNI privées décalées non, ce qui augmente mécaniquement le poids du privé. Cela peut limiter de nouveaux engagements ou pousser à des ventes secondaires.' },
        },
      }),
    ],
  });
})();
