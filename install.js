(() => {
  'use strict';
  const dialog = document.querySelector('#install-dialog');
  const controls = [...document.querySelectorAll('[data-install]')];
  const nativeButton = document.querySelector('#native-install');
  const status = document.querySelector('#install-message');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let promptEvent = null;
  let installed = standalone.matches || navigator.standalone === true;

  function render() {
    controls.forEach(control => {
      control.textContent = installed ? 'App instalada' : 'Instalar app';
      control.disabled = installed;
    });
    nativeButton.hidden = !promptEvent || installed;
    status.textContent = installed
      ? 'CRJ Muebles ya está instalada. Puedes abrirla desde tus aplicaciones.'
      : promptEvent
        ? 'Tu navegador permite instalar CRJ Muebles. Confirma la instalación para añadirla a tus aplicaciones.'
        : 'Si tu navegador ofrece la opción de instalar, puedes añadir CRJ Muebles a tus aplicaciones. Aquí te indicamos cómo.';
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
    render();
  });
  window.addEventListener('appinstalled', () => { installed = true; promptEvent = null; render(); });
  standalone.addEventListener('change', event => { installed = event.matches || navigator.standalone === true; render(); });

  async function install() {
    if (!promptEvent) return;
    const pending = promptEvent;
    promptEvent = null;
    nativeButton.disabled = true;
    try {
      await pending.prompt();
      const choice = await pending.userChoice;
      render();
      // Only appinstalled/display-mode confirms installation, not a clicked button.
      if (!installed) status.textContent = choice.outcome === 'accepted'
        ? 'Solicitud aceptada. El navegador está completando la instalación.'
        : 'Instalación cancelada. Puedes seguir explorando el catálogo y volver a instalar desde el menú de tu navegador.';
    } catch {
      render();
      status.textContent = 'No se pudo abrir el instalador. Prueba desde el menú de tu navegador siguiendo los pasos de abajo.';
    } finally { nativeButton.disabled = false; }
  }
  controls.forEach(control => control.addEventListener('click', () => {
    render();
    if (!dialog.open) dialog.showModal();
    if (promptEvent) install();
  }));
  nativeButton.addEventListener('click', install);
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  const address = document.querySelector('#install-url');
  address.value = new URL('index.html', location.href).href;
  document.querySelector('#copy-install-url').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(address.value); document.querySelector('#copy-status').textContent = 'Enlace copiado.'; }
    catch { address.focus(); address.select(); document.querySelector('#copy-status').textContent = 'Selecciona y copia esta dirección para abrirla en tu navegador.'; }
  });
  document.querySelector('#local-install-note').hidden = !['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname);
  render();
})();
