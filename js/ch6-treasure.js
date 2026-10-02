/* Chapter 6: Treasure Hunt (LO6, risk of loss, power law, manager dispersion, diversification). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const OUTCOMES = [0, 0, 0, 0, 0.5, 1, 1, 1.5, 3, 18];
  const label = (m) => {
    if (m === 0) return { ic: '💥', t: { en: 'Bankrupt', fr: 'Faillite' }, cls: 'zero' };
    if (m < 1) return { ic: '📉', t: { en: 'Sold at a loss', fr: 'Vendue à perte' }, cls: 'loss' };
    if (m === 1) return { ic: '😐', t: { en: 'Money back', fr: 'Mise récupérée' }, cls: 'flat' };
    if (m < 3) return { ic: '🙂', t: { en: 'Small gain', fr: 'Petit gain' }, cls: 'gain' };
    if (m < 10) return { ic: '🚀', t: { en: 'Big success', fr: 'Beau succès' }, cls: 'gain' };
    return { ic: '🦄', t: { en: 'UNICORN!', fr: 'LICORNE !' }, cls: 'uni' };
  };

  const MANAGERS = [
    { n: 'Alpine Peak Capital', ic: '🏔️', pitch: { en: '“Top-decile track record, deep sector network.”', fr: '« Historique dans le top 10 %, réseau sectoriel profond. »' } },
    { n: 'Lakeside Partners', ic: '🌊', pitch: { en: '“Operational experts: we transform companies.”', fr: '« Experts opérationnels : nous transformons les entreprises. »' } },
    { n: 'Meridian Growth', ic: '🧭', pitch: { en: '“We back category leaders before anyone else.”', fr: '« Nous misons sur les leaders avant tout le monde. »' } },
    { n: 'Northstar Equity', ic: '⭐', pitch: { en: '“Disciplined buyers, never overpay.”', fr: '« Acheteurs disciplinés, jamais trop cher. »' } },
  ];
  const IRRS = [0.22, 0.14, 0.08, -0.02];

  const DISPERSION = [
    { k: { en: 'Bonds', fr: 'Obligations' }, v: 1 },
    { k: { en: 'Listed equities', fr: 'Actions cotées' }, v: 2 },
    { k: { en: 'Private debt', fr: 'Dette privée' }, v: 5 },
    { k: { en: 'Real estate', fr: 'Immobilier' }, v: 8 },
    { k: { en: 'Buyout', fr: 'LBO' }, v: 14 },
    { k: { en: 'Venture capital', fr: 'Capital-risque' }, v: 22 },
  ];

  const RANGES = [
    { n: 1, k: { en: '1 fund', fr: '1 fonds' }, lo: 0.4, hi: 3.0 },
    { n: 3, k: { en: '3 funds · 3 vintages', fr: '3 fonds · 3 millésimes' }, lo: 0.9, hi: 2.4 },
    { n: 8, k: { en: '8 funds · 4 vintages · 3 strategies', fr: '8 fonds · 4 millésimes · 3 stratégies' }, lo: 1.2, hi: 2.0 },
  ];

  PA.chapters.push({
    id: 'treasure', icon: '💎',
    title: { en: 'Treasure Hunt', fr: 'La chasse au trésor' },
    tagline: { en: 'Big wins, real losses, and why you should never bet on just one.', fr: 'Gros gains, vraies pertes, et pourquoi il ne faut jamais tout miser sur un seul.' },
    mission: { en: 'Understand the risks: losses are possible, results vary hugely between managers, and diversification across funds and vintages matters.', fr: 'Comprendre les risques : des pertes sont possibles, les résultats varient fortement selon les gérants, et diversifier entre fonds et millésimes est essentiel.' },
    steps: [
      // 1. Open the 10 boxes
      () => {
        const s = PA.sector();
        const outs = PA.shuffle(OUTCOMES);
        let opened = 0;
        let total = 0;
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'A venture fund backed <b>10 start-ups</b> in {sector}, {m} each. Ten years later… <b>open every box</b> to see what happened.', fr: 'Un fonds de capital-risque a soutenu <b>10 start-ups</b> dans {sector}, {m} chacune. Dix ans plus tard… <b>ouvrez chaque coffre</b> pour découvrir le résultat.' }, { m: PA.money(100000) }))}
            <div class="boxes">${s.portfolio.map((p, i) => `<button class="box" data-i="${i}"><div class="box-in"><div class="box-front"><span>🎁</span><b>${PA.esc(p)}</b></div><div class="box-back"></div></div></button>`).join('')}</div>
            <div class="tally panel"><span>${L({ en: 'Invested', fr: 'Investi' })} <b>${PA.money(1000000)}</b></span><span>${L({ en: 'Returned', fr: 'Récupéré' })} <b id="ret">${PA.money(0)}</b></span><span><b id="mlt">0.00x</b></span></div>
            <div class="box-verdict"></div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        PA.$$('.box', root).forEach((el) => el.addEventListener('click', () => {
          if (el.classList.contains('flipped')) return;
          const m = outs[+el.dataset.i];
          const lb = label(m);
          PA.$('.box-back', el).innerHTML = `<span>${lb.ic}</span><b>${L(lb.t)}</b><em>${PA.num(m, m % 1 ? 1 : 0)}x</em>`;
          el.classList.add('flipped', lb.cls);
          total += m * 100000;
          opened++;
          if (m === 0) PA.sfx.boom(); else if (m >= 10) { PA.sfx.level(); PA.confetti(120); } else if (m > 1) PA.sfx.coin(); else PA.sfx.flip();
          PA.$('#ret', root).textContent = PA.money(total);
          PA.$('#mlt', root).textContent = PA.mult(total / 1000000);
          if (opened === 10) {
            PA.addXP(50);
            PA.$('.box-verdict', root).innerHTML = PA.ui.guide(L({
              en: '<b>4 out of 10 lost everything.</b> Yet the fund returned <b>{x}</b>, thanks mostly to <b>one</b> unicorn. That’s private markets: individual investments can go to zero, and returns are concentrated in a few winners.',
              fr: '<b>4 sur 10 ont tout perdu.</b> Pourtant le fonds rend <b>{x}</b>, grâce surtout à <b>une seule</b> licorne. C’est ça, les marchés privés : un investissement individuel peut tomber à zéro, et les gains se concentrent sur quelques gagnants.',
            }, { x: PA.mult(total / 1000000) }));
            PA.ui.enableNext(root);
          }
        }));
        PA.ui.bindNext(root);
      },

      // 2. Manager draft + dispersion chart
      () => {
        const irrs = PA.shuffle(IRRS);
        const root = PA.ui.render(`
          <div class="wide-col">
            <div class="mgr-say">${PA.ui.guide(L({ en: '🃏 <b>Manager draft.</b> You must put your <b>whole</b> private equity budget with <b>one</b> manager. They all look brilliant. Pick one.', fr: '🃏 <b>Draft des gérants.</b> Vous devez confier <b>tout</b> votre budget private equity à <b>un seul</b> gérant. Ils ont tous l’air brillants. Choisissez.' }))}</div>
            <div class="managers">${MANAGERS.map((m, i) => `<button class="mgr" data-i="${i}"><span class="mgr-ic">${m.ic}</span><b>${m.n}</b><small>${L(m.pitch)}</small><span class="mgr-res"></span></button>`).join('')}</div>
            <div class="disp-slot"></div>
            <div class="actions-slot"></div>
          </div>`);
        let picked = false;
        PA.$$('.mgr', root).forEach((el) => el.addEventListener('click', () => {
          if (picked) return;
          picked = true;
          const pi = +el.dataset.i;
          el.classList.add('picked');
          PA.sfx.click();
          PA.$$('.mgr', root).forEach((x, k) => {
            PA.later(() => {
              const v = irrs[k];
              x.classList.add('revealed', v >= 0.15 ? 'top' : v < 0 ? 'bottom' : 'mid');
              PA.$('.mgr-res', x).innerHTML = `${L({ en: 'Net IRR', fr: 'TRI net' })} <b>${PA.pct(v, 0)}</b>`;
              PA.sfx.flip();
            }, 400 + k * 450);
          });
          PA.later(() => {
            const v = irrs[pi];
            PA.$('.mgr-say', root).innerHTML = PA.ui.guide(L({
              en: 'You picked <b>{n}</b>: <b>{v}</b> a year. Same market, same years, yet results range from <b>{lo}</b> to <b>{hi}</b>. In private markets, <b>who</b> you invest with matters enormously.',
              fr: 'Vous avez choisi <b>{n}</b> : <b>{v}</b> par an. Même marché, mêmes années, et pourtant les résultats vont de <b>{lo}</b> à <b>{hi}</b>. Sur les marchés privés, <b>avec qui</b> vous investissez compte énormément.',
            }, { n: MANAGERS[pi].n, v: PA.pct(v, 0), lo: PA.pct(-0.02, 0), hi: PA.pct(0.22, 0) }));
            if (v >= 0.15) PA.sfx.good(); else if (v < 0) PA.sfx.bad();
            const max = 24;
            PA.$('.disp-slot', root).innerHTML = `<div class="panel">
              <h3>${L({ en: 'Gap between top- and bottom-quartile managers', fr: 'Écart entre les gérants du premier et du dernier quartile' })} <small>(${L({ en: 'annual return, percentage points, illustrative', fr: 'rendement annuel, en points, illustratif' })})</small></h3>
              <div class="hbars">${DISPERSION.map((d) => `<div class="hbar"><span>${L(d.k)}</span><div class="hb-track"><div class="hb-fill" style="--w:${(d.v / max) * 100}%"></div></div><b>${d.v}</b></div>`).join('')}</div></div>`;
            PA.$('.actions-slot', root).innerHTML = PA.ui.cont();
            PA.ui.bindNext(root);
          }, 400 + MANAGERS.length * 450 + 300);
        }));
      },

      // 3. Diversification builder
      () => {
        let shown = 1;
        const max = 3.5;
        const row = (r, i) => `<div class="range-row ${i < shown ? 'on' : ''}">
            <span class="rr-k">${L(r.k)}</span>
            <div class="rr-track"><div class="rr-zero" style="left:${(1 / max) * 100}%"><em>1x</em></div><div class="rr-bar" style="left:${(r.lo / max) * 100}%;width:${((r.hi - r.lo) / max) * 100}%"><i>${PA.num(r.lo, 1)}x</i><i>${PA.num(r.hi, 1)}x</i></div></div>
          </div>`;
        const root = PA.ui.render(`
          <div class="wide-col">
            <div class="div-say">${PA.ui.guide(L({ en: 'The pros’ answer to all this risk: <b>diversify</b> across managers, strategies and <b>vintage years</b>. Nobody knows if {year} will be a great vintage or a poor one. Press <b>Diversify</b>.', fr: 'La réponse des pros à tous ces risques : <b>diversifier</b> entre gérants, stratégies et <b>millésimes</b>. Personne ne sait si {year} sera un grand ou un petit millésime. Appuyez sur <b>Diversifier</b>.' }))}</div>
            <div class="panel">
              <h3>${L({ en: 'Range of likely outcomes (multiple of money, illustrative)', fr: 'Fourchette de résultats probables (multiple, illustratif)' })}</h3>
              <div class="ranges">${RANGES.map(row).join('')}</div>
            </div>
            <div class="actions"><button class="btn primary" id="div">🧩 ${L({ en: 'Diversify', fr: 'Diversifier' })}</button></div>
          </div>`);
        const btn = PA.$('#div', root);
        btn.addEventListener('click', () => {
          shown++;
          PA.$$('.range-row', root).forEach((r, i) => r.classList.toggle('on', i < shown));
          PA.sfx.coin();
          if (shown >= RANGES.length) {
            PA.addXP(40, btn);
            PA.$('.div-say', root).innerHTML = PA.ui.guide(L({
              en: 'The extremes shrink: fewer disasters, fewer miracles, a much more <b>predictable</b> outcome. Diversification <b>doesn’t remove</b> the risk of loss, but it makes a total wipe-out far less likely.',
              fr: 'Les extrêmes se resserrent : moins de catastrophes, moins de miracles, un résultat bien plus <b>prévisible</b>. La diversification <b>n’élimine pas</b> le risque de perte, mais rend une perte totale bien moins probable.',
            }));
            btn.outerHTML = PA.ui.btn(L(PA.S.continue) + ' <span class="arr">▸</span>', 'data-next');
            PA.ui.bindNext(root);
          }
        });
      },

      // 4. Insights
      PA.step.insight([
        { id: 'risk-loss', icon: '💥', title: { en: 'You can lose money', fr: 'Vous pouvez perdre de l’argent' }, body: { en: 'Individual companies can fail completely, and a whole fund can return less than you invested. There is <b>no capital guarantee</b>.', fr: 'Des entreprises peuvent faire totalement faillite, et un fonds entier peut rendre moins que votre mise. Il n’y a <b>aucune garantie en capital</b>.' } },
        { id: 'risk-mgr', icon: '🎯', title: { en: 'Manager selection is key', fr: 'Le choix du gérant est clé' }, body: { en: 'The gap between good and bad managers is <b>far wider</b> than in listed markets. Due diligence on the team matters as much as the strategy.', fr: 'L’écart entre bons et mauvais gérants est <b>bien plus large</b> que sur les marchés cotés. L’analyse de l’équipe compte autant que la stratégie.' } },
        { id: 'risk-div', icon: '🧩', title: { en: 'Diversify: funds, strategies, vintages', fr: 'Diversifier : fonds, stratégies, millésimes' }, body: { en: 'Spread commitments across several managers and strategies, and <b>commit over several years</b> so you don’t bet everything on one market cycle.', fr: 'Répartissez vos engagements entre plusieurs gérants et stratégies, et <b>engagez sur plusieurs années</b> pour ne pas tout miser sur un seul cycle de marché.' } },
        { id: 'risk-pro', pro: true, icon: '🧪', title: { en: 'Persistence & concentration', fr: 'Persistance & concentration' }, body: { en: 'Top-quartile persistence used to be strong but has weakened, especially in buyout: past performance helps but is less predictive than it was. Other risks to assess: leverage at company <b>and</b> fund level (NAV loans, subscription lines), key-person risk, style drift and ESG/regulatory risks.', fr: 'La persistance du premier quartile, autrefois forte, s’est affaiblie, surtout en LBO : la performance passée aide, mais prédit moins qu’avant. Autres risques à évaluer : levier au niveau des entreprises <b>et</b> du fonds (prêts NAV, lignes de souscription), risque d’homme clé, dérive de style, risques ESG et réglementaires.' } },
      ]),

      // 5. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'Four start-ups lost everything, yet the fund still made money. What’s the lesson?', fr: 'Quatre start-ups ont tout perdu, mais le fonds a gagné de l’argent. Quelle est la leçon ?' },
          options: [
            { en: 'Single investments can go to zero, so diversification and manager quality are essential', fr: 'Un investissement peut tomber à zéro : diversification et qualité du gérant sont essentielles' },
            { en: 'Private equity funds can’t lose money', fr: 'Les fonds de private equity ne peuvent pas perdre d’argent' },
            { en: 'It’s best to invest everything in one company', fr: 'Mieux vaut tout investir dans une seule entreprise' },
          ],
          answer: 0,
          explain: { en: 'Losses are part of the game. A diversified portfolio of good managers is how investors handle them.', fr: 'Les pertes font partie du jeu. Un portefeuille diversifié de bons gérants est la façon de les gérer.' },
        },
        pro: {
          q: { en: 'Why diversify private equity commitments across vintage years?', fr: 'Pourquoi diversifier ses engagements de private equity entre millésimes ?' },
          options: [
            { en: 'Entry valuations and exit conditions vary by year; spreading commitments reduces timing risk', fr: 'Les valorisations d’entrée et conditions de sortie varient selon les années ; étaler ses engagements réduit le risque de calendrier' },
            { en: 'To pay lower management fees', fr: 'Pour payer moins de frais de gestion' },
            { en: 'Because each LP can only commit once per vintage', fr: 'Parce que chaque LP ne peut s’engager qu’une fois par millésime' },
          ],
          answer: 0,
          explain: { en: 'Vintage dispersion is large. A steady commitment pace smooths exposure to entry multiples, credit conditions and exit windows.', fr: 'La dispersion entre millésimes est forte. Un rythme d’engagement régulier lisse l’exposition aux multiples d’entrée, aux conditions de crédit et aux fenêtres de sortie.' },
        },
      }),
    ],
  });
})();
