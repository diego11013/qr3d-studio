/**
 * Soporte internacionalización ES / EN
 */
let currentLang = 'es';
const translations = {
  es: { title: "Generador de Códigos QR para Impresión 3D", download3mf: "Descargar .3MF", downloadStl: "Descargar .STL" },
  en: { title: "3D Printable QR Code Generator", download3mf: "Download .3MF", downloadStl: "Download .STL" }
};

function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  document.getElementById('langSwitchBtn').textContent = currentLang === 'es' ? '🇺🇸 English' : '🇪🇸 Español';
}
