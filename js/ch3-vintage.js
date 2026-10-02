/* Chapter 3: Vintage (LO4, how a PE fund works over time: commitment, capital calls, distributions, J-curve). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  // Cash-flow profile in % of commitment, years 1..12 (illustrative but typical of a buyout fund).
  const CALLS = [25, 25, 20, 15, 5, 0, 0, 0, 0, 0, 0, 0];
  const DISTS = [0, 0, 0, 5, 15, 25, 35, 30, 25, 15, 7, 3];
  const TVPI = [0.88, 0.92, 1.0, 1.1, 1.25, 1.4, 1.55, 1.65, 1.72, 1.76, 1.78, 160 / 90];
  const YEARS = 12;

  const series = () => {
    const out = [];
    let paid = 0;
    let dist = 0;
    for (let t = 0; t < YEARS; t++) {
      paid += CALLS[t];
      dist += DISTS[t];
      const nav = t === YEARS - 1 ? 0 : Math.max(0, TVPI[t] * paid - dist);
      out.push({ call: CALLS[t], dist: DISTS[t], paid, cumDist: dist, nav, net: dist - paid });
    }
    return out;
  };

  const EVENTS = [
    { en: '📩 <b>Capital call #1 (25%)</b>: the fund buys a stake in <b>{p0}</b>. Part of the money also pays fees and deal costs, so your stake is worth a bit <b>less</b> than you paid. Hello, J-curve!', fr: '📩 <b>Appel de fonds n°1 (25 %)</b> : le fonds investit dans <b>{p0}</b>. Une partie de l’argent paie aussi les frais et coûts de transaction, donc votre part vaut un peu <b>moins</b> que ce que vous avez versé. Bonjour la courbe en J !' },
    null, // year 2 is interactive (capital call notice)
    { en: '📩 <b>Call #3 (20%)</b>: <b>{p2}</b> and <b>{p3}</b> join the portfolio. The GP is busy improving {p0}: new CEO, new markets.', fr: '📩 <b>Appel n°3 (20 %)</b> : <b>{p2}</b> et <b>{p3}</b> rejoignent le portefeuille. Le GP travaille sur {p0} : nouveau CEO, nouveaux marchés.' },
    { en: '📩 Call #4 (15%) and… 💰 <b>first exit!</b> <b>{p1}</b> is sold to {exitBuyer}. Your <b>first distribution</b> arrives (5%).', fr: '📩 Appel n°4 (15 %) et… 💰 <b>première sortie !</b> <b>{p1}</b> est cédée à {exitBuyer}. Votre <b>première distribution</b> arrive (5 %).' },
    { en: '🔚 <b>Investment period over</b>: no new companies, only follow-ons (last call, 5%). The harvest begins: 15% distributed.', fr: '🔚 <b>Fin de la période d’investissement</b> : plus de nouvelles entreprises, seulement des réinvestissements (dernier appel, 5 %). La récolte commence : 15 % distribués.' },
    { en: '🔔 <b>{p2}</b> lists on the stock exchange (IPO). 25% comes back to you.', fr: '🔔 <b>{p2}</b> entre en bourse (IPO). 25 % vous reviennent.' },
    { en: '🚀 Peak harvest: <b>{p3}</b> is sold to another private equity fund. 35% distributed.', fr: '🚀 Pic de récolte : <b>{p3}</b> est cédée à un autre fonds de private equity. 35 % distribués.' },
    { en: '🎉 <b>Break-even!</b> You have now received <b>more cash than you paid in</b>. Everything from here is profit.', fr: '🎉 <b>Point mort atteint !</b> Vous avez désormais reçu <b>plus de cash que vous n’en avez versé</b>. Tout le reste est du gain.' },
    { en: '💥 <b>{p4}</b> is written off: not every company works out. The others keep the fund on track. 25% distributed.', fr: '💥 <b>{p4}</b> est passée en perte : toutes les entreprises ne réussissent pas. Les autres maintiennent le cap. 25 % distribués.' },
    { en: '⏳ Year 10: the fund’s official term ends, and the GP uses a <b>1-year extension</b> to sell the last companies at a good price.', fr: '⏳ Année 10 : le terme officiel du fonds arrive, et le GP utilise une <b>prolongation d’un an</b> pour vendre les dernières entreprises dans de bonnes conditions.' },
    { en: '🧹 Final exits. 7% distributed.', fr: '🧹 Dernières cessions. 7 % distribués.' },
    { en: '🏁 <b>Fund liquidated.</b> Game over for this vintage. Time to look at your result.', fr: '🏁 <b>Fonds liquidé.</b> Fin de partie pour ce millésime. Place au bilan.' },
  ];

  const PHASES = [
    { id: 'raise', icon: '🤝', yrs: { en: 'Year 0', fr: 'Année 0' }, name: { en: 'Fundraising', fr: 'Levée de fonds' }, txt: { en: 'The GP gathers <b>commitments</b> from investors (first close, final close). The vintage year is set.', fr: 'Le GP recueille les <b>engagements</b> des investisseurs (premier closing, closing final). Le millésime est fixé.' }, w: 2.2 },
    { id: 'invest', icon: '🛒', yrs: { en: 'Years 1–5', fr: 'Années 1 à 5' }, name: { en: 'Investment period', fr: 'Période d’investissement' }, txt: { en: 'The GP finds and buys companies, <b>calling your capital</b> deal by deal.', fr: 'Le GP trouve et achète des entreprises en <b>appelant votre capital</b> au fil des opérations.' }, w: 4 },
    { id: 'grow', icon: '🛠️', yrs: { en: 'Years 3–8', fr: 'Années 3 à 8' }, name: { en: 'Value creation', fr: 'Création de valeur' }, txt: { en: 'The GP improves companies: growth, efficiency, acquisitions, better management.', fr: 'Le GP améliore les entreprises : croissance, efficacité, acquisitions, meilleur management.' }, w: 4 },
    { id: 'harvest', icon: '🌾', yrs: { en: 'Years 5–10', fr: 'Années 5 à 10' }, name: { en: 'Harvest', fr: 'Récolte' }, txt: { en: 'Companies are sold or listed, and the cash is <b>distributed</b> back to you.', fr: 'Les entreprises sont cédées ou introduites en bourse, et le cash vous est <b>distribué</b>.' }, w: 4 },
    { id: 'ext', icon: '⏳', yrs: { en: '+1–2 years', fr: '+1 à 2 ans' }, name: { en: 'Extensions', fr: 'Prolongations' }, txt: { en: 'If needed, the fund life is extended to sell the last assets without a fire sale.', fr: 'Si nécessaire, la durée du fonds est prolongée pour vendre les derniers actifs sans brader.' }, w: 2.4 },
  ];

  /* SVG J-curve chart */
  const chart = (data, upto, pro) => {
    const W = 640, H = 300, x0 = 46, x1 = 624, yTop = 18, yBot = 270;
    const vmin = -100, vmax = 80;
    const X = (t) => x0 + ((x1 - x0) * t) / YEARS;
    const Y = (v) => yTop + ((vmax - v) / (vmax - vmin)) * (yBot - yTop);
    const grid = [-100, -50, 0, 50].map((v) => `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" class="${v === 0 ? 'zero' : 'grid'}"/><text x="${x0 - 8}" y="${Y(v) + 4}" class="axis" text-anchor="end">${v > 0 ? '+' : ''}${v}%</text>`).join('');
    const xl = Array.from({ length: YEARS + 1 }, (_, t) => (t % 2 === 0 ? `<text x="${X(t)}" y="${H - 8}" class="axis" text-anchor="middle">${PA.L({ en: 'Y', fr: 'A' })}${t}</text>` : '')).join('');
    let bars = '';
    let pts = [[X(0), Y(0)]];
    let navPts = [[X(0), Y(0)]];
    for (let t = 1; t <= upto; t++) {
      const d = data[t - 1];
      const cx = X(t);
      if (d.call) bars += `<rect x="${cx - 9}" y="${Y(0)}" width="8" height="${Y(-d.call) - Y(0)}" class="bar-call"/>`;
      if (d.dist) bars += `<rect x="${cx + 1}" y="${Y(d.dist)}" width="8" height="${Y(0) - Y(d.dist)}" class="bar-dist"/>`;
      pts.push([cx, Y(d.net)]);
      navPts.push([cx, Y(d.net + d.nav)]);
    }
    const path = (p) => p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
    const area = pts.length > 1 ? `<path d="${path(pts)} L ${pts[pts.length - 1][0]} ${Y(0)} Z" class="j-area"/>` : '';
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" class="jchart" role="img" aria-label="J-curve">
      <defs><linearGradient id="jg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f5c86b" stop-opacity=".35"/><stop offset="1" stop-color="#ff5d6c" stop-opacity=".25"/></linearGradient></defs>
      ${grid}${xl}${bars}${area}
      ${pro && navPts.length > 1 ? `<path d="${path(navPts)}" class="tv-line"/>` : ''}
      ${pts.length > 1 ? `<path d="${path(pts)}" class="j-line"/>` : ''}
      <circle cx="${last[0]}" cy="${last[1]}" r="6" class="j-dot"/>
    </svg>`;
  };

  PA.chapters.push({
    id: 'vintage', icon: '🍷',
    title: { en: 'Vintage {year}', fr: 'Millésime {year}' },
    tagline: { en: 'Launch a private equity fund and live its whole life, year by year.', fr: 'Lancez un fonds de private equity et vivez toute sa vie, année après année.' },
    mission: { en: 'Understand how a vintage fund works: commitment, capital calls, distributions and the J-curve.', fr: 'Comprendre le fonctionnement d’un fonds millésimé : engagement, appels de fonds, distributions et courbe en J.' },
    steps: [
      // 1. Commitment choice
      () => {
        const amounts = [250000, 500000, 1000000];
        const root = PA.ui.render(`
          <div class="center-col">
            ${PA.ui.guide(L({
              en: 'Like a great wine, every private equity fund has a <b>vintage</b>: the year it starts investing. Horizon Partners is launching <b>Fund I, vintage {year}</b>, investing in companies like {company}. How much do you <b>commit</b>?',
              fr: 'Comme un grand vin, chaque fonds de private equity a un <b>millésime</b> : l’année où il commence à investir. Horizon Partners lance le <b>Fonds I, millésime {year}</b>, qui investit dans des entreprises comme {company}. Combien <b>engagez-vous</b> ?',
            }))}
            <div class="commit-row">${amounts.map((a) => `<button class="commit-btn" data-a="${a}"><span>🪙</span>${PA.money(a)}</button>`).join('')}</div>
            <div class="feedback ok" hidden></div>
          </div>`);
        PA.$$('.commit-btn', root).forEach((b) => b.addEventListener('click', () => {
          PA.state.commitment = +b.dataset.a;
          PA.$$('.commit-btn', root).forEach((x) => x.classList.toggle('on', x === b));
          PA.sfx.coin();
          const fb = PA.$('.feedback', root);
          fb.hidden = false;
          fb.innerHTML = L({
            en: '✍️ Signed! Surprise: <b>you don’t transfer {commit} today</b>. You’ve made a <b>commitment</b>, a promise to pay when the manager asks. Those requests are called <b>capital calls</b>.',
            fr: '✍️ Signé ! Surprise : <b>vous ne virez pas {commit} aujourd’hui</b>. Vous avez pris un <b>engagement</b>, une promesse de payer quand le gérant le demandera. Ces demandes s’appellent des <b>appels de fonds</b> (capital calls).',
          }) + PA.ui.cont();
          PA.ui.bindNext(fb);
        }));
      },

      // 2. Lifecycle timeline
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'A fund lives in five phases. <b>Tap each phase</b> of the timeline.', fr: 'Un fonds vit en cinq phases. <b>Touchez chaque phase</b> de la frise.' }))}
            <div class="timeline">${PHASES.map((p) => `<button class="phase ph-${p.id}" style="flex:${p.w}" data-p="${p.id}"><span>${p.icon}</span><b>${L(p.name)}</b><small>${L(p.yrs)}</small></button>`).join('')}</div>
            <div class="panel phase-info"><em>${L(PA.S.tapAll)}</em></div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.phase', () => PA.ui.enableNext(root));
        PA.$$('.phase', root).forEach((el) => el.addEventListener('click', () => {
          const p = PHASES.find((x) => x.id === el.dataset.p);
          PA.$$('.phase', root).forEach((x) => x.classList.toggle('active', x === el));
          PA.$('.phase-info', root).innerHTML = `<h3>${p.icon} ${L(p.name)} <small>${L(p.yrs)}</small></h3><p>${L(p.txt)}</p>`;
          PA.sfx.flip();
          mark(el);
        }));
        PA.ui.bindNext(root);
      },

      // 3. The simulator
      () => {
        const C = PA.state.commitment;
        const data = series();
        const pro = PA.isPro();
        let t = 0;
        let waitingCall = false;
        const root = PA.ui.render(`
          <div class="wide-col sim">
            <div class="sim-event">${PA.ui.guide(L({
              en: 'Your fund is live. Press <b>Next year</b> and watch your cash flows. The gold line is your <b>cumulative net cash</b>: what you’ve received minus what you’ve paid.',
              fr: 'Votre fonds est lancé. Appuyez sur <b>Année suivante</b> et observez vos flux. La ligne dorée représente votre <b>cash net cumulé</b> : ce que vous avez reçu moins ce que vous avez versé.',
            }))}</div>
            <div class="sim-grid">
              <div class="panel chart-panel">
                <div class="chart-box"></div>
                <div class="legend"><span class="lg call"></span>${L({ en: 'Capital calls', fr: 'Appels de fonds' })}<span class="lg dist"></span>${L({ en: 'Distributions', fr: 'Distributions' })}<span class="lg j"></span>${L({ en: 'Net cash (J-curve)', fr: 'Cash net (courbe en J)' })}${pro ? `<span class="lg tv"></span>${L({ en: 'Net cash + NAV', fr: 'Cash net + VNI' })}` : ''}</div>
              </div>
              <div class="panel stats-panel"></div>
            </div>
            <div class="actions"><button class="btn primary" id="yr">${L({ en: 'Next year', fr: 'Année suivante' })} <span class="arr">▸</span></button></div>
          </div>`);
        const stats = () => {
          const d = t ? data[t - 1] : { paid: 0, cumDist: 0, nav: 0, net: 0 };
          const m = (p) => PA.money((p / 100) * C);
          const cfs = [0].concat(data.slice(0, t).map((x) => ((x.dist - x.call) / 100) * C));
          if (t) cfs[t] += (d.nav / 100) * C;
          const irr = t >= 2 ? PA.irr(cfs) : null;
          const dpi = d.paid ? d.cumDist / d.paid : 0;
          const rvpi = d.paid ? d.nav / d.paid : 0;
          let html = `
            <div class="yr-badge">${L({ en: 'Year', fr: 'Année' })} <b>${t}</b><small>${PA.CONFIG.startYear + t}</small></div>
            <div class="stat"><span>${L({ en: 'Committed', fr: 'Engagé' })}</span><b>${PA.money(C)}</b></div>
            <div class="stat"><span>${L({ en: 'Paid in (called)', fr: 'Versé (appelé)' })}</span><b class="neg">${m(d.paid)}</b></div>
            <div class="stat"><span>${L({ en: 'Still to be called', fr: 'Reste à appeler' })}</span><b>${m(90 - d.paid)}</b></div>
            <div class="stat"><span>${L({ en: 'Distributed to you', fr: 'Distribué' })}</span><b class="pos">${m(d.cumDist)}</b></div>
            <div class="stat"><span>${L({ en: 'Value of remaining stake (NAV)', fr: 'Valeur de la part restante (VNI)' })}</span><b>${m(d.nav)}</b></div>
            <div class="stat big"><span>${L({ en: 'Net cash position', fr: 'Position de cash nette' })}</span><b class="${d.net >= 0 ? 'pos' : 'neg'}">${d.net > 0 ? '+' : ''}${m(d.net)}</b></div>`;
          if (pro) {
            html += `<div class="metrics">
              <div><small>DPI</small><b>${PA.mult(dpi)}</b></div>
              <div><small>RVPI</small><b>${PA.mult(rvpi)}</b></div>
              <div><small>TVPI</small><b>${PA.mult(dpi + rvpi)}</b></div>
              <div><small>${L({ en: 'IRR', fr: 'TRI' })}</small><b>${irr == null ? '–' : PA.pct(irr, 1)}</b></div>
            </div>`;
          }
          PA.$('.stats-panel', root).innerHTML = html;
          PA.$('.chart-box', root).innerHTML = chart(data, t, pro);
        };
        const say = (html) => { PA.$('.sim-event', root).innerHTML = PA.ui.guide(html); };
        const btn = PA.$('#yr', root);
        const finish = () => {
          const totalIn = 0.9 * C;
          const totalOut = 1.6 * C;
          const cfs = [0].concat(data.map((x) => ((x.dist - x.call) / 100) * C));
          const irr = PA.irr(cfs);
          say(L({
            en: `🏁 <b>Final score:</b> you paid in <b>${PA.money(totalIn)}</b> (90% of your commitment was ever called) and received <b>${PA.money(totalOut)}</b>, a multiple of <b>${PA.mult(totalOut / totalIn)}</b>${pro ? ` and an IRR of about <b>${PA.pct(irr, 1)}</b>` : ''}. See the shape? Down first, then up: <b>the J-curve</b>. And notice: your money came back <b>in pieces</b>, from year 4 to year 12.`,
            fr: `🏁 <b>Score final :</b> vous avez versé <b>${PA.money(totalIn)}</b> (seuls 90 % de votre engagement ont été appelés) et reçu <b>${PA.money(totalOut)}</b>, soit un multiple de <b>${PA.mult(totalOut / totalIn)}</b>${pro ? ` et un TRI d’environ <b>${PA.pct(irr, 1)}</b>` : ''}. Vous voyez la forme ? D’abord vers le bas, puis vers le haut : <b>la courbe en J</b>. Et remarquez : votre argent est revenu <b>par morceaux</b>, de l’année 4 à l’année 12.`,
          }));
          PA.confetti(100);
          PA.sfx.level();
          btn.outerHTML = PA.ui.btn(L(PA.S.continue) + ' <span class="arr">▸</span>', 'data-next');
          PA.ui.bindNext(root);
        };
        const advance = () => {
          t++;
          stats();
          const d = data[t - 1];
          if (d.dist) PA.sfx.coin(); else PA.sfx.click();
          say(L(EVENTS[t - 1]));
          if (t >= YEARS) finish();
        };
        btn.addEventListener('click', () => {
          if (waitingCall) return;
          if (t === 1) {
            // Year 2: interactive capital call notice
            waitingCall = true;
            t++;
            const amt = PA.money(0.25 * C);
            PA.$('.sim-event', root).innerHTML = `<div class="notice">
              <div class="notice-head">📩 ${L({ en: 'CAPITAL CALL NOTICE', fr: 'AVIS D’APPEL DE FONDS' })} · Horizon Partners Fund I</div>
              <p>${L({ en: 'Dear investor, please transfer <b>{amt}</b> (25% of your commitment) within <b>10 business days</b> to finance our investment in <b>{p1}</b>.', fr: 'Cher investisseur, merci de virer <b>{amt}</b> (25 % de votre engagement) sous <b>10 jours ouvrables</b> pour financer notre investissement dans <b>{p1}</b>.' }, { amt })}</p>
              <div class="actions"><button class="btn primary" data-pay>✅ ${L({ en: 'Pay', fr: 'Payer' })}</button><button class="btn ghost" data-ignore>🙈 ${L({ en: 'Ignore it', fr: 'L’ignorer' })}</button></div>
            </div>`;
            btn.disabled = true;
            const paid = (good) => {
              waitingCall = false;
              btn.disabled = false;
              stats();
              PA.sfx.click();
              say(L(good
                ? { en: '✅ Paid on time. That’s the golden rule: <b>keep enough liquidity to meet capital calls</b>, often for 3–5 years after you commit.', fr: '✅ Payé à temps. C’est la règle d’or : <b>garder assez de liquidités pour honorer les appels de fonds</b>, souvent pendant 3 à 5 ans après l’engagement.' }
                : { en: '✅ Paid, phew. Remember: <b>keep enough liquidity to meet capital calls</b>, often for 3–5 years after you commit.', fr: '✅ Payé, ouf. À retenir : <b>garder assez de liquidités pour honorer les appels de fonds</b>, souvent pendant 3 à 5 ans après l’engagement.' }));
            };
            PA.$('[data-pay]', root).addEventListener('click', () => { PA.addXP(30); PA.sfx.good(); paid(true); });
            PA.$('[data-ignore]', root).addEventListener('click', () => {
              PA.sfx.boom();
              PA.$('.sim-event', root).innerHTML = `<div class="notice danger">
                <div class="notice-head">⚠️ ${L({ en: 'DEFAULT', fr: 'DÉFAUT' })}</div>
                <p>${L({ en: 'Missing a capital call is serious. Under the fund rules you can be charged penalty interest, <b>lose part or all of your stake</b>, or be forced to sell it cheaply. A commitment is a <b>legal obligation</b>, not an option.', fr: 'Ne pas honorer un appel de fonds est grave. Selon les règles du fonds, vous pouvez payer des intérêts de pénalité, <b>perdre tout ou partie de votre participation</b>, ou être forcé de la céder à bas prix. Un engagement est une <b>obligation juridique</b>, pas une option.' })}</p>
                <div class="actions"><button class="btn primary" data-pay2>💸 ${L({ en: 'Pay now', fr: 'Payer maintenant' })}</button></div></div>`;
              PA.$('[data-pay2]', root).addEventListener('click', () => paid(false));
            });
            return;
          }
          advance();
        });
        stats();
      },

      // 4. Insights
      PA.step.insight([
        { id: 'vin-commit', icon: '✍️', title: { en: 'Commitment & capital calls', fr: 'Engagement & appels de fonds' }, body: { en: 'You promise an amount; the manager <b>calls it gradually</b> over ~3–5 years as it finds deals. Often not 100% is ever called. Keep cash ready.', fr: 'Vous promettez un montant ; le gérant l’<b>appelle progressivement</b> sur environ 3 à 5 ans, au fil des opérations. Souvent, 100 % ne sont jamais appelés. Gardez des liquidités disponibles.' } },
        { id: 'vin-dist', icon: '💰', title: { en: 'Distributions', fr: 'Distributions' }, body: { en: 'When companies are sold, cash comes back <b>in several pieces</b>, mostly between years 4 and 12. You don’t choose the timing; the manager does.', fr: 'Quand les entreprises sont vendues, le cash revient <b>en plusieurs fois</b>, surtout entre les années 4 et 12. Vous ne choisissez pas le calendrier : c’est le gérant.' } },
        { id: 'vin-j', icon: '📉📈', title: { en: 'The J-curve', fr: 'La courbe en J' }, body: { en: 'Early years look negative: you pay in, fees are charged, and investments haven’t grown yet. Gains come later, as companies are improved and sold. <b>Patience is part of the deal.</b>', fr: 'Les premières années paraissent négatives : vous versez, les frais s’appliquent, et les investissements n’ont pas encore pris de valeur. Les gains arrivent plus tard, avec l’amélioration et la vente des entreprises. <b>La patience fait partie du contrat.</b>' } },
        { id: 'vin-vintage', icon: '🍷', title: { en: 'Why “vintage” matters', fr: 'Pourquoi le millésime compte' }, body: { en: 'Each vintage buys in a different market (cheap or expensive) and sells in another. Comparing funds only makes sense <b>within the same vintage</b>.', fr: 'Chaque millésime achète dans un marché différent (bon marché ou cher) et vend dans un autre. Comparer des fonds n’a de sens qu’<b>au sein d’un même millésime</b>.' } },
        { id: 'vin-metrics', pro: true, icon: '🧮', title: { en: 'DPI, RVPI, TVPI, IRR', fr: 'DPI, RVPI, TVPI, TRI' }, body: { en: '<b>DPI</b> = cash returned ÷ paid-in (the “real money”). <b>RVPI</b> = NAV ÷ paid-in (still on paper). <b>TVPI</b> = DPI + RVPI. <b>IRR</b> is time-sensitive: 2.0x in 4 years ≈ 19% IRR; 2.0x in 10 years ≈ 7%. Early distributions or subscription lines can flatter IRR, so always read IRR together with multiples, and against a <b>PME</b> (public market equivalent).', fr: '<b>DPI</b> = cash rendu ÷ capital versé (l’« argent réel »). <b>RVPI</b> = VNI ÷ capital versé (encore sur le papier). <b>TVPI</b> = DPI + RVPI. Le <b>TRI</b> dépend du temps : 2,0x en 4 ans ≈ 19 % ; 2,0x en 10 ans ≈ 7 %. Des distributions précoces ou des lignes de crédit de souscription peuvent embellir le TRI : lisez-le toujours avec les multiples, et face à un <b>PME</b> (équivalent marché public).' } },
        { id: 'vin-pacing', pro: true, icon: '🗓️', title: { en: 'Commitment pacing', fr: 'Rythme d’engagement' }, body: { en: 'Because only part of a commitment is invested at any time, building a stable allocation means committing <b>every year across vintages</b>, sometimes over-committing, while planning liquidity for unfunded commitments.', fr: 'Comme seule une partie de l’engagement est investie à un instant donné, construire une allocation stable implique d’<b>engager chaque année, sur plusieurs millésimes</b>, parfois en sur-engageant, tout en planifiant la liquidité des engagements non appelés.' } },
      ]),

      // 5. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'Why are returns usually negative in the first years of a private equity fund?', fr: 'Pourquoi les rendements sont-ils généralement négatifs les premières années d’un fonds de private equity ?' },
          options: [
            { en: 'Capital is called and fees are paid before investments have had time to grow and be sold', fr: 'Le capital est appelé et les frais payés avant que les investissements aient eu le temps de croître et d’être vendus' },
            { en: 'Because the manager is doing a bad job', fr: 'Parce que le gérant travaille mal' },
            { en: 'Because the stock market always falls at first', fr: 'Parce que la bourse baisse toujours au début' },
          ],
          answer: 0,
          explain: { en: 'That’s the J-curve: a normal phase of every fund, not a sign of failure.', fr: 'C’est la courbe en J : une phase normale de tout fonds, pas un signe d’échec.' },
          hint: { en: 'Think about what happens in years 1–3 of your simulation.', fr: 'Repensez aux années 1 à 3 de votre simulation.' },
        },
        pro: {
          q: { en: 'Fund A returns 2.0x in 4 years. Fund B returns 2.0x in 10 years. What is true?', fr: 'Le fonds A rend 2,0x en 4 ans. Le fonds B rend 2,0x en 10 ans. Qu’est-ce qui est vrai ?' },
          options: [
            { en: 'Same TVPI, but Fund A has a much higher IRR', fr: 'Même TVPI, mais le fonds A a un TRI bien plus élevé' },
            { en: 'Same IRR, because the multiple is identical', fr: 'Même TRI, puisque le multiple est identique' },
            { en: 'Fund B has the higher IRR because it compounded longer', fr: 'Le fonds B a le TRI le plus élevé car il a composé plus longtemps' },
          ],
          answer: 0,
          explain: { en: 'Multiples ignore time; IRR rewards speed (~19% vs ~7%). Use both, plus DPI, to judge a fund.', fr: 'Les multiples ignorent le temps ; le TRI récompense la vitesse (~19 % contre ~7 %). Utilisez les deux, avec le DPI, pour juger un fonds.' },
        },
      }),
    ],
  });
})();
