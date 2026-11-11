'use strict';
// Configurar únicamente después de aprobar el aviso de privacidad.
const GA4_ID = '';
(() => {
  if (!/^G-[A-Z0-9]+$/.test(GA4_ID)) return;
  const key = 'crj-analytics-consent';
  let choice;
  try { choice = localStorage.getItem(key); } catch { /* decisión por visita */ }
  function enable() {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    gtag('js', new Date());
    gtag('config', GA4_ID, {cookie_domain:location.hostname, cookie_path:new URL('.', location.href).pathname, allow_google_signals:false, allow_ad_personalization_signals:false, page_location:location.origin + location.pathname});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.append(script);
  }
  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'clear-button';
  preferences.textContent = 'Preferencias de analítica';
  (document.querySelector('.footer-bottom') || document.body).append(preferences);
  const panel = document.createElement('section');
  panel.className = 'notice';
  panel.setAttribute('aria-label', 'Cookies de analítica');
  const copy = document.createElement('p');
  copy.textContent = '¿Permites usar Google Analytics para medir las visitas al catálogo? Puedes cambiar tu elección en el pie de página.';
  panel.append(copy);
  for (const [value, label] of [['denied','Rechazar'], ['granted','Aceptar']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.onclick = () => {
      const previous = choice;
      choice = value;
      try { localStorage.setItem(key, value); } catch { /* decisión por visita */ }
      panel.hidden = true;
      preferences.focus();
      if (value === 'granted' && previous !== value) enable();
      if (value === 'denied' && previous === 'granted') {
        window['ga-disable-' + GA4_ID] = true;
        const path = new URL('.', location.href).pathname;
        for (const name of ['_ga', '_ga_' + GA4_ID.slice(2)]) {
          for (const domain of ['', '; Domain=' + location.hostname]) document.cookie = name + '=; Max-Age=0; Path=' + path + domain;
        }
        location.reload();
      }
    };
    panel.append(button);
  }
  document.body.prepend(panel);
  panel.hidden = ['granted','denied'].includes(choice);
  preferences.onclick = () => { panel.hidden = false; panel.querySelector('button').focus(); };
  if (choice === 'granted') enable();
})();
