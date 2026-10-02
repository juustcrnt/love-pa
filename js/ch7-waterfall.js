/* Chapter 7: The Waterfall (LO7, fees, hurdle, carried interest, gross vs net). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  // Simplified European (whole-fund) waterfall.
  const FEE_SHARE = 0.15; // ~2%/yr in years 1–5 on commitment + lower after ≈ 15% of commitment over fund life
  const HURDLE_YEARS = 5; // average holding period used for the 8% compounding hurdle
  const compute = (C, m) => {
    const fees = FEE_SHARE * C;
    const invested = C - fees;
    const gross = invested * m;
    const H = C * (Math.pow(1.08, HURDLE_YEARS) - 1);
    let rem = gross;
    const t1 = Math.min(rem, C); rem -= t1;
    const t2 = Math.min(rem, H); rem -= t2;
    const t3 = Math.min(rem, 0.25 * H); rem -= t3;
    const t4lp = 0.8 * rem, t4gp = 0.2 * rem;
    const carry = t3 + t4gp;
    const lp = gross - carry;
    return { C, fees, invested, gross, H, t1, t2, t3, t4lp, t4gp, carry, lp, net: lp / C, grossM: m };
  };

  PA.chapters.push({
    id: 'waterfall', icon: '🌊',
    title: { en: 'The Waterfall', fr: 'La cascade' },
    tagline: { en: 'Profits are made. Now, who gets what?', fr: 'Les profits sont là. Maintenant, qui reçoit quoi ?' },
    mission: { en: 'Understand fees: management fee, hurdle, carried interest, and the gap between gross and net returns.', fr: 'Comprendre les frais : frais de gestion, hurdle, carried interest, et l’écart entre rendement brut et net.' },
    steps: [
      // 1. Fee cards
      () => {
        const cards = [
          { ic: '🧾', t: { en: 'Management fee', fr: 'Frais de gestion' }, v: '~1.5–2%', b: { en: 'Per year, on your <b>commitment</b> during the investment period (then lower). Pays the team, offices and research, whatever the performance.', fr: 'Par an, sur votre <b>engagement</b> pendant la période d’investissement (puis réduits). Rémunère l’équipe, les bureaux, la recherche, quelle que soit la performance.' } },
          { ic: '🚧', t: { en: 'Hurdle (preferred return)', fr: 'Hurdle (rendement préférentiel)' }, v: '~8%/' + PA.L({ en: 'yr', fr: 'an' }), b: { en: 'The minimum return <b>you</b> must receive before the manager shares in profits.', fr: 'Le rendement minimum que <b>vous</b> devez recevoir avant que le gérant ne participe aux profits.' } },
          { ic: '🏆', t: { en: 'Carried interest', fr: 'Carried interest' }, v: '~20%', b: { en: 'The manager’s share of <b>profits</b>, only once the hurdle is met. It rewards performance and aligns interests.', fr: 'La part des <b>profits</b> revenant au gérant, uniquement une fois le hurdle atteint. Elle récompense la performance et aligne les intérêts.' } },
          { ic: '🤝', t: { en: 'Skin in the game', fr: 'Engagement du gérant' }, v: '1–3%', b: { en: 'The manager invests its own money in the fund, alongside you.', fr: 'Le gérant investit son propre argent dans le fonds, à vos côtés.' } },
        ];
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'Managers aren’t paid like a listed index fund. The classic model is called <b>“2 and 20”</b>. <b>Flip all four cards.</b>', fr: 'Les gérants ne sont pas rémunérés comme un fonds indiciel coté. Le modèle classique s’appelle <b>« 2 et 20 »</b>. <b>Retournez les quatre cartes.</b>' }))}
            <div class="flip-row four">${cards.map((c, i) => `<button class="flip" data-i="${i}"><div class="flip-in"><div class="flip-front"><span>${c.ic}</span><b>${L(c.t)}</b><em class="big-v">${c.v}</em></div><div class="flip-back"><b>${c.ic} ${L(c.t)}</b><p>${L(c.b)}</p></div></div></button>`).join('')}</div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.flip', () => PA.ui.enableNext(root));
        PA.$$('.flip', root).forEach((el) => el.addEventListener('click', () => { if (!el.classList.contains('seen')) PA.sfx.flip(); el.classList.add('flipped'); mark(el); }));
        PA.ui.bindNext(root);
      },

      // 2. Interactive waterfall
      () => {
        const C = PA.state.commitment;
        const pro = PA.isPro();
        let moved = 0;
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'You committed <b>{commit}</b>. Drag the slider: how well did the manager invest (gross multiple on the money actually invested)? Watch where every franc ends up.', fr: 'Vous avez engagé <b>{commit}</b>. Faites glisser le curseur : quelle performance le gérant a-t-il obtenue (multiple brut sur l’argent réellement investi) ? Observez où finit chaque franc.' }))}
            <div class="panel wf">
              <div class="wf-slider">
                <span>${L({ en: 'Gross multiple', fr: 'Multiple brut' })}</span>
                <input type="range" id="gm" min="1" max="3" step="0.1" value="2">
                <b id="gmv">2.0x</b>
              </div>
              <div class="wf-bar" id="wfbar"></div>
              <div class="wf-legend">
                <span><i class="sw cap"></i>${L({ en: 'Your capital back', fr: 'Votre capital remboursé' })}</span>
                <span><i class="sw prof"></i>${L({ en: 'Your profit', fr: 'Votre profit' })}</span>
                <span><i class="sw fee"></i>${L({ en: 'Management fees', fr: 'Frais de gestion' })}</span>
                <span><i class="sw carry"></i>${L({ en: 'Carried interest', fr: 'Carried interest' })}</span>
              </div>
              <div class="wf-kpis" id="wfk"></div>
              ${pro ? '<div class="wf-tiers" id="wft"></div>' : ''}
            </div>
            <div class="wf-say"></div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const upd = () => {
          const m = +PA.$('#gm', root).value;
          const r = compute(C, m);
          PA.$('#gmv', root).textContent = PA.num(m, 1) + 'x';
          const total = r.gross + r.fees;
          const capBack = Math.min(r.lp, C);
          const profit = Math.max(0, r.lp - C);
          const seg = (cls, v, lbl) => (v > 0.5 ? `<div class="seg ${cls}" style="flex:${v}"><span>${v / total > 0.09 ? lbl : ''}</span></div>` : '');
          PA.$('#wfbar', root).innerHTML = seg('cap', capBack, PA.money(capBack)) + seg('prof', profit, PA.money(profit)) + seg('fee', r.fees, PA.money(r.fees)) + seg('carry', r.carry, PA.money(r.carry));
          const lossTxt = r.lp < C ? `<div class="kpi bad"><small>${L({ en: 'Your loss', fr: 'Votre perte' })}</small><b>${PA.money(r.lp - C)}</b></div>` : '';
          PA.$('#wfk', root).innerHTML = `
            <div class="kpi"><small>${L({ en: 'Gross (fund level)', fr: 'Brut (niveau fonds)' })}</small><b>${PA.num(m, 1)}x</b></div>
            <div class="kpi hl"><small>${L({ en: 'Net (what you get)', fr: 'Net (ce que vous touchez)' })}</small><b>${PA.mult(r.net)}</b></div>
            <div class="kpi"><small>${L({ en: 'You receive', fr: 'Vous recevez' })}</small><b>${PA.money(r.lp)}</b></div>
            <div class="kpi"><small>${L({ en: 'Manager receives', fr: 'Le gérant reçoit' })}</small><b>${PA.money(r.fees + r.carry)}</b></div>${lossTxt}`;
          if (pro) {
            PA.$('#wft', root).innerHTML = `<table>
              <tr><th>${L({ en: 'Waterfall tier', fr: 'Palier de la cascade' })}</th><th>LP</th><th>GP</th></tr>
              <tr><td>① ${L({ en: 'Return of contributed capital', fr: 'Remboursement du capital versé' })}</td><td>${PA.money(r.t1)}</td><td>–</td></tr>
              <tr><td>② ${L({ en: 'Preferred return (8%/yr)', fr: 'Rendement préférentiel (8 %/an)' })}</td><td>${PA.money(r.t2)}</td><td>–</td></tr>
              <tr><td>③ ${L({ en: 'GP catch-up (100%)', fr: 'Rattrapage du GP (100 %)' })}</td><td>–</td><td>${PA.money(r.t3)}</td></tr>
              <tr><td>④ ${L({ en: '80 / 20 split', fr: 'Partage 80 / 20' })}</td><td>${PA.money(r.t4lp)}</td><td>${PA.money(r.t4gp)}</td></tr>
            </table>`;
          }
          let msg;
          if (r.lp < C) msg = { en: '😬 The investments made a little money (or just broke even), yet you get back <b>less than you committed</b>: management fees are paid regardless. No carry, though: the hurdle wasn’t met.', fr: '😬 Les investissements ont un peu gagné (ou sont à l’équilibre), et pourtant vous récupérez <b>moins que votre engagement</b> : les frais de gestion sont dus quoi qu’il arrive. Pas de carried interest en revanche : le hurdle n’est pas atteint.' };
          else if (r.carry < 1) msg = { en: '🚧 Profits exist but are <b>below the hurdle</b>: they all go to you, and the manager gets no carry.', fr: '🚧 Il y a des profits mais ils sont <b>sous le hurdle</b> : ils vous reviennent entièrement, le gérant ne touche pas de carried interest.' };
          else msg = { en: '📊 Gross <b>{g}</b> becomes <b>{n}</b> net for you. The gap is the cost of access, expertise and alignment. Always compare funds on a <b>net</b> basis.', fr: '📊 Un brut de <b>{g}</b> devient <b>{n}</b> net pour vous. L’écart est le prix de l’accès, de l’expertise et de l’alignement. Comparez toujours les fonds en <b>net</b>.' };
          PA.$('.wf-say', root).innerHTML = PA.ui.guide(L(msg, { g: PA.num(m, 1) + 'x', n: PA.mult(r.net) }));
        };
        PA.$('#gm', root).addEventListener('input', () => {
          upd();
          moved++;
          if (moved === 6) { PA.addXP(40); PA.ui.enableNext(root); }
        });
        PA.later(() => PA.ui.enableNext(root), 9000);
        upd();
        PA.ui.bindNext(root);
      },

      // 3. Insights
      PA.step.insight([
        { id: 'fee-gn', icon: '🧮', title: { en: 'Gross vs net', fr: 'Brut vs net' }, body: { en: 'Fees in private assets are <b>higher than in listed funds</b> and can take several percentage points a year off returns. What counts is the <b>net</b> return, after all fees and carry.', fr: 'Les frais des actifs privés sont <b>plus élevés que ceux des fonds cotés</b> et peuvent amputer le rendement de plusieurs points par an. Ce qui compte, c’est le rendement <b>net</b>, après tous les frais et le carried interest.' } },
        { id: 'fee-align', icon: '🤝', title: { en: 'Alignment', fr: 'Alignement' }, body: { en: 'Carry is paid only if you earn well first (hurdle), and the manager invests alongside you. When you win big, they win; when you don’t, they earn only the management fee.', fr: 'Le carried interest n’est versé que si vous gagnez bien d’abord (hurdle), et le gérant investit à vos côtés. Quand vous gagnez beaucoup, il gagne ; sinon, il ne touche que les frais de gestion.' } },
        { id: 'fee-pro', pro: true, icon: '⚙️', title: { en: 'Waterfall mechanics', fr: 'Mécanique de la cascade' }, body: { en: '<b>European</b> (whole-fund) waterfall: carry only after all contributed capital + pref is returned. <b>American</b> (deal-by-deal): carry earlier, protected by <b>clawback</b> and escrow. Also check: fee offsets (transaction/monitoring fees), fund expenses, and a <b>second fee layer</b> in feeder or fund-of-funds structures.', fr: 'Cascade <b>européenne</b> (fonds entier) : carried interest seulement après remboursement de tout le capital versé + le rendement préférentiel. <b>Américaine</b> (opération par opération) : carried interest plus tôt, protégé par une <b>clause de restitution</b> (clawback) et un séquestre. Vérifiez aussi : rétrocession des frais de transaction/suivi, frais du fonds, et une <b>seconde couche de frais</b> dans les feeders ou fonds de fonds.' } },
      ]),

      // 4. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'What does the classic “2 and 20” mean?', fr: 'Que signifie le classique « 2 et 20 » ?' },
          options: [
            { en: '~2% management fee per year + ~20% of profits (carried interest), usually above a hurdle', fr: '~2 % de frais de gestion par an + ~20 % des profits (carried interest), généralement au-delà d’un hurdle' },
            { en: '2 years of lock-up and 20% guaranteed return', fr: '2 ans de blocage et 20 % de rendement garanti' },
            { en: '2 managers and 20 companies per fund', fr: '2 gérants et 20 entreprises par fonds' },
          ],
          answer: 0,
          explain: { en: 'Fees reduce your net return, so always compare funds net of all fees.', fr: 'Les frais réduisent votre rendement net : comparez toujours les fonds nets de tous frais.' },
          hint: { en: 'Think of the four cards you flipped.', fr: 'Repensez aux quatre cartes retournées.' },
        },
        pro: {
          q: { en: 'What is the purpose of the GP catch-up?', fr: 'À quoi sert le rattrapage (catch-up) du GP ?' },
          options: [
            { en: 'After LPs get their pref, the GP takes most or all distributions until it holds its agreed share (e.g. 20%) of total profits', fr: 'Après le rendement préférentiel des LP, le GP perçoit tout ou l’essentiel des distributions jusqu’à détenir sa part convenue (ex. 20 %) des profits totaux' },
            { en: 'It lets the GP recover management fees waived in the first year', fr: 'Il permet au GP de récupérer les frais de gestion abandonnés la première année' },
            { en: 'It returns excess carry to LPs at the end of the fund', fr: 'Il restitue l’excédent de carried interest aux LP en fin de fonds' },
          ],
          answer: 0,
          explain: { en: 'With a full catch-up, the hurdle sets a minimum for LPs but doesn’t reduce the GP’s 20% once returns are high enough. (Returning excess carry is the clawback.)', fr: 'Avec un rattrapage complet, le hurdle protège les LP mais ne réduit pas les 20 % du GP une fois les rendements suffisants. (Restituer l’excédent de carried interest, c’est le clawback.)' },
        },
      }),
    ],
  });
})();
