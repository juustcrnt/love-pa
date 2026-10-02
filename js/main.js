/* Boot */
(() => {
  'use strict';
  const PA = window.PA;
  const foot = document.getElementById('foot');
  const baseUpdate = PA.hud.update;
  PA.hud.update = () => {
    baseUpdate();
    foot.textContent = PA.L(PA.S.disclaimer);
  };
  PA.starfield();
  PA.hud.init();
  PA.buildFlow();
  PA.go(0);

  // Facilitator shortcuts (banker): Esc closes overlays, M opens the console.
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'text') return;
    if (e.key === 'Escape') PA.overlay.close();
    if (e.key === 'm' || e.key === 'M') PA.overlay.menu();
  });
})();
