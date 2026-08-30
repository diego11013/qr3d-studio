/**
 * QR3D Studio - Main Application Controller
 * Coordinates UI inputs, QR Generation, 3D Mesh Construction,
 * Real-time 3D Viewer, 2D QR HD Section, Trackpad, Zoom Slider, File Downloads, and Ad Modals.
 */
(function() {
  'use strict';

  // Application State
  const state = {
    text: 'https://ejemplo.com/menu',
    objectFormat: 'stand', // 'stand', 'keychain', 'plaque'
    baseColor: '#FFFFFF',
    reliefColor: '#111827',
    moduleShape: 'square', // 'square', 'rounded', 'dots'
    centerEmoji: '🍽️',
    bottomText: 'MENU DIGITAL',
    baseThickness: 2.4,
    reliefHeight: 1.4,
    currentModelData: null,
    pendingDownloadType: null
  };

  let viewer = null;
  let qrMatrixObj = null;

  // DOM Elements
  const el = {
    qrInput: document.getElementById('qrInput'),
    wifiHelperBtn: document.getElementById('wifiHelperBtn'),
    wifiModal: document.getElementById('wifiModal'),
    wifiSsid: document.getElementById('wifiSsid'),
    wifiPass: document.getElementById('wifiPass'),
    wifiType: document.getElementById('wifiType'),
    applyWifiBtn: document.getElementById('applyWifiBtn'),
    closeWifiBtn: document.getElementById('closeWifiBtn'),

    formatBtns: document.querySelectorAll('.format-card'),
    baseColorInput: document.getElementById('baseColorInput'),
    baseColorHex: document.getElementById('baseColorHex'),
    reliefColorInput: document.getElementById('reliefColorInput'),
    reliefColorHex: document.getElementById('reliefColorHex'),
    colorPresets: document.querySelectorAll('.color-preset-btn'),

    shapeBtns: document.querySelectorAll('.shape-btn'),
    emojiBtns: document.querySelectorAll('.emoji-btn'),
    customEmojiInput: document.getElementById('customEmojiInput'),
    clearEmojiBtn: document.getElementById('clearEmojiBtn'),
    bottomTextInput: document.getElementById('bottomTextInput'),

    canvas3d: document.getElementById('qrCanvas3d'),
    canvas2dFull: document.getElementById('qrCanvas2dFull'),
    reset3dBtn: document.getElementById('reset3dBtn'),
    dimsBadge: document.getElementById('dimsBadge'),

    // Floating On-Screen Viewport Buttons
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

    btnDownload3MF: document.getElementById('btnDownload3MF'),
    btnDownloadSTL: document.getElementById('btnDownloadSTL'),
    btnDownloadPNG2D: document.getElementById('btnDownloadPNG2D'),
    btnDownloadSVG2D: document.getElementById('btnDownloadSVG2D'),

    adModal: document.getElementById('adModal'),
    adModalClose: document.getElementById('adModalClose'),
    adModalTimer: document.getElementById('adModalTimer'),
    adCornerBadge: document.getElementById('adCornerBadge'),
    closeCornerAdBtn: document.getElementById('closeCornerAdBtn')
  };

  function init() {
    // Initialize 3D Viewer
    viewer = new window.QR3DViewer('qrCanvas3d');

    // Sync Zoom slider with viewer changes (wheel, trackpad, pinch)
    viewer.onZoomChange = function(distance) {
      if (el.zoomSlider) {
        el.zoomSlider.value = Math.round(distance);
      }
    };

    bindEvents();
    updateAll();
  }

  function bindEvents() {
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
        const ssid = el.wifiSsid.value.trim();
        const pass = el.wifiPass.value;
        const type = el.wifiType.value;
        const wifiString = `WIFI:S:${ssid};T:${type};P:${pass};;`;
        el.qrInput.value = wifiString;
        state.text = wifiString;
        if (!state.bottomText) {
          state.bottomText = 'WIFI ' + (ssid || 'CLIENTES');
          el.bottomTextInput.value = state.bottomText;
        }
        state.centerEmoji = '📶';
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

    // Center Emoji Buttons
    el.emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.emojiBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.centerEmoji = btn.dataset.emoji;
        el.customEmojiInput.value = '';
        updateAll();
      });
    });

    el.customEmojiInput.addEventListener('input', e => {
      const val = e.target.value.trim();
      el.emojiBtns.forEach(b => b.classList.remove('active'));
      state.centerEmoji = val;
      updateAll();
    });

    el.clearEmojiBtn.addEventListener('click', () => {
      el.emojiBtns.forEach(b => b.classList.remove('active'));
      el.customEmojiInput.value = '';
      state.centerEmoji = '';
      updateAll();
    });

    // Bottom Text
    el.bottomTextInput.addEventListener('input', e => {
      state.bottomText = e.target.value;
      update3D();
    });

    // 3D Viewport Controls (Trackpad / Touch / Button shortcuts)
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

    // Corner Ad Close
    if (el.closeCornerAdBtn) {
      el.closeCornerAdBtn.addEventListener('click', () => {
        el.adCornerBadge.style.display = 'none';
      });
    }

    // Downloads (3D & 2D)
    el.btnDownload3MF.addEventListener('click', () => triggerDownloadWithAd('3mf'));
    el.btnDownloadSTL.addEventListener('click', () => triggerDownloadWithAd('stl'));
    if (el.btnDownloadPNG2D) {
      el.btnDownloadPNG2D.addEventListener('click', () => triggerDownloadWithAd('png'));
    }
    if (el.btnDownloadSVG2D) {
      el.btnDownloadSVG2D.addEventListener('click', () => triggerDownloadWithAd('svg'));
    }

    // Ad Modal Close & Finish Download
    el.adModalClose.addEventListener('click', () => {
      closeAdAndExecuteDownload();
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
      });
    });
  }

  function updateAll() {
    // 1. Generate QR matrix
    qrMatrixObj = window.QRGenerator.generateMatrix(state.text, state.centerEmoji ? 'H' : 'Q');

    // 2. Render Full-Size 2D Canvas
    render2DCanvas();

    // 3. Build & Render 3D Model
    update3D();
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
    // Update 2D Canvas
    render2DCanvas();

    // Update 3D Colors
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
      matrixObj: qrMatrixObj,
      baseThickness: state.baseThickness,
      reliefHeight: state.reliefHeight,
      moduleShape: state.moduleShape,
      centerEmoji: state.centerEmoji,
      bottomText: state.bottomText
    });

    state.currentModelData = modelData;

    // Update dimensions badge
    const d = modelData.dimensions;
    el.dimsBadge.textContent = `${d.width} × ${d.height} × ${d.totalZ.toFixed(1)} mm`;

    // Render in WebGL viewer
    viewer.updateModel(modelData, {
      baseColor: state.baseColor,
      reliefColor: state.reliefColor
    });

    if (el.zoomSlider) {
      el.zoomSlider.value = Math.round(viewer.distance);
    }
  }

  /**
   * Ad Modal Interstitial on Download
   */
  function triggerDownloadWithAd(type) {
    state.pendingDownloadType = type;
    el.adModal.classList.add('active');

    let secondsLeft = 3;
    el.adModalTimer.textContent = `Descargando en ${secondsLeft}s... (o haz clic en cerrar para descargar ya)`;

    const timer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        el.adModalTimer.textContent = `Descargando en ${secondsLeft}s...`;
      } else {
        clearInterval(timer);
        closeAdAndExecuteDownload();
      }
    }, 1000);

    el.adModal._activeTimer = timer;
  }

  function closeAdAndExecuteDownload() {
    if (el.adModal._activeTimer) {
      clearInterval(el.adModal._activeTimer);
      el.adModal._activeTimer = null;
    }
    el.adModal.classList.remove('active');

    const type = state.pendingDownloadType;
    state.pendingDownloadType = null;

    if (type) {
      executeDownload(type);
    }
  }

  function executeDownload(type) {
    const cleanName = (state.bottomText || 'QR3D').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `qr3d_${state.objectFormat}_${cleanName}`;

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
      // Create high-res 1024x1024 offscreen canvas for crisp PNG download
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
