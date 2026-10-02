/* Chapter 2: The Map (LO2, the families of private assets). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const FAMILIES = [
    {
      id: 'vc', icon: '🌱', risk: 5, drv: 'growth', hz: { en: '8–12 years', fr: '8 à 12 ans' },
      name: { en: 'Venture & Growth', fr: 'Capital-risque & croissance' },
      what: { en: 'Minority stakes in <b>young, fast-growing companies</b>. Many fail; a few become giants and pay for everything else.', fr: 'Des participations minoritaires dans des <b>jeunes entreprises en forte croissance</b>. Beaucoup échouent ; quelques-unes deviennent des géants et paient pour tout le reste.' },
      pro: { en: 'Stages: seed → Series A/B/C → growth. Returns follow a <b>power law</b>, and manager dispersion is the widest of any asset class. Access to top-tier managers is the real edge.', fr: 'Étapes : amorçage → séries A/B/C → croissance. Les rendements suivent une <b>loi de puissance</b> et la dispersion entre gérants est la plus forte de toutes les classes d’actifs. L’accès aux meilleurs gérants fait la différence.' },
    },
    {
      id: 'buyout', icon: '🏢', risk: 4, drv: 'growth', hz: { en: '4–6 years per company, ~10-year fund', fr: '4 à 6 ans par entreprise, fonds ~10 ans' },
      name: { en: 'Buyout', fr: 'Buyout (LBO)' },
      what: { en: 'Funds buy <b>control of mature, profitable companies</b>, improve them (strategy, operations, acquisitions) and sell them. The largest part of private equity.', fr: 'Les fonds prennent le <b>contrôle d’entreprises matures et rentables</b>, les améliorent (stratégie, opérations, acquisitions) puis les revendent. Le plus grand segment du private equity.' },
      pro: { en: 'Value creation = earnings growth + multiple expansion + debt paydown. Acquisitions are often financed with 4–6x EBITDA of debt: <b>leverage amplifies gains and losses</b>.', fr: 'Création de valeur = croissance des résultats + expansion des multiples + désendettement. Les acquisitions sont souvent financées avec 4 à 6x l’EBITDA en dette : <b>le levier amplifie gains et pertes</b>.' },
    },
    {
      id: 'debt', icon: '💶', risk: 2, drv: 'income', hz: { en: '3–7 years', fr: '3 à 7 ans' },
      name: { en: 'Private Debt', fr: 'Dette privée' },
      what: { en: 'Instead of buying shares, the fund <b>lends money</b> to companies, often ones banks no longer serve. You earn <b>regular interest</b>, and lenders are repaid before shareholders.', fr: 'Au lieu d’acheter des actions, le fonds <b>prête de l’argent</b> aux entreprises, souvent celles que les banques ne financent plus. Vous percevez des <b>intérêts réguliers</b>, et les prêteurs sont remboursés avant les actionnaires.' },
      pro: { en: 'Mostly <b>senior secured, floating-rate direct lending</b>; also mezzanine, distressed and specialty finance. Key risks: defaults, recovery rates and covenant quality. Lower return ceiling, but more predictable cash flows.', fr: 'Surtout du <b>prêt direct senior sécurisé à taux variable</b> ; aussi mezzanine, dette en difficulté et financements spécialisés. Risques clés : défauts, taux de recouvrement et qualité des covenants. Plafond de rendement plus bas, flux plus prévisibles.' },
    },
    {
      id: 'infra', icon: '🌉', risk: 2, drv: 'both', hz: { en: '10–15+ years', fr: '10 à 15 ans et plus' },
      name: { en: 'Infrastructure', fr: 'Infrastructures' },
      what: { en: '<b>Essential, long-life assets</b>: energy, transport, data, water. Often backed by long contracts or regulation, giving <b>stable, often inflation-linked income</b>.', fr: 'Des <b>actifs essentiels à longue durée de vie</b> : énergie, transport, données, eau. Souvent adossés à des contrats longs ou à une régulation, ils offrent des <b>revenus stables, souvent indexés sur l’inflation</b>.' },
      pro: { en: 'Core/core-plus (operating, regulated) vs value-add/greenfield (construction & development risk). Watch: regulatory and political risk, interest-rate sensitivity, refinancing.', fr: 'Core/core-plus (en exploitation, régulés) vs value-add/greenfield (risque de construction et de développement). Points de vigilance : risque réglementaire et politique, sensibilité aux taux, refinancement.' },
    },
    {
      id: 're', icon: '🏙️', risk: 3, drv: 'both', hz: { en: '5–10 years', fr: '5 à 10 ans' },
      name: { en: 'Real Estate', fr: 'Immobilier' },
      what: { en: 'Buildings (offices, logistics, housing, hotels) that are bought, improved and rented. Returns come from <b>rents</b> and <b>value gains</b>.', fr: 'Des bâtiments (bureaux, logistique, logements, hôtels) achetés, améliorés et loués. Les rendements proviennent des <b>loyers</b> et des <b>plus-values</b>.' },
      pro: { en: 'Strategies from core (stable, low leverage) to core-plus, value-add and opportunistic. Highly sensitive to interest rates and cap rates.', fr: 'Stratégies allant du core (stable, peu de levier) au core-plus, value-add et opportuniste. Très sensible aux taux d’intérêt et aux taux de capitalisation.' },
    },
  ];
  const DRIVER = {
    growth: { en: '📈 Growth', fr: '📈 Croissance' },
    income: { en: '💧 Income', fr: '💧 Revenu' },
    both: { en: '📈 + 💧 Both', fr: '📈 + 💧 Les deux' },
  };

  const famCard = (f) => {
    const s = PA.sector();
    return `<div class="fam-card">
      <div class="fam-head"><span class="fam-ic">${f.icon}</span><h3>${L(f.name)}</h3></div>
      <p>${L(f.what)}</p>
      <div class="fam-ex"><span>${s.icon} ${L({ en: 'In your world', fr: 'Dans votre univers' })}</span>${L(s.deals[f.id])}</div>
      <div class="fam-meta">
        <div><small>${L({ en: 'Risk', fr: 'Risque' })}</small><span class="meter">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= f.risk ? 'on' : ''}"></i>`).join('')}</span></div>
        <div><small>${L({ en: 'Return driver', fr: 'Moteur de rendement' })}</small><b>${L(DRIVER[f.drv])}</b></div>
        <div><small>${L({ en: 'Horizon', fr: 'Horizon' })}</small><b>${L(f.hz)}</b></div>
      </div>
      ${PA.isPro() ? `<p class="pro-note">◆ ${L(f.pro)}</p>` : ''}
    </div>`;
  };

  PA.chapters.push({
    id: 'map', icon: '🗺️',
    title: { en: 'The Private Markets Map', fr: 'La carte des marchés privés' },
    tagline: { en: 'Five districts, five ways to put capital to work.', fr: 'Cinq quartiers, cinq façons de faire travailler le capital.' },
    mission: { en: 'Know the main families: private equity (venture, buyout), private debt, infrastructure and real estate.', fr: 'Connaître les grandes familles : private equity (capital-risque, LBO), dette privée, infrastructures et immobilier.' },
    steps: [
      // 1. Explore the map
      () => {
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({
              en: 'Welcome to the private markets city. Each district finances a different kind of asset. <b>Visit all five</b> and see how each one could touch {sector}.',
              fr: 'Bienvenue dans la ville des marchés privés. Chaque quartier finance un type d’actif différent. <b>Visitez les cinq</b> et voyez comment chacun pourrait toucher {sector}.',
            }))}
            <div class="citymap">${FAMILIES.map((f) => `<button class="district d-${f.id}" data-f="${f.id}"><span class="d-ic">${f.icon}</span><span class="d-name">${L(f.name)}</span><span class="d-check">✓</span></button>`).join('')}</div>
            <div class="fam-slot"><div class="panel"><em>${L(PA.S.tapAll)}</em></div></div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.district', () => PA.ui.enableNext(root));
        PA.$$('.district', root).forEach((el) => el.addEventListener('click', () => {
          const f = FAMILIES.find((x) => x.id === el.dataset.f);
          PA.$$('.district', root).forEach((x) => x.classList.toggle('active', x === el));
          PA.$('.fam-slot', root).innerHTML = famCard(f);
          if (!el.classList.contains('seen')) PA.addXP(10, el);
          PA.sfx.flip();
          mark(el);
        }));
        PA.ui.bindNext(root);
      },

      // 2. Sorting game: match deals in your sector to districts
      () => {
        const s = PA.sector();
        const rounds = PA.shuffle(['vc', 'buyout', 'debt', 'infra', 're']).slice(0, 4);
        let r = 0;
        let score = 0;
        const draw = () => {
          const id = rounds[r];
          const root = PA.ui.render(`
            <div class="center-col">
              ${PA.ui.guide(L({ en: 'Deal flow incoming! Send each {sector} deal to the right district.', fr: 'Des dossiers arrivent ! Envoyez chaque opération dans {sector} vers le bon quartier.' }))}
              <div class="deal-card"><div class="deal-tag">📨 ${L({ en: 'Deal', fr: 'Dossier' })} ${r + 1}/${rounds.length}</div><div class="deal-txt">${s.icon} ${L(s.deals[id])}</div></div>
              <div class="sort-btns">${FAMILIES.map((f) => `<button class="sort-btn" data-f="${f.id}">${f.icon} ${L(f.name)}</button>`).join('')}</div>
              <div class="feedback" hidden></div>
            </div>`);
          let tries = 0;
          PA.$$('.sort-btn', root).forEach((b) => b.addEventListener('click', () => {
            if (b.disabled || root.dataset.done) return;
            tries++;
            if (b.dataset.f === id) {
              root.dataset.done = '1';
              b.classList.add('correct');
              PA.sfx.good();
              if (tries === 1) { score++; PA.addXP(25, b); }
              PA.later(() => { r++; if (r < rounds.length) draw(); else done(); }, 900);
            } else {
              b.classList.add('wrong', 'shake');
              b.disabled = true;
              PA.sfx.bad();
            }
          }));
        };
        const done = () => {
          const root = PA.ui.render(`
            <div class="center-col">
              <div class="score-big">${score}/${rounds.length}</div>
              ${PA.ui.guide(L(score >= 3
                ? { en: 'Sharp eye! You can already tell <b>equity</b> (owning a share) from <b>debt</b> (lending) and <b>real assets</b> (buildings and infrastructure).', fr: 'Œil affûté ! Vous distinguez déjà les <b>fonds propres</b> (être actionnaire), la <b>dette</b> (prêter) et les <b>actifs réels</b> (immeubles et infrastructures).' }
                : { en: 'Good effort. Simple rule: owning a stake = <b>equity</b>; lending for interest = <b>debt</b>; essential long-life assets = <b>infrastructure</b>; buildings = <b>real estate</b>.', fr: 'Bel effort. Règle simple : détenir une part = <b>fonds propres</b> ; prêter contre intérêts = <b>dette</b> ; actifs essentiels de long terme = <b>infrastructures</b> ; bâtiments = <b>immobilier</b>.' }))}
              ${PA.ui.cont()}
            </div>`);
          PA.ui.bindNext(root);
        };
        draw();
      },

      // 3. Insight cards
      PA.step.insight([
        { id: 'fam-pe', icon: '🏢', title: { en: 'Private equity = owning', fr: 'Private equity = détenir' }, body: { en: 'You own a piece of companies (young ones in <b>venture</b>, mature ones in <b>buyout</b>). Highest potential return, highest risk.', fr: 'Vous détenez une partie d’entreprises (jeunes en <b>capital-risque</b>, matures en <b>LBO</b>). Potentiel de rendement le plus élevé, risque le plus élevé.' } },
        { id: 'fam-pd', icon: '💶', title: { en: 'Private debt = lending', fr: 'Dette privée = prêter' }, body: { en: 'You are the bank. Return comes mainly from <b>interest</b>. Lower risk than equity, but a borrower can still default.', fr: 'Vous jouez le rôle de la banque. Le rendement vient surtout des <b>intérêts</b>. Moins risqué que les actions, mais un emprunteur peut faire défaut.' } },
        { id: 'fam-infra', icon: '🌉', title: { en: 'Infrastructure = the backbone', fr: 'Infrastructures = la colonne vertébrale' }, body: { en: 'Roads, wind farms, data centers, networks. <b>Long, steady, often inflation-linked</b> cash flows, with very long holding periods.', fr: 'Routes, parcs éoliens, data centers, réseaux. Des flux <b>longs, réguliers, souvent indexés sur l’inflation</b>, avec des durées de détention très longues.' } },
        { id: 'fam-sec', pro: true, icon: '🔁', title: { en: 'Two more doors: secondaries & co-investments', fr: 'Deux portes de plus : secondaire & co-investissement' }, body: { en: '<b>Secondaries</b>: buying existing fund stakes from other investors, often at a discount, with a shorter J-curve. <b>Co-investments</b>: investing directly alongside a GP in a single deal, usually with lower or no fees but more concentration.', fr: '<b>Secondaire</b> : racheter des parts de fonds existantes à d’autres investisseurs, souvent avec décote et une courbe en J plus courte. <b>Co-investissement</b> : investir directement aux côtés d’un GP dans une opération, souvent avec peu ou pas de frais mais plus de concentration.' } },
      ]),

      // 4. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'Which family typically aims for stable, long-term income, often linked to inflation?', fr: 'Quelle famille vise généralement des revenus stables de long terme, souvent liés à l’inflation ?' },
          options: [{ en: 'Infrastructure', fr: 'Les infrastructures' }, { en: 'Venture capital', fr: 'Le capital-risque' }, { en: 'Buyout', fr: 'Le LBO' }],
          answer: 0,
          explain: { en: 'Infrastructure assets (energy, transport, networks) often have long contracts or regulated revenues, sometimes indexed to inflation.', fr: 'Les infrastructures (énergie, transport, réseaux) bénéficient souvent de contrats longs ou de revenus régulés, parfois indexés sur l’inflation.' },
          hint: { en: 'Think wind farms and toll roads, not start-ups.', fr: 'Pensez parcs éoliens et autoroutes, pas start-ups.' },
        },
        pro: {
          q: { en: 'In a leveraged buyout, what amplifies both gains and losses the most?', fr: 'Dans un LBO, qu’est-ce qui amplifie le plus les gains comme les pertes ?' },
          options: [{ en: 'The acquisition debt (leverage)', fr: 'La dette d’acquisition (le levier)' }, { en: 'The management fee', fr: 'Les frais de gestion' }, { en: 'The fund’s vintage year', fr: 'Le millésime du fonds' }],
          answer: 0,
          explain: { en: 'With 4–6x EBITDA of debt, a small change in enterprise value creates a large change in equity value, in both directions.', fr: 'Avec 4 à 6x l’EBITDA en dette, une petite variation de la valeur d’entreprise entraîne une forte variation de la valeur des fonds propres, dans les deux sens.' },
        },
      }),
    ],
  });
})();
