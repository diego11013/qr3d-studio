/**
 * QR3D Studio - High-End 3D Geometry Builder (Organic Contours & Architectural Detailing)
 * Generates solid, manifold 3D meshes for 3D printing:
 * - Rounded base plates with smooth filleted corners
 * - Organic, connected rounded QR module islands & continuous paths
 * - Smooth squircle Finder Pattern eyes (Corner targets)
 * - Ultra-high-detail 3D center emblems (Cutlery with tines & knife, 3D faceted star, WiFi waves, Coffee mug, Camera)
 * - 4 Corner Allen Hex-Socket Hardware Screws
 * - Multi-line Top and Bottom Text with auto-scaling & centering
 */
(function(window) {
  'use strict';

  // 5x7 Dot-Matrix Font with international characters (including accented vowels & symbols)
  const FONT_5X7 = {
    ' ': [0x00,0x00,0x00,0x00,0x00],
    '!': [0x00,0x00,0x5F,0x00,0x00],
    '"': [0x00,0x07,0x00,0x07,0x00],
    '#': [0x14,0x7F,0x14,0x7F,0x14],
    '$': [0x24,0x2A,0x7F,0x2A,0x12],
    '%': [0x23,0x13,0x08,0x64,0x62],
    '&': [0x36,0x49,0x55,0x22,0x50],
    "'": [0x00,0x05,0x03,0x00,0x00],
    '(': [0x00,0x1C,0x22,0x41,0x00],
    ')': [0x00,0x41,0x22,0x1C,0x00],
    '*': [0x14,0x08,0x3E,0x08,0x14],
    '+': [0x08,0x08,0x3E,0x08,0x08],
    ',': [0x00,0x50,0x30,0x00,0x00],
    '-': [0x08,0x08,0x08,0x08,0x08],
    '.': [0x00,0x60,0x60,0x00,0x00],
    '/': [0x20,0x10,0x08,0x04,0x02],
    '0': [0x3E,0x51,0x49,0x45,0x3E],
    '1': [0x00,0x42,0x7F,0x40,0x00],
    '2': [0x42,0x61,0x51,0x49,0x46],
    '3': [0x21,0x41,0x45,0x4B,0x31],
    '4': [0x18,0x14,0x12,0x7F,0x10],
    '5': [0x27,0x45,0x45,0x45,0x39],
    '6': [0x3C,0x4A,0x49,0x49,0x30],
    '7': [0x01,0x71,0x09,0x05,0x03],
    '8': [0x36,0x49,0x49,0x49,0x36],
    '9': [0x06,0x49,0x49,0x29,0x1E],
    ':': [0x00,0x36,0x36,0x00,0x00],
    '@': [0x32,0x49,0x79,0x41,0x3E],
    'A': [0x7E,0x11,0x11,0x11,0x7E],
    'Á': [0x7E,0x11,0x13,0x11,0x7E],
    'B': [0x7F,0x49,0x49,0x49,0x36],
    'C': [0x3E,0x41,0x41,0x41,0x22],
    'D': [0x7F,0x41,0x41,0x22,0x1C],
    'E': [0x7F,0x49,0x49,0x49,0x41],
    'É': [0x7F,0x49,0x4B,0x49,0x41],
    'F': [0x7F,0x09,0x09,0x09,0x01],
    'G': [0x3E,0x41,0x49,0x49,0x7A],
    'H': [0x7F,0x08,0x08,0x08,0x7F],
    'I': [0x00,0x41,0x7F,0x41,0x00],
    'Í': [0x00,0x41,0x7F,0x43,0x00],
    'J': [0x20,0x40,0x41,0x3F,0x01],
    'K': [0x7F,0x08,0x14,0x22,0x41],
    'L': [0x7F,0x40,0x40,0x40,0x40],
    'M': [0x7F,0x02,0x0C,0x02,0x7F],
    'N': [0x7F,0x04,0x08,0x10,0x7F],
    'Ñ': [0x7F,0x05,0x0A,0x10,0x7F],
    'O': [0x3E,0x41,0x41,0x41,0x3E],
    'Ó': [0x3E,0x41,0x43,0x41,0x3E],
    'P': [0x7F,0x09,0x09,0x09,0x06],
    'Q': [0x3E,0x41,0x51,0x21,0x5E],
    'R': [0x7F,0x09,0x19,0x29,0x46],
    'S': [0x46,0x49,0x49,0x49,0x31],
    'T': [0x01,0x01,0x7F,0x01,0x01],
    'U': [0x3F,0x40,0x40,0x40,0x3F],
    'Ú': [0x3F,0x40,0x42,0x40,0x3F],
    'V': [0x1F,0x20,0x40,0x20,0x1F],
    'W': [0x3F,0x40,0x38,0x40,0x3F],
    'X': [0x63,0x14,0x08,0x14,0x63],
    'Y': [0x07,0x08,0x70,0x08,0x07],
    'Z': [0x61,0x51,0x49,0x45,0x43],
    '★': [0x38,0x3C,0x7F,0x3C,0x38]
  };

  class MeshBuilder {
    constructor() {
      this.vertices = [];
      this.triangles = [];
    }

    addVertex(x, y, z) {
      this.vertices.push([
        Math.round(x * 1000) / 1000,
        Math.round(y * 1000) / 1000,
        Math.round(z * 1000) / 1000
      ]);
      return this.vertices.length - 1;
    }

    addTriangle(i1, i2, i3) {
      this.triangles.push([i1, i2, i3]);
    }

    addQuad(i0, i1, i2, i3) {
      this.addTriangle(i0, i1, i2);
      this.addTriangle(i0, i2, i3);
    }

    /**
     * Adds an axis-aligned solid box
     */
    addBox(xMin, xMax, yMin, yMax, zMin, zMax) {
      if (xMin >= xMax || yMin >= yMax || zMin >= zMax) return;
      const v0 = this.addVertex(xMin, yMin, zMin);
      const v1 = this.addVertex(xMax, yMin, zMin);
      const v2 = this.addVertex(xMax, yMax, zMin);
      const v3 = this.addVertex(xMin, yMax, zMin);

      const v4 = this.addVertex(xMin, yMin, zMax);
      const v5 = this.addVertex(xMax, yMin, zMax);
      const v6 = this.addVertex(xMax, yMax, zMax);
      const v7 = this.addVertex(xMin, yMax, zMax);

      this.addQuad(v0, v3, v2, v1);
      this.addQuad(v4, v5, v6, v7);
      this.addQuad(v0, v1, v5, v4);
      this.addQuad(v2, v3, v7, v6);
      this.addQuad(v3, v0, v4, v7);
      this.addQuad(v1, v2, v6, v5);
    }

    /**
     * Adds an 8-sided chamfered / rounded rectangular prism
     */
    addRoundedBox(xMin, xMax, yMin, yMax, chamfer, zMin, zMax) {
      const c = Math.min(chamfer, (xMax - xMin) * 0.38, (yMax - yMin) * 0.38);
      if (c <= 0.05) {
        this.addBox(xMin, xMax, yMin, yMax, zMin, zMax);
        return;
      }
      const x0 = xMin + c, x1 = xMax - c;
      const y0 = yMin + c, y1 = yMax - c;

      const b0 = this.addVertex(x0, yMin, zMin);
      const b1 = this.addVertex(x1, yMin, zMin);
      const b2 = this.addVertex(xMax, y0, zMin);
      const b3 = this.addVertex(xMax, y1, zMin);
      const b4 = this.addVertex(x1, yMax, zMin);
      const b5 = this.addVertex(x0, yMax, zMin);
      const b6 = this.addVertex(xMin, y1, zMin);
      const b7 = this.addVertex(xMin, y0, zMin);

      const t0 = this.addVertex(x0, yMin, zMax);
      const t1 = this.addVertex(x1, yMin, zMax);
      const t2 = this.addVertex(xMax, y0, zMax);
      const t3 = this.addVertex(xMax, y1, zMax);
      const t4 = this.addVertex(x1, yMax, zMax);
      const t5 = this.addVertex(x0, yMax, zMax);
      const t6 = this.addVertex(xMin, y1, zMax);
      const t7 = this.addVertex(xMin, y0, zMax);

      const bCenter = this.addVertex((xMin + xMax) / 2, (yMin + yMax) / 2, zMin);
      this.addTriangle(bCenter, b1, b0);
      this.addTriangle(bCenter, b2, b1);
      this.addTriangle(bCenter, b3, b2);
      this.addTriangle(bCenter, b4, b3);
      this.addTriangle(bCenter, b5, b4);
      this.addTriangle(bCenter, b6, b5);
      this.addTriangle(bCenter, b7, b6);
      this.addTriangle(bCenter, b0, b7);

      const tCenter = this.addVertex((xMin + xMax) / 2, (yMin + yMax) / 2, zMax);
      this.addTriangle(tCenter, t0, t1);
      this.addTriangle(tCenter, t1, t2);
      this.addTriangle(tCenter, t2, t3);
      this.addTriangle(tCenter, t3, t4);
      this.addTriangle(tCenter, t4, t5);
      this.addTriangle(tCenter, t5, t6);
      this.addTriangle(tCenter, t6, t7);
      this.addTriangle(tCenter, t7, t0);

      this.addQuad(b0, b1, t1, t0);
      this.addQuad(b1, b2, t2, t1);
      this.addQuad(b2, b3, t3, t2);
      this.addQuad(b3, b4, t4, t3);
      this.addQuad(b4, b5, t5, t4);
      this.addQuad(b5, b6, t6, t5);
      this.addQuad(b6, b7, t7, t6);
      this.addQuad(b7, b0, t0, t7);
    }

    /**
     * Adds a cylinder along Z axis
     */
    addCylinder(cx, cy, r, zMin, zMax, segments = 16) {
      const botCenter = this.addVertex(cx, cy, zMin);
      const topCenter = this.addVertex(cx, cy, zMax);
      const botRing = [], topRing = [];

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        botRing.push(this.addVertex(x, y, zMin));
        topRing.push(this.addVertex(x, y, zMax));
      }

      for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        this.addTriangle(botCenter, botRing[next], botRing[i]);
        this.addTriangle(topCenter, topRing[i], topRing[next]);
        this.addQuad(botRing[i], botRing[next], topRing[next], topRing[i]);
      }
    }

    /**
     * Adds an annular ring (cylinder with hole)
     */
    addHollowCylinder(cx, cy, rOuter, rInner, zMin, zMax, segments = 24) {
      const botOut = [], botIn = [];
      const topOut = [], topIn = [];

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta), sin = Math.sin(theta);
        botOut.push(this.addVertex(cx + cos * rOuter, cy + sin * rOuter, zMin));
        botIn.push(this.addVertex(cx + cos * rInner, cy + sin * rInner, zMin));
        topOut.push(this.addVertex(cx + cos * rOuter, cy + sin * rOuter, zMax));
        topIn.push(this.addVertex(cx + cos * rInner, cy + sin * rInner, zMax));
      }

      for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        this.addQuad(botOut[next], botOut[i], botIn[i], botIn[next]);
        this.addQuad(topOut[i], topOut[next], topIn[next], topIn[i]);
        this.addQuad(botOut[i], botOut[next], topOut[next], topOut[i]);
        this.addQuad(botIn[next], botIn[i], topIn[i], topIn[next]);
      }
    }

    /**
     * Adds an Allen Hex Socket Screw Head (with chamfered metallic bezel and hexagonal recess)
     */
    addScrewHead(cx, cy, rOuter, rHex, zMin, zMax) {
      const bezelZ = zMax + 0.35;
      const recessZ = zMax - 0.7;
      this.addHollowCylinder(cx, cy, rOuter, rHex, zMin, bezelZ, 20);

      const hexBotVerts = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        hexBotVerts.push(this.addVertex(cx + Math.cos(angle) * rHex, cy + Math.sin(angle) * rHex, recessZ));
      }
      const hexCenter = this.addVertex(cx, cy, recessZ);
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        this.addTriangle(hexCenter, hexBotVerts[next], hexBotVerts[i]);
      }
    }

    /**
     * Adds a rounded corner solid base plate with corner radius R
     */
    addRoundedPlate(w, h, r, zMin, zMax, cornerSegments = 6) {
      const x0 = r, x1 = w - r;
      const y0 = r, y1 = h - r;

      this.addBox(x0, x1, y0, y1, zMin, zMax);
      this.addBox(x0, x1, 0, y0, zMin, zMax);
      this.addBox(x0, x1, y1, h, zMin, zMax);
      this.addBox(0, x0, y0, y1, zMin, zMax);
      this.addBox(x1, w, y0, y1, zMin, zMax);

      const corners = [
        { cx: x0, cy: y0, startAngle: Math.PI, endAngle: Math.PI * 1.5 },
        { cx: x1, cy: y0, startAngle: Math.PI * 1.5, endAngle: Math.PI * 2 },
        { cx: x1, cy: y1, startAngle: 0, endAngle: Math.PI * 0.5 },
        { cx: x0, cy: y1, startAngle: Math.PI * 0.5, endAngle: Math.PI }
      ];

      for (const c of corners) {
        const botC = this.addVertex(c.cx, c.cy, zMin);
        const topC = this.addVertex(c.cx, c.cy, zMax);
        const botR = [], topR = [];

        for (let i = 0; i <= cornerSegments; i++) {
          const theta = c.startAngle + (i / cornerSegments) * (c.endAngle - c.startAngle);
          const x = c.cx + Math.cos(theta) * r;
          const y = c.cy + Math.sin(theta) * r;
          botR.push(this.addVertex(x, y, zMin));
          topR.push(this.addVertex(x, y, zMax));
        }

        for (let i = 0; i < cornerSegments; i++) {
          this.addTriangle(botC, botR[i + 1], botR[i]);
          this.addTriangle(topC, topR[i], topR[i + 1]);
          this.addQuad(botR[i], botR[i + 1], topR[i + 1], topR[i]);
        }
      }
    }

    /**
     * Adds an extruded 3D faceted 5-pointed star with central ridge
     */
    addStar(cx, cy, rOuter, rInner, zMin, zMax) {
      const points = 5;
      const botVerts = [], topVerts = [];

      for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? rOuter : rInner;
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        botVerts.push(this.addVertex(x, y, zMin));
        topVerts.push(this.addVertex(x, y, zMax));
      }

      const botCenter = this.addVertex(cx, cy, zMin);
      const topApex = this.addVertex(cx, cy, zMax + 0.35);
      const n = points * 2;

      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        this.addTriangle(botCenter, botVerts[next], botVerts[i]);
        this.addTriangle(topApex, topVerts[i], topVerts[next]);
        this.addQuad(botVerts[i], botVerts[next], topVerts[next], topVerts[i]);
      }
    }

    /**
     * Adds high-detail restaurant cutlery emblem (Tenedor + Cuchillo)
     */
    addCutleryIcon(cx, cy, scale, zMin, zMax) {
      const s = scale;
      // Tenedor (Left)
      const fx = cx - 3.2 * s;
      this.addBox(fx - 0.45 * s, fx + 0.45 * s, cy - 4.5 * s, cy + 0.2 * s, zMin, zMax);
      this.addBox(fx - 1.3 * s, fx + 1.3 * s, cy + 0.2 * s, cy + 1.4 * s, zMin, zMax);
      // 3 vertical tines with realistic gaps
      this.addBox(fx - 1.3 * s, fx - 0.7 * s, cy + 1.4 * s, cy + 4.5 * s, zMin, zMax);
      this.addBox(fx - 0.3 * s, fx + 0.3 * s, cy + 1.4 * s, cy + 4.5 * s, zMin, zMax);
      this.addBox(fx + 0.7 * s, fx + 1.3 * s, cy + 1.4 * s, cy + 4.5 * s, zMin, zMax);

      // Cuchillo (Right)
      const kx = cx + 3.2 * s;
      this.addBox(kx - 0.45 * s, kx + 0.45 * s, cy - 4.5 * s, cy + 0.2 * s, zMin, zMax);
      this.addBox(kx - 0.45 * s, kx + 0.95 * s, cy + 0.2 * s, cy + 4.5 * s, zMin, zMax);
      this.addBox(kx - 0.95 * s, kx - 0.45 * s, cy + 0.8 * s, cy + 3.8 * s, zMin, zMax);
    }

    /**
     * Extrudes text using 5x7 dot-matrix font into raised 3D boxes
     */
    addText(text, startX, startY, pixelSize, zMin, zMax) {
      const upper = (text || '').toUpperCase();
      let curX = startX;
      for (let i = 0; i < upper.length; i++) {
        const ch = upper[i];
        const cols = FONT_5X7[ch] || FONT_5X7[' '];
        for (let colIdx = 0; colIdx < 5; colIdx++) {
          const colByte = cols[colIdx] || 0;
          for (let rowIdx = 0; rowIdx < 7; rowIdx++) {
            if ((colByte & (1 << rowIdx)) !== 0) {
              const px = curX + colIdx * pixelSize;
              const py = startY - rowIdx * pixelSize;
              this.addBox(px, px + pixelSize * 0.92, py, py + pixelSize * 0.92, zMin, zMax);
            }
          }
        }
        curX += 6 * pixelSize;
      }
    }
  }

  function splitIntoLines(text, maxCharsPerLine) {
    if (text.includes('\n')) {
      return text.split('\n').map(s => s.trim()).filter(Boolean);
    }
    const words = text.split(/\s+/);
    if (words.length <= 1) return [text];
    
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  function getFittedTextLayout(text, plateW, availableHeight, userScale = 1.0) {
    const raw = (text || '').trim();
    if (!raw) return null;

    const marginX = 4.5;
    const maxW = plateW - marginX * 2;
    const lines = splitIntoLines(raw, Math.max(8, Math.ceil(raw.length / 2) + 2));
    
    let maxCols = 0;
    for (const l of lines) maxCols = Math.max(maxCols, l.length * 6 - 1);
    
    const lineCount = lines.length;
    let autoSize = Math.min(maxW / maxCols, availableHeight / (lineCount * 8.5), 0.95);
    
    let scaledSize = autoSize * (userScale || 1.0);
    scaledSize = Math.min(scaledSize, maxW / maxCols, availableHeight / (lineCount * 8.0));
    scaledSize = Math.max(0.35, scaledSize);

    return {
      lines: lines,
      pixelSize: scaledSize
    };
  }

  const GeometryBuilder = {
    /**
     * Builds base mesh and relief mesh based on user parameters
     */
    build3DModel: function(options) {
      const format = options.objectFormat || 'stand'; // 'stand', 'keychain', 'plaque', 'magnetic', 'countersunk'
      const baseMesh = new MeshBuilder();
      const reliefMesh = new MeshBuilder();

      const baseThickness = Math.max(1.6, Math.min(6.0, options.baseThickness !== undefined ? options.baseThickness : 2.4));
      const reliefHeight = Math.max(0.6, Math.min(3.0, options.reliefHeight !== undefined ? options.reliefHeight : 1.4));
      const totalZ = baseThickness + reliefHeight;
      const shape = options.moduleShape || 'rounded'; // default to high-end rounded
      const textScale = options.textScale !== undefined ? options.textScale : 1.0;
      const hasTopText = Boolean(options.topText && options.topText.trim().length > 0);

      // Base dimensions with aesthetic proportions
      let plateW = 75;
      let qrAreaSize = 58;
      let qrMarginX = 8.5;
      let qrMarginY = 25;
      let topMarginY = hasTopText ? 16 : 7;
      let plateH = qrAreaSize + qrMarginY + topMarginY;
      const cornerRadius = 4.5;

      if (format === 'keychain') {
        plateW = 48;
        qrAreaSize = 38;
        qrMarginX = 5;
        qrMarginY = 15;
        topMarginY = hasTopText ? 14 : 6;
        plateH = qrAreaSize + qrMarginY + topMarginY;
      } else if (format === 'plaque' || format === 'magnetic' || format === 'countersunk') {
        plateW = 76;
        qrAreaSize = 60;
        qrMarginX = 8;
        qrMarginY = 25;
        topMarginY = hasTopText ? 17 : 7;
        plateH = qrAreaSize + qrMarginY + topMarginY;
      }

      // 1. Build Base Mesh with Smooth Rounded Corners & Hardware detailing
      if (format === 'keychain') {
        baseMesh.addRoundedPlate(plateW, plateH, 3.5, 0, baseThickness);
        const ringCenterX = plateW / 2;
        const ringCenterY = plateH + 7;
        const ringOuterR = 7.5;
        const ringInnerR = 3.8;
        baseMesh.addHollowCylinder(ringCenterX, ringCenterY, ringOuterR, ringInnerR, 0, baseThickness, 24);
        baseMesh.addBox(ringCenterX - ringOuterR, ringCenterX + ringOuterR, plateH - 2, plateH + 2, 0, baseThickness);
      } else if (format === 'stand') {
        baseMesh.addRoundedPlate(plateW, plateH, cornerRadius, 0, baseThickness);
        const footLength = 32;
        const legWidth = 14;
        baseMesh.addBox(8, 8 + legWidth, 0, footLength, -footLength * 0.35, 0);
        baseMesh.addBox(plateW - 8 - legWidth, plateW - 8, 0, footLength, -footLength * 0.35, 0);
        baseMesh.addBox(8, plateW - 8, 0, 8, -footLength * 0.35, 0);

        // 4 Corner Allen Screws (Brass/Metallic hardware look)
        reliefMesh.addScrewHead(6.5, 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(plateW - 6.5, 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(6.5, plateH - 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(plateW - 6.5, plateH - 6.5, 3.2, 1.5, baseThickness, totalZ);
      } else if (format === 'magnetic') {
        baseMesh.addRoundedPlate(plateW, plateH, cornerRadius, 0, baseThickness);

        // 4 Corner Screws on front
        reliefMesh.addScrewHead(6.5, 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(plateW - 6.5, 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(6.5, plateH - 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(plateW - 6.5, plateH - 6.5, 3.2, 1.5, baseThickness, totalZ);

        // Neodymium magnet pocket rings on rear
        const is10mm = (options.magnetSize === '10x2');
        const magR = is10mm ? 5.3 : 3.3;
        const magMargin = is10mm ? 12 : 9;
        baseMesh.addHollowCylinder(magMargin, magMargin, magR + 1.2, magR, -1.8, 0, 20);
        baseMesh.addHollowCylinder(plateW - magMargin, magMargin, magR + 1.2, magR, -1.8, 0, 20);
        baseMesh.addHollowCylinder(magMargin, plateH - magMargin, magR + 1.2, magR, -1.8, 0, 20);
        baseMesh.addHollowCylinder(plateW - magMargin, plateH - magMargin, magR + 1.2, magR, -1.8, 0, 20);
      } else if (format === 'countersunk') {
        baseMesh.addRoundedPlate(plateW, plateH, cornerRadius, 0, baseThickness);
        const holeR = 2.1;
        const chamferR = 3.8;
        const screwMargin = 6.5;
        baseMesh.addHollowCylinder(screwMargin, screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
        baseMesh.addHollowCylinder(plateW - screwMargin, screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
        baseMesh.addHollowCylinder(screwMargin, plateH - screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
        baseMesh.addHollowCylinder(plateW - screwMargin, plateH - screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
      } else {
        // Standard Plaque
        baseMesh.addRoundedPlate(plateW, plateH, cornerRadius, 0, baseThickness);
        reliefMesh.addScrewHead(6.5, 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(plateW - 6.5, 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(6.5, plateH - 6.5, 3.2, 1.5, baseThickness, totalZ);
        reliefMesh.addScrewHead(plateW - 6.5, plateH - 6.5, 3.2, 1.5, baseThickness, totalZ);
      }

      // 2. Build Relief Geometry (QR Matrix with Organic/Rounded continuous modules)
      const matrixObj = options.matrixObj || window.QRGenerator.generateMatrix(options.text, options.centerEmoji ? 'H' : 'Q');
      const matrix = matrixObj.matrix;
      const count = matrixObj.size;
      const moduleSize = qrAreaSize / count;

      const hasCenter = Boolean(options.centerEmoji && options.centerEmoji.trim().length > 0);
      const centerReserve = hasCenter ? Math.floor(count * 0.28) : 0;
      const centerStart = Math.floor((count - centerReserve) / 2);
      const centerEnd = centerStart + centerReserve;

      // Helper to identify the 3 Finder Pattern Eyes (7x7 corners)
      function isFinder(r, c) {
        if (r <= 6 && c <= 6) return true; // Top-Left
        if (r <= 6 && c >= count - 7) return true; // Top-Right
        if (r >= count - 7 && c <= 6) return true; // Bottom-Left
        return false;
      }

      // Render the 3 Finder Patterns as Smooth Squircles
      function renderFinderPattern(startCol, startRow) {
        const originX = qrMarginX + startCol * moduleSize;
        const originY = qrMarginY + (count - 7 - startRow) * moduleSize;
        const outerSize = 7 * moduleSize;
        const innerSize = 3 * moduleSize;
        const rChamfer = moduleSize * 1.3;

        // Outer 7x7 squircle ring
        reliefMesh.addRoundedBox(originX, originX + outerSize, originY, originY + outerSize, rChamfer, baseThickness, totalZ);
        baseMesh.addRoundedBox(originX + moduleSize, originX + outerSize - moduleSize, originY + moduleSize, originY + outerSize - moduleSize, rChamfer * 0.7, baseThickness, totalZ + 0.05);

        // Inner 3x3 solid squircle core
        reliefMesh.addRoundedBox(originX + 2 * moduleSize, originX + 5 * moduleSize, originY + 2 * moduleSize, originY + 5 * moduleSize, moduleSize * 0.85, baseThickness, totalZ);
      }

      renderFinderPattern(0, 0); // Top-Left
      renderFinderPattern(count - 7, 0); // Top-Right
      renderFinderPattern(0, count - 7); // Bottom-Left

      // Render Data Modules with Connected Organic Ribbon Bridges
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (!matrix[r][c]) continue;
          if (isFinder(r, c)) continue; // Handled by renderFinderPattern
          if (centerReserve > 0 && r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) {
            continue;
          }

          const mx = qrMarginX + c * moduleSize;
          const my = qrMarginY + (count - 1 - r) * moduleSize;

          if (shape === 'dots') {
            const rad = moduleSize * 0.44;
            reliefMesh.addCylinder(mx + moduleSize / 2, my + moduleSize / 2, rad, baseThickness, totalZ, 12);
          } else if (shape === 'square') {
            const gap = moduleSize * 0.02;
            reliefMesh.addBox(mx + gap, mx + moduleSize - gap, my + gap, my + moduleSize - gap, baseThickness, totalZ);
          } else {
            // High-End Organic Rounded Blended Modules
            const chamfer = moduleSize * 0.32;
            reliefMesh.addRoundedBox(mx, mx + moduleSize, my, my + moduleSize, chamfer, baseThickness, totalZ);

            // Connect Right Neighbor
            if (c < count - 1 && matrix[r][c + 1] && !isFinder(r, c + 1)) {
              if (!(centerReserve > 0 && r >= centerStart && r < centerEnd && (c + 1) >= centerStart && (c + 1) < centerEnd)) {
                reliefMesh.addBox(mx + moduleSize * 0.4, mx + moduleSize * 1.6, my + moduleSize * 0.1, my + moduleSize * 0.9, baseThickness, totalZ);
              }
            }

            // Connect Bottom Neighbor
            if (r < count - 1 && matrix[r + 1][c] && !isFinder(r + 1, c)) {
              if (!(centerReserve > 0 && (r + 1) >= centerStart && (r + 1) < centerEnd && c >= centerStart && c < centerEnd)) {
                const nextY = qrMarginY + (count - 1 - (r + 1)) * moduleSize;
                reliefMesh.addBox(mx + moduleSize * 0.1, mx + moduleSize * 0.9, nextY + moduleSize * 0.4, my + moduleSize * 0.6, baseThickness, totalZ);
              }
            }
          }
        }
      }

      // 3. Center 3D Embossed Emblem / Logo (High-Precision Vector Geometry)
      if (hasCenter) {
        const qrCenterX = qrMarginX + qrAreaSize / 2;
        const qrCenterY = qrMarginY + qrAreaSize / 2;
        const badgeRadius = (centerReserve * moduleSize) * 0.54;
        const emoji = options.centerEmoji.trim();

        // Base circular pad
        baseMesh.addCylinder(qrCenterX, qrCenterY, badgeRadius + 0.9, baseThickness, baseThickness + 0.4, 28);
        // Raised outer relief border ring
        reliefMesh.addHollowCylinder(qrCenterX, qrCenterY, badgeRadius, badgeRadius - 1.1, baseThickness, totalZ + 0.25, 28);

        // High-Precision 3D Emblem Model
        if (emoji === '🍽️') {
          reliefMesh.addCutleryIcon(qrCenterX, qrCenterY, badgeRadius / 8.5, baseThickness, totalZ + 0.35);
        } else if (emoji === '⭐') {
          reliefMesh.addStar(qrCenterX, qrCenterY, badgeRadius * 0.68, badgeRadius * 0.30, baseThickness, totalZ + 0.35);
        } else if (emoji === '📶') {
          const iconR = badgeRadius * 0.65;
          reliefMesh.addCylinder(qrCenterX, qrCenterY - iconR * 0.4, iconR * 0.18, baseThickness, totalZ + 0.35, 14);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY - iconR * 0.4, iconR * 0.52, iconR * 0.36, baseThickness, totalZ + 0.35, 18);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY - iconR * 0.4, iconR * 0.88, iconR * 0.72, baseThickness, totalZ + 0.35, 20);
        } else if (emoji === '☕') {
          const s = badgeRadius / 8.0;
          // Cup body
          reliefMesh.addBox(qrCenterX - 3.8 * s, qrCenterX + 2.5 * s, qrCenterY - 3.8 * s, qrCenterY + 2.5 * s, baseThickness, totalZ + 0.35);
          // Handle
          reliefMesh.addHollowCylinder(qrCenterX + 2.5 * s, qrCenterY - 0.6 * s, 2.4 * s, 1.4 * s, baseThickness, totalZ + 0.35, 16);
          // Steam waves
          reliefMesh.addBox(qrCenterX - 2.2 * s, qrCenterX - 1.2 * s, qrCenterY + 3.2 * s, qrCenterY + 5.2 * s, baseThickness, totalZ + 0.35);
          reliefMesh.addBox(qrCenterX + 0.2 * s, qrCenterX + 1.2 * s, qrCenterY + 3.2 * s, qrCenterY + 5.2 * s, baseThickness, totalZ + 0.35);
        } else if (emoji === '📷') {
          const s = badgeRadius / 8.0;
          reliefMesh.addRoundedBox(qrCenterX - 4.5 * s, qrCenterX + 4.5 * s, qrCenterY - 3.5 * s, qrCenterY + 3.5 * s, 1.2 * s, baseThickness, totalZ + 0.35);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY, 2.6 * s, 1.6 * s, baseThickness, totalZ + 0.45, 20);
          reliefMesh.addCylinder(qrCenterX, qrCenterY, 0.9 * s, baseThickness, totalZ + 0.45, 12);
        } else if (emoji === '📍') {
          const s = badgeRadius / 8.0;
          reliefMesh.addCylinder(qrCenterX, qrCenterY + 1.2 * s, 3.8 * s, baseThickness, totalZ + 0.35, 20);
          baseMesh.addCylinder(qrCenterX, qrCenterY + 1.2 * s, 1.6 * s, baseThickness, totalZ + 0.4, 16);
          reliefMesh.addBox(qrCenterX - 1.4 * s, qrCenterX + 1.4 * s, qrCenterY - 4.5 * s, qrCenterY + 1.2 * s, baseThickness, totalZ + 0.35);
        } else if (emoji === '🛍️') {
          const s = badgeRadius / 8.0;
          reliefMesh.addRoundedBox(qrCenterX - 4.0 * s, qrCenterX + 4.0 * s, qrCenterY - 4.2 * s, qrCenterY + 2.0 * s, 1.0 * s, baseThickness, totalZ + 0.35);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY + 2.0 * s, 2.4 * s, 1.4 * s, baseThickness, totalZ + 0.35, 16);
        } else if (emoji === '🔗') {
          const s = badgeRadius / 8.0;
          reliefMesh.addHollowCylinder(qrCenterX - 1.8 * s, qrCenterY, 3.0 * s, 1.8 * s, baseThickness, totalZ + 0.35, 18);
          reliefMesh.addHollowCylinder(qrCenterX + 1.8 * s, qrCenterY, 3.0 * s, 1.8 * s, baseThickness, totalZ + 0.35, 18);
        } else {
          reliefMesh.addStar(qrCenterX, qrCenterY, badgeRadius * 0.65, badgeRadius * 0.28, baseThickness, totalZ + 0.35);
        }
      }

      // 4. Custom Top Header Text (Above QR)
      if (hasTopText) {
        const topAvailableH = topMarginY - 4;
        const topLayout = getFittedTextLayout(options.topText, plateW, topAvailableH, textScale);
        if (topLayout && topLayout.lines && topLayout.lines.length > 0) {
          const pSize = topLayout.pixelSize;
          const lCount = topLayout.lines.length;
          const lSpacing = 8.5 * pSize;
          const totalH = 7 * pSize + (lCount - 1) * lSpacing;
          
          const topMinY = qrMarginY + qrAreaSize + 2;
          const topMaxY = plateH - 2;
          const topCenterY = (topMinY + topMaxY) / 2;
          let lineTopY = topCenterY + totalH / 2;

          for (let i = 0; i < lCount; i++) {
            const line = topLayout.lines[i];
            const lineWidth = (line.length * 6 - 1) * pSize;
            const startX = (plateW - lineWidth) / 2;
            reliefMesh.addText(line, startX, lineTopY, pSize, baseThickness, totalZ);
            lineTopY -= lSpacing;
          }
        }
      }

      // 5. Custom Bottom Footer Text (Multi-Line / Renglones)
      if (options.bottomText && options.bottomText.trim().length > 0) {
        const availableHeight = (format === 'keychain') ? 11 : (qrMarginY - 4);
        const layout = getFittedTextLayout(options.bottomText, plateW, availableHeight, textScale);

        if (layout && layout.lines && layout.lines.length > 0) {
          const pixelSize = layout.pixelSize;
          const lineCount = layout.lines.length;
          const lineSpacing = 8.5 * pixelSize;
          const totalTextH = 7 * pixelSize + (lineCount - 1) * lineSpacing;

          const areaMinY = (format === 'keychain') ? 2 : 3;
          const areaMaxY = qrMarginY - 2;
          const areaCenterY = (areaMinY + areaMaxY) / 2;

          let lineTopY = areaCenterY + totalTextH / 2;

          for (let i = 0; i < lineCount; i++) {
            const line = layout.lines[i];
            const lineWidth = (line.length * 6 - 1) * pixelSize;
            const startX = (plateW - lineWidth) / 2;

            reliefMesh.addText(line, startX, lineTopY, pixelSize, baseThickness, totalZ);
            lineTopY -= lineSpacing;
          }
        }
      }

      return {
        baseMesh: {
          vertices: baseMesh.vertices,
          triangles: baseMesh.triangles
        },
        reliefMesh: {
          vertices: reliefMesh.vertices,
          triangles: reliefMesh.triangles
        },
        dimensions: {
          width: plateW,
          height: plateH,
          baseZ: baseThickness,
          reliefZ: reliefHeight,
          totalZ: totalZ
        }
      };
    }
  };

  window.GeometryBuilder = GeometryBuilder;
})(window);
