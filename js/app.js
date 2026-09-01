/**
 * QR3D Studio - Main Application Controller
 * Coordinates UI inputs, Top/Bottom Multi-line Text, Text Size Scale,
 * 1-Click Quick Presets, Real-time Optical Contrast Checker,
 * Dimension Sliders, i18n Language Toggle, 3D/2D Mesh Construction, Instant Downloads,
 * and Legal Modals.
 */
(function() {
  'use strict';

  // Application State
  const state = {
    text: 'https://ejemplo.com/menu',
    objectFormat: 'stand', // 'stand', 'keychain', 'plaque', 'magnetic', 'countersunk'
    magnetSize: '6x2', // '6x2', '10x2'
    baseColor: '#FFFFFF',
    reliefColor: '#111827',
    moduleShape: 'square', // 'square', 'rounded', 'dots'
    centerEmoji: '🍽️',
    topText: '',
    bottomText: 'MENU DIGITAL',
    textScale: 1.0, // 0.5 to 1.5
    baseThickness: 2.4,
    reliefHeight: 1.4,
    currentModelData: null
  };

  let viewer = null;
  let qrMatrixObj = null;

  // DOM Elements
  const el = {
    langSwitchBtn: document.getElementById('langSwitchBtn'),
    presetBtns: document.querySelectorAll('.quick-preset-btn'),

    qrInput: document.getElementById('qrInput'),
    wifiHelperBtn: document.getElementById('wifiHelperBtn'),
    wifiModal: document.getElementById('wifiModal'),
    wifiSsid: document.getElementById('wifiSsid'),
    wifiPass: document.getElementById('wifiPass'),
    wifiType: document.getElementById('wifiType'),
    applyWifiBtn: document.getElementById('applyWifiBtn'),
    closeWifiBtn: document.getElementById('closeWifiBtn'),

    formatBtns: document.querySelectorAll('.format-card'),
    magnetSizeGroup: document.getElementById('magnetSizeGroup'),
    magnetSizeBtns: document.querySelectorAll('.magnet-size-btn'),

    baseColorInput: document.getElementById('baseColorInput'),
    baseColorHex: document.getElementById('baseColorHex'),
    reliefColorInput: document.getElementById('reliefColorInput'),
    reliefColorHex: document.getElementById('reliefColorHex'),
    colorPresets: document.querySelectorAll('.color-preset-btn'),
    contrastBadge: document.getElementById('contrastBadge'),

    shapeBtns: document.querySelectorAll('.shape-btn'),
    emblemBtns: document.querySelectorAll('.emblem-btn'),
    customEmojiInput: document.getElementById('customEmojiInput'),
    clearEmojiBtn: document.getElementById('clearEmojiBtn'),

    baseThickSlider: document.getElementById('baseThickSlider'),
    baseThickVal: document.getElementById('baseThickVal'),
    reliefHeightSlider: document.getElementById('reliefHeightSlider'),
    reliefHeightVal: document.getElementById('reliefHeightVal'),

    // Top & Bottom Text Controls
    topTextInput: document.getElementById('topTextInput'),
    bottomTextInput: document.getElementById('bottomTextInput'),
    textSizeSlider: document.getElementById('textSizeSlider'),
    textSizeVal: document.getElementById('textSizeVal'),

    canvas3d: document.getElementById('qrCanvas3d'),
    canvas2dFull: document.getElementById('qrCanvas2dFull'),
    reset3dBtn: document.getElementById('reset3dBtn'),
    dimsBadge: document.getElementById('dimsBadge'),

    // Viewport Floating Controls
    btnAutoRotate: document.getElementById('btnAutoRotate'),
    btnRotateLeft: document.getElementById('btnRotateLeft'),
    btnRotateRight: document.getElementById('btnRotateRight'),
    btnTiltUp: document.getElementById('btnTiltUp'),
    btnTiltDown: document.getElementById('btnTiltDown'),
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),

    // Zoom Slider & Step Buttons
    zoomSlider: document.getElementById('zoomSlider'),
    btnZoomOutSlider: document.getElementById('btnZoomOutSlider'),
    btnZoomInSlider: document.getElementById('btnZoomInSlider'),

    // Download Buttons
    btnDownload3MF: document.getElementById('btnDownload3MF'),
    btnDownloadSTL: document.getElementById('btnDownloadSTL'),
    btnDownloadPNG2D: document.getElementById('btnDownloadPNG2D'),
    btnDownloadSVG2D: document.getElementById('btnDownloadSVG2D'),
    downloadToast: document.getElementById('downloadToast'),

    // Legal Modals
    termsModal: document.getElementById('termsModal'),
    contactModal: document.getElementById('contactModal'),
    openTermsBtn: document.getElementById('openTermsBtn'),
    openContactBtn: document.getElementById('openContactBtn'),
    closeTermsBtn: document.getElementById('closeTermsBtn'),
    closeContactBtn: document.getElementById('closeContactBtn')
  };

  function init() {
    // 1. Initialize i18n
    if (window.i18n) {
      window.i18n.setLanguage(window.i18n.getLanguage());
    }

    // 2. Initialize 3D Viewer
    viewer = new window.QR3DViewer('qrCanvas3d');

    // Sync Zoom slider with viewer changes
    viewer.onZoomChange = function(distance) {
      if (el.zoomSlider) {
        el.zoomSlider.value = Math.round(distance);
      }
    };

    bindEvents();
    updateAll();
  }

  function bindEvents() {
    // Language Switcher
    if (el.langSwitchBtn && window.i18n) {
      el.langSwitchBtn.addEventListener('click', () => {
        window.i18n.toggleLanguage();
        updateContrastUI();
      });
    }

    // 1-Click Quick Presets
    el.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const preset = btn.dataset.preset;
        if (preset === 'menu') {
          state.text = 'https://ejemplo.com/menu';
          state.objectFormat = 'stand';
          state.centerEmoji = '🍽️';
          state.topText = '';
          state.bottomText = 'MENU DIGITAL';
          state.textScale = 1.0;
          state.baseColor = '#FFFFFF';
          state.reliefColor = '#111827';
        } else if (preset === 'reviews') {
          state.text = 'https://g.page/r/tu-negocio/review';
          state.objectFormat = 'stand';
          state.centerEmoji = '⭐';
          state.topText = 'ESCANÉAME';
          state.bottomText = 'VALORANOS EN GOOGLE';
          state.textScale = 1.0;
          state.baseColor = '#FFFFFF';
          state.reliefColor = '#0071E3';
        } else if (preset === 'wifi') {
          state.text = 'WIFI:S:WiFi_Huespedes;T:WPA;P:clave123;;';
          state.objectFormat = 'plaque';
          state.centerEmoji = '📶';
          state.topText = 'CONÉCTATE AL WIFI';
          state.bottomText = 'WIFI CLIENTES';
          state.textScale = 1.0;
          state.baseColor = '#161B22';
          state.reliefColor = '#2997FF';
        } else if (preset === 'instagram') {
          state.text = 'https://instagram.com/tu_cuenta';
          state.objectFormat = 'keychain';
          state.centerEmoji = '📷';
          state.topText = '';
          state.bottomText = 'SÍGUENOS';
          state.textScale = 1.0;
          state.baseColor = '#111827';
          state.reliefColor = '#F59E0B';
        } else if (preset === 'magnet') {
          state.text = 'https://ejemplo.com';
          state.objectFormat = 'magnetic';
          state.centerEmoji = '⭐';
          state.topText = '';
          state.bottomText = 'ESCANEA AQUI';
          state.textScale = 1.0;
          state.baseColor = '#FFFFFF';
          state.reliefColor = '#111827';
        }

        // Sync UI inputs with state
        el.qrInput.value = state.text;
        if (el.topTextInput) el.topTextInput.value = state.topText;
        el.bottomTextInput.value = state.bottomText;
        if (el.textSizeSlider) {
          el.textSizeSlider.value = Math.round(state.textScale * 100);
          if (el.textSizeVal) el.textSizeVal.textContent = Math.round(state.textScale * 100) + '%';
        }
        el.baseColorInput.value = state.baseColor;
        el.baseColorHex.textContent = state.baseColor.toUpperCase();
        el.reliefColorInput.value = state.reliefColor;
        el.reliefColorHex.textContent = state.reliefColor.toUpperCase();

        // Sync format cards
        el.formatBtns.forEach(f => {
          f.classList.toggle('active', f.dataset.format === state.objectFormat);
        });
        updateMagnetGroupVisibility();

        // Sync emblem buttons
        el.emblemBtns.forEach(e => {
          e.classList.toggle('active', e.dataset.emoji === state.centerEmoji);
        });

        updateAll();
      });
    });

    // Input text
    el.qrInput.addEventListener('input', e => {
      state.text = e.target.value.trim() || 'https://ejemplo.com';
      updateAll();
    });

    // WiFi Helper Modal
    if (el.wifiHelperBtn) {
      el.wifiHelperBtn.addEventListener('click', () => {
        el.wifiModal.classList.add('active');
      });
      el.closeWifiBtn.addEventListener('click', () => {
        el.wifiModal.classList.remove('active');
      });
      el.applyWifiBtn.addEventListener('click', () => {
        const ssid = el.wifiSsid.value.trim() || 'WiFi';
        const pass = el.wifiPass.value;
        const type = el.wifiType.value;
        const wifiString = `WIFI:S:${ssid};T:${type};P:${pass};;`;
        el.qrInput.value = wifiString;
        state.text = wifiString;
        state.topText = 'CONÉCTATE AL WIFI';
        state.bottomText = 'RED: ' + ssid.toUpperCase();
        if (el.topTextInput) el.topTextInput.value = state.topText;
        el.bottomTextInput.value = state.bottomText;
        state.centerEmoji = '📶';
        el.emblemBtns.forEach(b => b.classList.toggle('active', b.dataset.emoji === '📶'));
        el.wifiModal.classList.remove('active');
        updateAll();
      });
    }

    // Format selection
    el.formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.objectFormat = btn.dataset.format;
        updateMagnetGroupVisibility();
        update3D();
      });
    });

    // Magnet size selection
    el.magnetSizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.magnetSizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.magnetSize = btn.dataset.size;
        update3D();
      });
    });

    // Colors
    el.baseColorInput.addEventListener('input', e => {
      state.baseColor = e.target.value;
      el.baseColorHex.textContent = e.target.value.toUpperCase();
      updateVisuals();
    });
    el.reliefColorInput.addEventListener('input', e => {
      state.reliefColor = e.target.value;
      el.reliefColorHex.textContent = e.target.value.toUpperCase();
      updateVisuals();
    });

    // Color Presets
    el.colorPresets.forEach(preset => {
      preset.addEventListener('click', () => {
        state.baseColor = preset.dataset.base;
        state.reliefColor = preset.dataset.relief;
        el.baseColorInput.value = state.baseColor;
        el.baseColorHex.textContent = state.baseColor.toUpperCase();
        el.reliefColorInput.value = state.reliefColor;
        el.reliefColorHex.textContent = state.reliefColor.toUpperCase();
        updateVisuals();
      });
    });

    // Module Shapes (Square, Rounded, Dots)
    el.shapeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.shapeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.moduleShape = btn.dataset.shape;
        updateAll();
      });
    });

    // Center Emblem Buttons
    el.emblemBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.emblemBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.centerEmoji = btn.dataset.emoji;
        el.customEmojiInput.value = '';
        updateAll();
      });
    });

    el.customEmojiInput.addEventListener('input', e => {
      const val = e.target.value.trim();
      el.emblemBtns.forEach(b => b.classList.remove('active'));
      state.centerEmoji = val;
      updateAll();
    });

    el.clearEmojiBtn.addEventListener('click', () => {
      el.emblemBtns.forEach(b => b.classList.remove('active'));
      el.customEmojiInput.value = '';
      state.centerEmoji = '';
      updateAll();
    });

    // Thickness Sliders
    if (el.baseThickSlider) {
      el.baseThickSlider.addEventListener('input', e => {
        state.baseThickness = parseFloat(e.target.value);
        if (el.baseThickVal) el.baseThickVal.textContent = state.baseThickness.toFixed(1) + ' mm';
        update3D();
      });
    }
    if (el.reliefHeightSlider) {
      el.reliefHeightSlider.addEventListener('input', e => {
        state.reliefHeight = parseFloat(e.target.value);
        if (el.reliefHeightVal) el.reliefHeightVal.textContent = state.reliefHeight.toFixed(1) + ' mm';
        update3D();
      });
    }

    // Top & Bottom Text Inputs
    if (el.topTextInput) {
      el.topTextInput.addEventListener('input', e => {
        state.topText = e.target.value;
        update3D();
      });
    }
    if (el.bottomTextInput) {
      el.bottomTextInput.addEventListener('input', e => {
        state.bottomText = e.target.value;
        update3D();
      });
    }

    // Font Size Scale Slider
    if (el.textSizeSlider) {
      el.textSizeSlider.addEventListener('input', e => {
        const percent = parseInt(e.target.value, 10);
        state.textScale = percent / 100;
        if (el.textSizeVal) el.textSizeVal.textContent = percent + '%';
        update3D();
      });
    }

    // 3D Viewport Controls
    if (el.reset3dBtn) {
      el.reset3dBtn.addEventListener('click', () => {
        viewer.resetView();
        if (el.zoomSlider) el.zoomSlider.value = viewer.distance;
      });
    }

    if (el.btnAutoRotate) {
      el.btnAutoRotate.addEventListener('click', () => {
        const isAuto = viewer.toggleAutoRotate();
        el.btnAutoRotate.classList.toggle('active', isAuto);
      });
    }

    if (el.btnRotateLeft) {
      el.btnRotateLeft.addEventListener('click', () => viewer.rotateBy(-0.25, 0));
    }
    if (el.btnRotateRight) {
      el.btnRotateRight.addEventListener('click', () => viewer.rotateBy(0.25, 0));
    }
    if (el.btnTiltUp) {
      el.btnTiltUp.addEventListener('click', () => viewer.rotateBy(0, -0.18));
    }
    if (el.btnTiltDown) {
      el.btnTiltDown.addEventListener('click', () => viewer.rotateBy(0, 0.18));
    }
    if (el.btnZoomIn) {
      el.btnZoomIn.addEventListener('click', () => viewer.zoomBy(-35));
    }
    if (el.btnZoomOut) {
      el.btnZoomOut.addEventListener('click', () => viewer.zoomBy(35));
    }

    // Zoom Slider & Step Buttons
    if (el.zoomSlider) {
      el.zoomSlider.addEventListener('input', e => {
        viewer.setDistance(parseFloat(e.target.value));
      });
    }
    if (el.btnZoomOutSlider) {
      el.btnZoomOutSlider.addEventListener('click', () => viewer.zoomBy(35));
    }
    if (el.btnZoomInSlider) {
      el.btnZoomInSlider.addEventListener('click', () => viewer.zoomBy(-35));
    }

    
    // Hero CTA Smooth Scroll
    const heroCtaBtn = document.getElementById('heroCtaBtn');
    if (heroCtaBtn) {
      heroCtaBtn.addEventListener('click', () => {
        const target = document.getElementById('studioConfigurator');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Inspiration Gallery Cards (1-Click Auto Load)
    document.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const design = card.dataset.design;
        if (design === 'menu-steel') {
          state.text = 'https://tu-restaurante.com/menu';
          state.objectFormat = 'stand';
          state.centerEmoji = '🍽️';
          state.topText = 'ESCANÉAME';
          state.bottomText = 'MENÚ DIGITAL\nRESTAURANTE';
          state.baseColor = '#D1D5DB';
          state.reliefColor = '#1F2937';
          state.moduleShape = 'rounded';
        } else if (design === 'google-reviews') {
          state.text = 'https://g.page/r/tu-negocio/review';
          state.objectFormat = 'plaque';
          state.centerEmoji = '⭐';
          state.topText = 'VALÓRANOS';
          state.bottomText = '5 ESTRELLAS EN GOOGLE\n★ ★ ★ ★ ★';
          state.baseColor = '#FFFFFF';
          state.reliefColor = '#0071E3';
          state.moduleShape = 'rounded';
        } else if (design === 'keychain-gold') {
          state.text = 'https://instagram.com/tu_cuenta';
          state.objectFormat = 'keychain';
          state.centerEmoji = '📷';
          state.topText = 'SÍGUENOS';
          state.bottomText = 'EN INSTAGRAM';
          state.baseColor = '#111827';
          state.reliefColor = '#F59E0B';
          state.moduleShape = 'square';
        } else if (design === 'wifi-magnetic') {
          state.text = 'WIFI:S:WiFi_Huespedes;T:WPA;P:clave2026;;';
          state.objectFormat = 'magnetic';
          state.centerEmoji = '📶';
          state.topText = 'CONÉCTATE AL WIFI';
          state.bottomText = 'RED: HUESPEDES_5G';
          state.baseColor = '#1E293B';
          state.reliefColor = '#2997FF';
          state.moduleShape = 'rounded';
        }

        // Sync inputs
        el.qrInput.value = state.text;
        if (el.topTextInput) el.topTextInput.value = state.topText;
        if (el.bottomTextInput) el.bottomTextInput.value = state.bottomText;
        el.baseColorInput.value = state.baseColor;
        el.baseColorHex.textContent = state.baseColor.toUpperCase();
        el.reliefColorInput.value = state.reliefColor;
        el.reliefColorHex.textContent = state.reliefColor.toUpperCase();

        el.formatBtns.forEach(f => f.classList.toggle('active', f.dataset.format === state.objectFormat));
        el.emblemBtns.forEach(e => e.classList.toggle('active', e.dataset.emoji === state.centerEmoji));
        el.shapeBtns.forEach(s => s.classList.toggle('active', s.dataset.shape === state.moduleShape));

        updateAll();

        const target = document.getElementById('studioConfigurator');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Viral Share & Snapshot Modal
    const btnShareSnapshot = document.getElementById('btnShareSnapshot');
    const shareModal = document.getElementById('shareModal');
    const closeShareBtn = document.getElementById('closeShareBtn');
    const shareImgPreview = document.getElementById('shareImgPreview');
    const btnDownloadSnapshotImg = document.getElementById('btnDownloadSnapshotImg');
    let currentSnapshotBlob = null;

    if (btnShareSnapshot && shareModal) {
      btnShareSnapshot.addEventListener('click', () => {
        viewer.captureSnapshot(blob => {
          currentSnapshotBlob = blob;
          if (shareImgPreview && blob) {
            shareImgPreview.src = URL.createObjectURL(blob);
          }
          shareModal.classList.add('active');
        });
      });

      if (closeShareBtn) {
        closeShareBtn.addEventListener('click', () => shareModal.classList.remove('active'));
      }
      shareModal.addEventListener('click', e => {
        if (e.target === shareModal) shareModal.classList.remove('active');
      });

      if (btnDownloadSnapshotImg) {
        btnDownloadSnapshotImg.addEventListener('click', () => {
          if (currentSnapshotBlob) {
            saveBlob(currentSnapshotBlob, 'qr3d_render_snapshot.png');
          }
        });
      }

      // Social Share Links
      const btnShareReddit = document.getElementById('btnShareReddit');
      const btnShareX = document.getElementById('btnShareX');
      const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');

      if (btnShareReddit) {
        btnShareReddit.addEventListener('click', e => {
          e.preventDefault();
          window.open('https://www.reddit.com/r/3Dprinting/submit?title=Custom%203D%20Printed%20QR%20Design%20(3MF%20Multicolor)&url=https://qr3dstudio.online', '_blank');
        });
      }
      if (btnShareX) {
        btnShareX.addEventListener('click', e => {
          e.preventDefault();
          window.open('https://twitter.com/intent/tweet?text=Generador%20de%20C%C3%B3digos%20QR%20para%20Impresi%C3%B3n%203D%20Multicolor%20(.3MF%20y%20.STL)%20gratis%20en%20el%20navegador:%20https://qr3dstudio.online', '_blank');
        });
      }
      if (btnShareWhatsApp) {
        btnShareWhatsApp.addEventListener('click', e => {
          e.preventDefault();
          window.open('https://api.whatsapp.com/send?text=Mira%20este%20generador%20de%20c%C3%B3digos%20QR%20para%20impresi%C3%B3n%203D%20multicolor:%20https://qr3dstudio.online', '_blank');
        });
      }
    }

    // Direct 1-Click Instant Downloads (Zero-Friction)
    el.btnDownload3MF.addEventListener('click', () => executeDirectDownload('3mf'));
    el.btnDownloadSTL.addEventListener('click', () => executeDirectDownload('stl'));
    if (el.btnDownloadPNG2D) {
      el.btnDownloadPNG2D.addEventListener('click', () => executeDirectDownload('png'));
    }
    if (el.btnDownloadSVG2D) {
      el.btnDownloadSVG2D.addEventListener('click', () => executeDirectDownload('svg'));
    }

    // Legal Modals
    setupModal(el.openTermsBtn, el.termsModal, el.closeTermsBtn);
    setupModal(el.openContactBtn, el.contactModal, el.closeContactBtn);

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
      });
    });
  }

  function updateMagnetGroupVisibility() {
    if (el.magnetSizeGroup) {
      el.magnetSizeGroup.style.display = (state.objectFormat === 'magnetic') ? 'block' : 'none';
    }
  }

  function setupModal(openBtn, modalEl, closeBtn) {
    if (!openBtn || !modalEl) return;
    openBtn.addEventListener('click', e => {
      e.preventDefault();
      modalEl.classList.add('active');
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modalEl.classList.remove('active');
      });
    }
    modalEl.addEventListener('click', e => {
      if (e.target === modalEl) modalEl.classList.remove('active');
    });
  }

  function updateAll() {
    // 1. Generate QR matrix
    qrMatrixObj = window.QRGenerator.generateMatrix(state.text, state.centerEmoji ? 'H' : 'Q');

    // 2. Render Full-Size 2D Canvas
    render2DCanvas();

    // 3. Update Optical Contrast UI
    updateContrastUI();

    // 4. Build & Render 3D Model
    update3D();
  }

  function updateContrastUI() {
    if (window.ContrastChecker && el.contrastBadge) {
      window.ContrastChecker.updateUI(el.contrastBadge, state.baseColor, state.reliefColor);
    }
  }

  function render2DCanvas() {
    if (el.canvas2dFull) {
      window.QRGenerator.renderCanvas(el.canvas2dFull, {
        matrixObj: qrMatrixObj,
        bgColor: state.baseColor,
        fgColor: state.reliefColor,
        shape: state.moduleShape,
        centerEmoji: state.centerEmoji,
        canvasSize: 512
      });
    }
  }

  function updateVisuals() {
    render2DCanvas();
    updateContrastUI();

    if (state.currentModelData) {
      viewer.updateModel(state.currentModelData, {
        baseColor: state.baseColor,
        reliefColor: state.reliefColor
      });
    }
  }

  function update3D() {
    const modelData = window.GeometryBuilder.build3DModel({
      objectFormat: state.objectFormat,
      magnetSize: state.magnetSize,
      matrixObj: qrMatrixObj,
      baseThickness: state.baseThickness,
      reliefHeight: state.reliefHeight,
      moduleShape: state.moduleShape,
      centerEmoji: state.centerEmoji,
      topText: state.topText,
      bottomText: state.bottomText,
      textScale: state.textScale
    });

    state.currentModelData = modelData;

    const d = modelData.dimensions;
    el.dimsBadge.textContent = `${d.width} × ${d.height} × ${d.totalZ.toFixed(1)} mm`;

    viewer.updateModel(modelData, {
      baseColor: state.baseColor,
      reliefColor: state.reliefColor
    });

    if (el.zoomSlider) {
      el.zoomSlider.value = Math.round(viewer.distance);
    }
  }

  /**
   * Direct 1-Click Instant Download Execution
   */
  function executeDirectDownload(type) {
    const textLabel = (state.bottomText || state.topText || 'QR3D').split('\n')[0];
    const cleanName = textLabel.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `qr3d_${state.objectFormat}_${cleanName}`;

    // Google Ads conversion tracking
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        'event_category': 'Download',
        'event_label': type + '_' + state.objectFormat
      });
    }

    if (type === '3mf') {
      const blob = window.ThreeMFExporter.generate3MF(state.currentModelData, {
        baseColor: state.baseColor,
        reliefColor: state.reliefColor
      });
      saveBlob(blob, `${filename}_multicolor.3mf`);
    } else if (type === 'stl') {
      const blob = window.STLExporter.generateSTL(state.currentModelData);
      saveBlob(blob, `${filename}.stl`);
    } else if (type === 'png') {
      const hdCanvas = document.createElement('canvas');
      window.QRGenerator.renderCanvas(hdCanvas, {
        matrixObj: qrMatrixObj,
        bgColor: state.baseColor,
        fgColor: state.reliefColor,
        shape: state.moduleShape,
        centerEmoji: state.centerEmoji,
        canvasSize: 1024
      });
      hdCanvas.toBlob(blob => {
        saveBlob(blob, `${filename}_hd.png`);
      });
    } else if (type === 'svg') {
      const svgStr = window.QRGenerator.generateSVG({
        matrixObj: qrMatrixObj,
        bgColor: state.baseColor,
        fgColor: state.reliefColor,
        shape: state.moduleShape,
        centerEmoji: state.centerEmoji
      });
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      saveBlob(blob, `${filename}.svg`);
    }

    showDownloadToast();
  }

  function showDownloadToast() {
    if (!el.downloadToast) return;
    el.downloadToast.classList.add('show');
    setTimeout(() => {
      el.downloadToast.classList.remove('show');
    }, 3800);
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Start app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
