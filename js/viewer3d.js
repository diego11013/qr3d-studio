/**
 * QR3D Studio - WebGL 3D Interactive Viewer
 * Features: Mathematically verified ModelView matrix transformations,
 * accurate camera distance & zoom handling, true bounding-box centering,
 * high-DPI resolution rendering, Trackpad gestures, and zoom slider support.
 */
(function(window) {
  'use strict';

  // Matrix math helper functions
  const Mat4 = {
    create: function() {
      return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    },
    identity: function(out) {
      out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
      out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
      out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
      out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
      return out;
    },
    perspective: function(out, fovy, aspect, near, far) {
      const f = 1.0 / Math.tan(fovy / 2);
      out[0] = f / aspect;
      out[1] = 0; out[2] = 0; out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0; out[7] = 0;
      out[8] = 0; out[9] = 0;
      out[10] = (far + near) / (near - far);
      out[11] = -1;
      out[12] = 0; out[13] = 0;
      out[14] = (2 * far * near) / (near - far);
      out[15] = 0;
      return out;
    },
    translate: function(out, a, v) {
      const x = v[0], y = v[1], z = v[2];
      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        for (let i = 0; i < 12; i++) out[i] = a[i];
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      }
      return out;
    },
    rotateX: function(out, a, rad) {
      const s = Math.sin(rad), c = Math.cos(rad);
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      if (a !== out) {
        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
      }
      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    },
    rotateY: function(out, a, rad) {
      const s = Math.sin(rad), c = Math.cos(rad);
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      if (a !== out) {
        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
      }
      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    }
  };

  const VS_SOURCE = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uProjection;
    uniform mat4 uModelView;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec4 mvPosition = uModelView * vec4(aPosition, 1.0);
      gl_Position = uProjection * mvPosition;
      vNormal = mat3(uModelView) * aNormal;
      vPosition = mvPosition.xyz;
    }
  `;

  const FS_SOURCE = `
    precision mediump float;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir1 = normalize(vec3(0.5, 0.8, 1.0));
      vec3 lightDir2 = normalize(vec3(-0.5, -0.3, 0.5));
      vec3 viewDir = normalize(-vPosition);

      // Ambient
      float ambient = 0.40;

      // Diffuse lights
      float diff1 = max(dot(normal, lightDir1), 0.0) * 0.50;
      float diff2 = max(dot(normal, lightDir2), 0.0) * 0.18;

      // Specular highlight
      vec3 halfDir = normalize(lightDir1 + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.22;

      vec3 finalColor = uColor * (ambient + diff1 + diff2) + vec3(spec);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  function hexToRgb(hex) {
    let clean = (hex || '#FFFFFF').replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    ];
  }

  function computeMeshBuffers(mesh, offsetX, offsetY, offsetZ) {
    const positions = [];
    const normals = [];

    for (let i = 0; i < mesh.triangles.length; i++) {
      const t = mesh.triangles[i];
      const v0 = mesh.vertices[t[0]];
      const v1 = mesh.vertices[t[1]];
      const v2 = mesh.vertices[t[2]];

      const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
      const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      const unx = nx / len, uny = ny / len, unz = nz / len;

      positions.push(
        v0[0] + offsetX, v0[1] + offsetY, v0[2] + offsetZ,
        v1[0] + offsetX, v1[1] + offsetY, v1[2] + offsetZ,
        v2[0] + offsetX, v2[1] + offsetY, v2[2] + offsetZ
      );

      normals.push(
        unx, uny, unz,
        unx, uny, unz,
        unx, uny, unz
      );
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      count: mesh.triangles.length * 3
    };
  }

  class QR3DViewer {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.gl = this.canvas.getContext('webgl', { antialias: true, alpha: true }) ||
                this.canvas.getContext('experimental-webgl');
      
      this.rotX = 0.40; // Initial angle
      this.rotY = -0.32;
      this.distance = 220; // Verified distance
      this.defaultDistance = 220;
      this.isDragging = false;
      this.lastPointerX = 0;
      this.lastPointerY = 0;

      this.autoRotate = false;
      this.touchDistanceStart = 0;

      this.baseColor = [1, 1, 1];
      this.reliefColor = [0.1, 0.1, 0.15];

      this.baseBuffers = null;
      this.reliefBuffers = null;
      this.bounds = null;

      this.onZoomChange = null;

      this.initGL();
      this.initEvents();
      this.render();
    }

    initGL() {
      const gl = this.gl;
      if (!gl) {
        console.warn("WebGL not supported");
        return;
      }

      // Compile Shaders
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, VS_SOURCE);
      gl.compileShader(vs);

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, FS_SOURCE);
      gl.compileShader(fs);

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      this.program = prog;

      this.attribPos = gl.getAttribLocation(prog, 'aPosition');
      this.attribNorm = gl.getAttribLocation(prog, 'aNormal');
      this.uniformProj = gl.getUniformLocation(prog, 'uProjection');
      this.uniformMV = gl.getUniformLocation(prog, 'uModelView');
      this.uniformColor = gl.getUniformLocation(prog, 'uColor');

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.clearColor(0.06, 0.09, 0.16, 1.0);
    }

    initEvents() {
      const c = this.canvas;

      // 1. Pointer Events API (Handles Mouse, Trackpad clicks, Touch with capture)
      c.addEventListener('pointerdown', e => {
        c.setPointerCapture(e.pointerId);
        this.isDragging = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
      });

      c.addEventListener('pointermove', e => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        this.rotY += dx * 0.01;
        this.rotX += dy * 0.01;
        this.rotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.rotX));
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.requestRender();
      });

      const endDrag = e => {
        try { c.releasePointerCapture(e.pointerId); } catch (_) {}
        this.isDragging = false;
      };

      c.addEventListener('pointerup', endDrag);
      c.addEventListener('pointercancel', endDrag);

      // 2. Trackpad Two-Finger & Wheel Gestures
      c.addEventListener('wheel', e => {
        e.preventDefault();

        if (e.ctrlKey) {
          // Trackpad Pinch-to-Zoom Gesture
          this.setDistance(this.distance + e.deltaY * 0.6);
        } else {
          // Trackpad Two-Finger Drag / Swipe: Smooth Orbit Rotation
          if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
            this.rotY -= e.deltaX * 0.007;
            this.rotX -= e.deltaY * 0.007;
            this.rotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.rotX));
          }
        }
        this.requestRender();
      }, { passive: false });

      // 3. Multi-Touch Pinch Zoom
      c.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.touchDistanceStart = Math.hypot(dx, dy);
        }
      }, { passive: true });

      c.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && this.touchDistanceStart > 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDist = Math.hypot(dx, dy);
          const diff = this.touchDistanceStart - currentDist;
          this.setDistance(this.distance + diff * 0.6);
          this.touchDistanceStart = currentDist;
          this.requestRender();
        }
      }, { passive: true });

      c.addEventListener('touchend', () => {
        this.touchDistanceStart = 0;
      });

      // Window resize
      window.addEventListener('resize', () => {
        this.autoFrameCamera();
        this.requestRender();
      });
    }

    setDistance(newDist) {
      this.distance = Math.max(80, Math.min(600, newDist));
      if (this.onZoomChange) {
        this.onZoomChange(this.distance);
      }
      this.requestRender();
    }

    autoFrameCamera() {
      if (!this.bounds) return;
      const b = this.bounds;
      const aspect = (this.canvas.clientWidth || 400) / (this.canvas.clientHeight || 400);

      const fovY = Math.PI / 4; // 45 deg
      const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);

      // Fit height and width with ~50% margin
      const distY = (b.sizeY / 2) / Math.tan(fovY / 2);
      const distX = (b.sizeX / 2) / Math.tan(fovX / 2);
      const distZ = (b.sizeZ / 2) / Math.tan(fovY / 2);

      const calculatedDist = Math.max(distX, distY, distZ) * 1.55;
      this.defaultDistance = Math.max(160, Math.min(500, calculatedDist));
      this.setDistance(this.defaultDistance);
    }

    rotateBy(deltaX, deltaY) {
      this.rotY += deltaX;
      this.rotX += deltaY;
      this.rotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.rotX));
      this.requestRender();
    }

    zoomBy(deltaDist) {
      this.setDistance(this.distance + deltaDist);
    }

    resetView() {
      this.rotX = 0.40;
      this.rotY = -0.32;
      this.autoFrameCamera();
      this.requestRender();
    }

    toggleAutoRotate() {
      this.autoRotate = !this.autoRotate;
      if (this.autoRotate) {
        this.startAutoRotateLoop();
      }
      return this.autoRotate;
    }

    startAutoRotateLoop() {
      if (!this.autoRotate) return;
      this.rotY += 0.012;
      this.render();
      requestAnimationFrame(() => this.startAutoRotateLoop());
    }

    updateModel(modelData, options) {
      const gl = this.gl;
      if (!gl) return;

      this.baseColor = hexToRgb(options.baseColor || '#FFFFFF');
      this.reliefColor = hexToRgb(options.reliefColor || '#111827');

      // Compute exact 3D bounding box across all vertices
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      const allVerts = [...modelData.baseMesh.vertices, ...modelData.reliefMesh.vertices];
      for (let i = 0; i < allVerts.length; i++) {
        const v = allVerts[i];
        if (v[0] < minX) minX = v[0];
        if (v[0] > maxX) maxX = v[0];
        if (v[1] < minY) minY = v[1];
        if (v[1] > maxY) maxY = v[1];
        if (v[2] < minZ) minZ = v[2];
        if (v[2] > maxZ) maxZ = v[2];
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;

      this.bounds = {
        minX, maxX, minY, maxY, minZ, maxZ,
        sizeX: maxX - minX,
        sizeY: maxY - minY,
        sizeZ: maxZ - minZ,
        centerX, centerY, centerZ
      };

      // Center model perfectly at (0, 0, 0)
      const offsetX = -centerX;
      const offsetY = -centerY;
      const offsetZ = -centerZ;

      // Base buffers
      const baseData = computeMeshBuffers(modelData.baseMesh, offsetX, offsetY, offsetZ);
      const bPosBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bPosBuf);
      gl.bufferData(gl.ARRAY_BUFFER, baseData.positions, gl.STATIC_DRAW);

      const bNormBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bNormBuf);
      gl.bufferData(gl.ARRAY_BUFFER, baseData.normals, gl.STATIC_DRAW);

      this.baseBuffers = {
        pos: bPosBuf,
        norm: bNormBuf,
        count: baseData.count
      };

      // Relief buffers
      const reliefData = computeMeshBuffers(modelData.reliefMesh, offsetX, offsetY, offsetZ);
      const rPosBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, rPosBuf);
      gl.bufferData(gl.ARRAY_BUFFER, reliefData.positions, gl.STATIC_DRAW);

      const rNormBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, rNormBuf);
      gl.bufferData(gl.ARRAY_BUFFER, reliefData.normals, gl.STATIC_DRAW);

      this.reliefBuffers = {
        pos: rPosBuf,
        norm: rNormBuf,
        count: reliefData.count
      };

      this.autoFrameCamera();
      this.requestRender();
    }

    requestRender() {
      if (!this.rafId && !this.autoRotate) {
        this.rafId = requestAnimationFrame(() => {
          this.rafId = null;
          this.render();
        });
      }
    }

    render() {
      const gl = this.gl;
      if (!gl) return;

      // High-DPI support
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(this.canvas.clientWidth * dpr);
      const displayHeight = Math.floor(this.canvas.clientHeight * dpr);

      if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.program);

      // Perspective Projection Matrix
      const aspect = (this.canvas.width || 1) / (this.canvas.height || 1);
      const proj = Mat4.create();
      Mat4.perspective(proj, Math.PI / 4, aspect, 1, 2500);
      gl.uniformMatrix4fv(this.uniformProj, false, proj);

      // Construct Model-View Matrix with true camera distance translation
      const mv = Mat4.create();
      Mat4.translate(mv, mv, [0, 0, -this.distance]);
      Mat4.rotateX(mv, mv, this.rotX);
      Mat4.rotateY(mv, mv, this.rotY);
      gl.uniformMatrix4fv(this.uniformMV, false, mv);

      gl.enableVertexAttribArray(this.attribPos);
      gl.enableVertexAttribArray(this.attribNorm);

      // 1. Draw Base Mesh
      if (this.baseBuffers && this.baseBuffers.count > 0) {
        gl.uniform3fv(this.uniformColor, new Float32Array(this.baseColor));
        gl.bindBuffer(gl.ARRAY_BUFFER, this.baseBuffers.pos);
        gl.vertexAttribPointer(this.attribPos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.baseBuffers.norm);
        gl.vertexAttribPointer(this.attribNorm, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.baseBuffers.count);
      }

      // 2. Draw Relief Mesh
      if (this.reliefBuffers && this.reliefBuffers.count > 0) {
        gl.uniform3fv(this.uniformColor, new Float32Array(this.reliefColor));
        gl.bindBuffer(gl.ARRAY_BUFFER, this.reliefBuffers.pos);
        gl.vertexAttribPointer(this.attribPos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.reliefBuffers.norm);
        gl.vertexAttribPointer(this.attribNorm, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.reliefBuffers.count);
      }
    }
  }

  window.QR3DViewer = QR3DViewer;
})(window);
