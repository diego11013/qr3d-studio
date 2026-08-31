/**
 * Visor 3D en Canvas con soporte de rotación táctil y trackpad
 */
class Viewer3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.rotX = 0.4;
    this.rotY = -0.5;
    this.zoom = 220;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.autoRotate = false;

    this.initEvents();
    this.resize();
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth || 400;
    this.canvas.height = this.canvas.clientHeight || 380;
    this.render();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', e => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => this.isDragging = false);
    window.addEventListener('mousemove', e => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.rotY += dx * 0.01;
      this.rotX += dy * 0.01;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.render();
    });

    // Touch events
    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    this.canvas.addEventListener('touchmove', e => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouse.x;
      const dy = e.touches[0].clientY - this.lastMouse.y;
      this.rotY += dx * 0.01;
      this.rotX += dy * 0.01;
      this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.render();
    });
    this.canvas.addEventListener('touchend', () => this.isDragging = false);
  }

  render(modelData = {}) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);

    // Dibujar perspectiva isométrica simulada
    ctx.strokeStyle = modelData.reliefColor || '#111827';
    ctx.fillStyle = modelData.baseColor || '#FFFFFF';

    ctx.beginPath();
    const size = this.zoom * 0.6;
    ctx.rect(-size / 2, -size / 2, size, size * 1.2);
    ctx.fill();
    ctx.stroke();

    // Dibujar texto simulado
    if (modelData.text) {
      ctx.fillStyle = modelData.reliefColor || '#111827';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const lines = modelData.text.split('\n').slice(0, 2);
      lines.forEach((l, idx) => {
        ctx.fillText(l, 0, size * 0.45 + (idx * 14));
      });
    }

    ctx.restore();
  }
}
