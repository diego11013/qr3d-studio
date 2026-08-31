/**
 * QR3D Studio - Real-time Optical Contrast Checker (WCAG 2.1 Formula)
 * Evaluates the readability of the QR code for smartphone cameras.
 */
(function(window) {
  'use strict';

  function hexToRgb(hex) {
    let clean = (hex || '#FFFFFF').replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return [
      (num >> 16) & 255,
      (num >> 8) & 255,
      num & 255
    ];
  }

  function getLuminance(rgb) {
    const a = rgb.map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(hex1, hex2) {
    const lum1 = getLuminance(hexToRgb(hex1));
    const lum2 = getLuminance(hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  const ContrastChecker = {
    checkContrast: function(baseHex, reliefHex) {
      const ratio = getContrastRatio(baseHex, reliefHex);
      const isReadable = ratio >= 3.0; // Minimum threshold for optical QR scanners
      const isOptimal = ratio >= 4.5;

      return {
        ratio: Math.round(ratio * 10) / 10,
        isReadable: isReadable,
        isOptimal: isOptimal,
        status: isOptimal ? 'optimal' : (isReadable ? 'acceptable' : 'warning')
      };
    },

    updateUI: function(badgeEl, baseHex, reliefHex) {
      if (!badgeEl) return;
      const result = this.checkContrast(baseHex, reliefHex);

      badgeEl.className = 'contrast-badge ' + result.status;
      if (result.isOptimal) {
        badgeEl.innerHTML = `<span class="contrast-icon">✓</span> <span data-i18n="contrast.optimal">${window.i18n ? window.i18n.t('contrast.optimal') : 'Contraste óptimo para escaneo con smartphone'}</span> <span class="contrast-ratio">(${result.ratio}:1)</span>`;
      } else if (result.isReadable) {
        badgeEl.innerHTML = `<span class="contrast-icon">ℹ️</span> <span>Contraste aceptable (${result.ratio}:1)</span>`;
      } else {
        badgeEl.innerHTML = `<span class="contrast-icon">⚠️</span> <span data-i18n="contrast.warning">${window.i18n ? window.i18n.t('contrast.warning') : 'Bajo contraste: La combinación elegida podría dificultar el escaneo óptico.'}</span> <span class="contrast-ratio">(${result.ratio}:1)</span>`;
      }
    }
  };

  window.ContrastChecker = ContrastChecker;
})(window);
