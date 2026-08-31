/**
 * Controlador principal de la interfaz y eventos
 */
document.addEventListener('DOMContentLoaded', () => {
  const viewer = new Viewer3D('qrCanvas3d');
  
  const qrInput = document.getElementById('qrInput');
  const baseColorInput = document.getElementById('baseColorInput');
  const reliefColorInput = document.getElementById('reliefColorInput');
  const bottomTextInput = document.getElementById('bottomTextInput');
  const textSizeSlider = document.getElementById('textSizeSlider');
  const textSizeVal = document.getElementById('textSizeVal');
  const resetTextSizeBtn = document.getElementById('resetTextSizeBtn');

  function update() {
    const data = {
      text: bottomTextInput.value,
      baseColor: baseColorInput.value,
      reliefColor: reliefColorInput.value,
      url: qrInput.value
    };
    viewer.render(data);
  }

  bottomTextInput.addEventListener('input', () => {
    const lines = bottomTextInput.value.split('\n');
    if (lines.length > 2) {
      bottomTextInput.value = lines.slice(0, 2).join('\n');
    }
    update();
  });

  textSizeSlider.addEventListener('input', (e) => {
    textSizeVal.textContent = `Escala: ${e.target.value}%`;
    update();
  });

  resetTextSizeBtn.addEventListener('click', () => {
    textSizeSlider.value = 100;
    textSizeVal.textContent = 'Escala: Auto (100%)';
    update();
  });

  baseColorInput.addEventListener('input', (e) => {
    document.getElementById('baseColorHex').textContent = e.target.value.toUpperCase();
    update();
  });

  reliefColorInput.addEventListener('input', (e) => {
    document.getElementById('reliefColorHex').textContent = e.target.value.toUpperCase();
    update();
  });

  document.getElementById('btnDownload3MF').addEventListener('click', () => {
    exportTo3MF({ width: 72, height: 90, baseThick: 2.4 });
    showToast();
  });

  document.getElementById('btnDownloadSTL').addEventListener('click', () => {
    exportToSTL({ width: 72, height: 90, baseThick: 2.4 });
    showToast();
  });

  function showToast() {
    const toast = document.getElementById('downloadToast');
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 3000);
  }

  // Preset buttons
  document.querySelectorAll('.quick-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  update();
});
