/* Chapter 4: The Vault (LO3, illiquidity, long horizon, secondaries). */
(() => {
  'use strict';
  const PA = window.PA;
  const L = PA.L;

  const LADDER = [
    { id: 'cash', icon: '💳', name: { en: 'Bank account', fr: 'Compte bancaire' }, time: { en: 'Instant', fr: 'Immédiat' } },
    { id: 'stocks', icon: '📈', name: { en: 'Listed shares', fr: 'Actions cotées' }, time: { en: '~2 days', fr: '~2 jours' } },
    { id: 'reit', icon: '🏢', name: { en: 'Open-ended real-estate fund', fr: 'Fonds immobilier ouvert' }, time: { en: 'Weeks to months', fr: 'Semaines à mois' } },
    { id: 'house', icon: '🏡', name: { en: 'Your house', fr: 'Votre maison' }, time: { en: 'Months', fr: 'Plusieurs mois' } },
    { id: 'pe', icon: '🔒', name: { en: 'Private equity fund stake', fr: 'Part de fonds de private equity' }, time: { en: 'Years, or a sale at a discount', fr: 'Des années, ou une vente avec décote' } },
  ];

  const OPTIONS = [
    { id: 'redeem', icon: '🙋', label: { en: 'Ask the fund to give my money back', fr: 'Demander au fonds de me rembourser' },
      res: { en: '🚫 <b>Not possible.</b> A classic (closed-end) fund has no redemptions. The GP answers politely: “You’ll get your money as we sell companies.”', fr: '🚫 <b>Impossible.</b> Un fonds classique (fermé) ne prévoit pas de rachats. Le GP répond poliment : « Vous serez remboursé au fil des cessions. »' } },
    { id: 'secondary', icon: '🔁', label: { en: 'Sell my stake on the secondary market', fr: 'Vendre ma part sur le marché secondaire' },
      res: { en: '⚖️ <b>Possible, at a price.</b> A specialised buyer offers <b>85% of NAV</b>. It takes 2–4 months and needs the GP’s consent. You get cash, but you leave value on the table.', fr: '⚖️ <b>Possible, mais à un prix.</b> Un acheteur spécialisé propose <b>85 % de la VNI</b>. Cela prend 2 à 4 mois et nécessite l’accord du GP. Vous obtenez du cash, mais vous laissez de la valeur sur la table.' } },
    { id: 'liquid', icon: '🧠', label: { en: 'Use my other, liquid assets', fr: 'Utiliser mes autres actifs liquides' },
      res: { en: '🏆 <b>Best move.</b> That’s exactly why private assets should only hold money <b>you won’t need for many years</b>. Your liquid portfolio is your shock absorber.', fr: '🏆 <b>Le meilleur choix.</b> C’est précisément pour cela que les actifs privés ne doivent contenir que de l’argent <b>dont vous n’aurez pas besoin avant de nombreuses années</b>. Votre portefeuille liquide est votre amortisseur.' } },
  ];

  PA.chapters.push({
    id: 'vault', icon: '🔐',
    title: { en: 'The Time Vault', fr: 'Le coffre du temps' },
    tagline: { en: 'Your money is locked in. Can you get it out?', fr: 'Votre argent est sous clé. Pouvez-vous le récupérer ?' },
    mission: { en: 'Understand illiquidity: the long lock-up, why you can’t simply sell, and what an early exit costs.', fr: 'Comprendre l’illiquidité : un blocage long, pourquoi on ne peut pas simplement vendre, et le coût d’une sortie anticipée.' },
    steps: [
      // 1. Liquidity ladder
      () => {
        let nextIdx = 0;
        const root = PA.ui.render(`
          <div class="wide-col">
            ${PA.ui.guide(L({ en: 'Speed round! Tap these assets <b>from fastest to slowest</b> to turn into cash.', fr: 'Manche rapide ! Touchez ces actifs <b>du plus rapide au plus lent</b> à transformer en cash.' }))}
            <div class="ladder">${LADDER.map((_, i) => `<div class="rung" data-slot="${i}"><span class="rung-n">${i + 1}</span><span class="rung-body">·</span></div>`).join('')}</div>
            <div class="chips">${PA.shuffle(LADDER).map((x) => `<button class="chip-a" data-id="${x.id}">${x.icon} ${L(x.name)}</button>`).join('')}</div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        PA.$$('.chip-a', root).forEach((b) => b.addEventListener('click', () => {
          if (b.disabled) return;
          const exp = LADDER[nextIdx];
          if (b.dataset.id === exp.id) {
            b.disabled = true;
            b.classList.add('gone');
            const slot = PA.$(`[data-slot="${nextIdx}"]`, root);
            slot.classList.add('filled', 'pop');
            PA.$('.rung-body', slot).innerHTML = `${exp.icon} <b>${L(exp.name)}</b><em>${L(exp.time)}</em>`;
            PA.sfx.good();
            nextIdx++;
            if (nextIdx === LADDER.length) {
              PA.addXP(60, slot);
              PA.$('.chips', root).innerHTML = `<div class="feedback ok">${L({ en: '🔒 Private equity sits at the bottom: <b>the least liquid asset most investors will ever own</b>.', fr: '🔒 Le private equity est tout en bas : <b>l’actif le moins liquide que la plupart des investisseurs détiendront jamais</b>.' })}</div>`;
              PA.ui.enableNext(root);
            }
          } else {
            b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
            PA.sfx.bad();
          }
        }));
        PA.ui.bindNext(root);
      },

      // 2. Emergency event
      () => {
        const amt = PA.money(300000);
        const root = PA.ui.render(`
          <div class="wide-col">
            <div class="alert-banner">🚨 ${L({ en: 'RANDOM EVENT', fr: 'ÉVÉNEMENT SURPRISE' })}</div>
            ${PA.ui.guide(L({
              en: 'Year 3 of your fund. Your dream chalet in the mountains comes up for sale, and you need <b>{amt}</b> within a month. Your PE stake is worth more than that on paper… What do you do? <b>Try every option.</b>',
              fr: 'Année 3 de votre fonds. Le chalet de vos rêves à la montagne est en vente, et il vous faut <b>{amt}</b> d’ici un mois. Votre part de private equity vaut plus que cela sur le papier… Que faites-vous ? <b>Essayez chaque option.</b>',
            }, { amt }))}
            <div class="doors">${OPTIONS.map((o) => `<button class="door" data-o="${o.id}"><span class="door-ic">${o.icon}</span><span class="door-lbl">${L(o.label)}</span><span class="door-res"></span></button>`).join('')}</div>
            <div class="vault-viz">
              <div class="vault-door"><div class="vault-wheel"></div></div>
              <div class="vault-txt">${L({ en: 'Vault opens in', fr: 'Ouverture du coffre dans' })} <b>~7 ${L({ en: 'years', fr: 'ans' })}</b></div>
            </div>
            ${PA.ui.cont('', 'disabled')}
          </div>`);
        const mark = PA.ui.trackAll(root, '.door', () => PA.ui.enableNext(root));
        PA.$$('.door', root).forEach((el) => el.addEventListener('click', () => {
          if (el.classList.contains('open')) return;
          const o = OPTIONS.find((x) => x.id === el.dataset.o);
          el.classList.add('open', o.id === 'liquid' ? 'win' : o.id === 'redeem' ? 'lose' : 'meh');
          PA.$('.door-res', el).innerHTML = L(o.res);
          if (o.id === 'liquid') { PA.sfx.good(); PA.addXP(40, el); } else PA.sfx.flip();
          mark(el);
        }));
        PA.ui.bindNext(root);
      },

      // 3. Insights
      PA.step.insight([
        { id: 'liq-lock', icon: '🔒', title: { en: 'Illiquidity is the price of admission', fr: 'L’illiquidité est le prix d’entrée' }, body: { en: 'In a classic fund your money is committed for <b>10 years or more</b>. You can’t redeem, and the timing of your cash back is decided by the manager.', fr: 'Dans un fonds classique, votre argent est engagé pour <b>10 ans ou plus</b>. Vous ne pouvez pas demander le remboursement, et le calendrier des retours est décidé par le gérant.' } },
        { id: 'liq-prem', icon: '🎁', title: { en: 'Why accept it? The illiquidity premium', fr: 'Pourquoi l’accepter ? La prime d’illiquidité' }, body: { en: 'Investors expect to be <b>paid for patience</b>: access to companies and returns not available on the stock market. It’s an expectation, <b>never a guarantee</b>.', fr: 'Les investisseurs attendent d’être <b>rémunérés pour leur patience</b> : accès à des entreprises et des rendements introuvables en bourse. C’est une attente, <b>jamais une garantie</b>.' } },
        { id: 'liq-rule', explorer: true, icon: '🧳', title: { en: 'The golden rule', fr: 'La règle d’or' }, body: { en: 'Only invest money you <b>won’t need for a decade</b>, and keep enough liquid assets for life’s surprises and for capital calls.', fr: 'N’investissez que l’argent dont vous <b>n’aurez pas besoin pendant une décennie</b>, et gardez assez d’actifs liquides pour les imprévus de la vie et les appels de fonds.' } },
        { id: 'liq-sec', pro: true, icon: '🔁', title: { en: 'The secondary market', fr: 'Le marché secondaire' }, body: { en: 'Over <b>US$150bn</b> of fund stakes changed hands in 2024. <b>LP-led</b>: investors sell fund stakes, typically for ~85–95% of NAV in buyout and deeper discounts for venture or older funds. <b>GP-led</b>: managers move prized assets into <b>continuation vehicles</b>, which raises conflict-of-interest questions LPs must assess. The buyer also takes over unfunded commitments.', fr: 'Plus de <b>150 milliards de dollars</b> de parts de fonds ont changé de mains en 2024. <b>Opérations LP-led</b> : des investisseurs cèdent leurs parts, typiquement autour de 85–95 % de la VNI en LBO, avec des décotes plus fortes en capital-risque ou pour les fonds anciens. <b>Opérations GP-led</b> : les gérants transfèrent leurs meilleurs actifs dans des <b>fonds de continuation</b>, ce qui soulève des questions de conflits d’intérêts. L’acheteur reprend aussi les engagements non appelés.' } },
      ]),

      // 4. Challenge
      PA.step.challenge({
        explorer: {
          q: { en: 'What is true about a classic (closed-end) private equity fund?', fr: 'Qu’est-ce qui est vrai pour un fonds de private equity classique (fermé) ?' },
          options: [
            { en: 'My money is typically committed for 10+ years; an early exit, if possible at all, is usually at a discount', fr: 'Mon argent est en général engagé pour plus de 10 ans ; une sortie anticipée, si elle est possible, se fait généralement avec une décote' },
            { en: 'I can redeem my shares every month at their value', fr: 'Je peux racheter mes parts chaque mois à leur valeur' },
            { en: 'The bank guarantees I can get my capital back at any time', fr: 'La banque garantit que je peux récupérer mon capital à tout moment' },
          ],
          answer: 0,
          explain: { en: 'Illiquidity is a core feature of private assets. Plan your liquidity before you invest.', fr: 'L’illiquidité est une caractéristique centrale des actifs privés. Planifiez votre liquidité avant d’investir.' },
          hint: { en: 'Remember the vault and the chalet.', fr: 'Souvenez-vous du coffre et du chalet.' },
        },
        pro: {
          q: { en: 'Why would a secondary buyer typically pay less than NAV for an LP stake?', fr: 'Pourquoi un acheteur secondaire paie-t-il généralement moins que la VNI pour une part de LP ?' },
          options: [
            { en: 'To be paid for illiquidity, uncertainty around a lagged NAV, and taking over unfunded commitments', fr: 'Pour être rémunéré de l’illiquidité, de l’incertitude d’une VNI décalée et de la reprise des engagements non appelés' },
            { en: 'Because regulators cap secondary prices at 90% of NAV', fr: 'Parce que les régulateurs plafonnent les prix secondaires à 90 % de la VNI' },
            { en: 'Because NAV already includes the carried interest twice', fr: 'Parce que la VNI inclut déjà deux fois le carried interest' },
          ],
          answer: 0,
          explain: { en: 'Pricing reflects market conditions, strategy, fund age and the funded/unfunded mix. In strong markets, quality buyout stakes can trade near or above NAV.', fr: 'Le prix dépend du marché, de la stratégie, de l’âge du fonds et de la part non appelée. En marché porteur, de bonnes parts de LBO peuvent s’échanger proches de la VNI, voire au-dessus.' },
        },
      }),
    ],
  });
})();
