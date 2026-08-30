/**
 * QR3D Studio - 3D Geometry Builder
 * Generates solid, manifold 3D meshes for 3D printing:
 * - Stand (Soporte de mesa)
 * - Keychain (Llavero con anilla)
 * - Plaque (Placa plana)
 * - Magnetic (Placa con cajeados para imanes de neodimio)
 * - Countersunk (Placa con agujeros avellanados para tornillos)
 * Supports dynamic base thickness, relief height, and intelligent auto-scaling/auto-wrapping 3D text.
 */
(function(window) {
  'use strict';

  // Basic 5x7 Dot-Matrix Font for clean 3D extruded lettering on 3D prints
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
    'B': [0x7F,0x49,0x49,0x49,0x36],
    'C': [0x3E,0x41,0x41,0x41,0x22],
    'D': [0x7F,0x41,0x41,0x22,0x1C],
    'E': [0x7F,0x49,0x49,0x49,0x41],
    'F': [0x7F,0x09,0x09,0x09,0x01],
    'G': [0x3E,0x41,0x49,0x49,0x7A],
    'H': [0x7F,0x08,0x08,0x08,0x7F],
    'I': [0x00,0x41,0x7F,0x41,0x00],
    'J': [0x20,0x40,0x41,0x3F,0x01],
    'K': [0x7F,0x08,0x14,0x22,0x41],
    'L': [0x7F,0x40,0x40,0x40,0x40],
    'M': [0x7F,0x02,0x0C,0x02,0x7F],
    'N': [0x7F,0x04,0x08,0x10,0x7F],
    'O': [0x3E,0x41,0x41,0x41,0x3E],
    'P': [0x7F,0x09,0x09,0x09,0x06],
    'Q': [0x3E,0x41,0x51,0x21,0x5E],
    'R': [0x7F,0x09,0x19,0x29,0x46],
    'S': [0x46,0x49,0x49,0x49,0x31],
    'T': [0x01,0x01,0x7F,0x01,0x01],
    'U': [0x3F,0x40,0x40,0x40,0x3F],
    'V': [0x1F,0x20,0x40,0x20,0x1F],
    'W': [0x3F,0x40,0x38,0x40,0x3F],
    'X': [0x63,0x14,0x08,0x14,0x63],
    'Y': [0x07,0x08,0x70,0x08,0x07],
    'Z': [0x61,0x51,0x49,0x45,0x43]
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
      const v0 = this.addVertex(xMin, yMin, zMin);
      const v1 = this.addVertex(xMax, yMin, zMin);
      const v2 = this.addVertex(xMax, yMax, zMin);
      const v3 = this.addVertex(xMin, yMax, zMin);

      const v4 = this.addVertex(xMin, yMin, zMax);
      const v5 = this.addVertex(xMax, yMin, zMax);
      const v6 = this.addVertex(xMax, yMax, zMax);
      const v7 = this.addVertex(xMin, yMax, zMax);

      // Bottom face (zMin)
      this.addQuad(v0, v3, v2, v1);
      // Top face (zMax)
      this.addQuad(v4, v5, v6, v7);
      // Front face (yMin)
      this.addQuad(v0, v1, v5, v4);
      // Back face (yMax)
      this.addQuad(v2, v3, v7, v6);
      // Left face (xMin)
      this.addQuad(v3, v0, v4, v7);
      // Right face (xMax)
      this.addQuad(v1, v2, v6, v5);
    }

    /**
     * Adds an 8-sided chamfered / rounded rectangular prism
     */
    addRoundedBox(xMin, xMax, yMin, yMax, chamfer, zMin, zMax) {
      const c = Math.min(chamfer, (xMax - xMin) * 0.35);
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
      const botRing = [];
      const topRing = [];

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
     * Adds a 3D extruded 5-pointed star
     */
    addStar(cx, cy, rOuter, rInner, zMin, zMax) {
      const points = 5;
      const botVerts = [];
      const topVerts = [];

      for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? rOuter : rInner;
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        botVerts.push(this.addVertex(x, y, zMin));
        topVerts.push(this.addVertex(x, y, zMax));
      }

      const botCenter = this.addVertex(cx, cy, zMin);
      const topCenter = this.addVertex(cx, cy, zMax);
      const n = points * 2;

      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        this.addTriangle(botCenter, botVerts[next], botVerts[i]);
        this.addTriangle(topCenter, topVerts[i], topVerts[next]);
        this.addQuad(botVerts[i], botVerts[next], topVerts[next], topVerts[i]);
      }
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

  function getFittedTextLayout(text, plateW, availableHeight) {
    const clean = (text || '').trim();
    if (!clean) return null;

    const marginX = 4;
    const maxW = plateW - marginX * 2;

    // Single line calculation
    const singleCols = clean.length * 6 - 1;
    let singleSize = Math.min(maxW / singleCols, availableHeight / 8.5, 0.95);

    // If single line requires small font (< 0.65mm) and text has multiple words, split onto 2 lines
    if (singleSize < 0.65 && clean.includes(' ') && availableHeight >= 14) {
      const idealPerLine = Math.ceil(clean.length / 2);
      const lines = splitIntoLines(clean, idealPerLine + 2);
      
      if (lines.length > 1) {
        let maxCols = 0;
        for (const l of lines) maxCols = Math.max(maxCols, l.length * 6 - 1);
        
        const lineCount = lines.length;
        const multiSize = Math.min(maxW / maxCols, availableHeight / (lineCount * 8.5), 0.85);
        
        if (multiSize > singleSize) {
          return {
            lines: lines,
            pixelSize: multiSize
          };
        }
      }
    }

    return {
      lines: [clean],
      pixelSize: singleSize
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
      const shape = options.moduleShape || 'square'; // 'square', 'rounded', 'dots'

      // Base dimensions based on format
      let plateW = 72;
      let plateH = 90;
      let qrAreaSize = 58;
      let qrMarginX = 7;
      let qrMarginY = 24;

      if (format === 'keychain') {
        plateW = 46;
        plateH = 58;
        qrAreaSize = 38;
        qrMarginX = 4;
        qrMarginY = 14;
      } else if (format === 'plaque' || format === 'magnetic' || format === 'countersunk') {
        plateW = 75;
        plateH = 92;
        qrAreaSize = 60;
        qrMarginX = 7.5;
        qrMarginY = 24;
      }

      // 1. Build Base Mesh according to selected format
      if (format === 'keychain') {
        // Keychain: Main plate + Ring tab
        baseMesh.addBox(0, plateW, 0, plateH, 0, baseThickness);
        const ringCenterX = plateW / 2;
        const ringCenterY = plateH + 7;
        const ringOuterR = 7;
        const ringInnerR = 3.5;
        baseMesh.addHollowCylinder(ringCenterX, ringCenterY, ringOuterR, ringInnerR, 0, baseThickness, 24);
        baseMesh.addBox(ringCenterX - ringOuterR, ringCenterX + ringOuterR, plateH - 2, plateH + 2, 0, baseThickness);
      } else if (format === 'stand') {
        // Desk Stand: Front plate + integrated angled rear kickstand foot
        baseMesh.addBox(0, plateW, 0, plateH, 0, baseThickness);
        const footLength = 32;
        const legWidth = 14;
        baseMesh.addBox(8, 8 + legWidth, 0, footLength, -footLength * 0.35, 0);
        baseMesh.addBox(plateW - 8 - legWidth, plateW - 8, 0, footLength, -footLength * 0.35, 0);
        baseMesh.addBox(8, plateW - 8, 0, 8, -footLength * 0.35, 0);
      } else if (format === 'magnetic') {
        // Magnetic Fridge Plate: Flat plate with 4 rear pockets for 6x2mm neodymium magnets
        baseMesh.addBox(0, plateW, 0, plateH, 0, baseThickness);
        const borderWidth = 2.0;
        baseMesh.addBox(0, plateW, 0, borderWidth, baseThickness, baseThickness + 0.5);
        baseMesh.addBox(0, plateW, plateH - borderWidth, plateH, baseThickness, baseThickness + 0.5);
        baseMesh.addBox(0, borderWidth, 0, plateH, baseThickness, baseThickness + 0.5);
        baseMesh.addBox(plateW - borderWidth, plateW, 0, plateH, baseThickness, baseThickness + 0.5);

        const magR = 3.3;
        const magMargin = 9;
        baseMesh.addHollowCylinder(magMargin, magMargin, magR + 1.2, magR, -1.8, 0, 18);
        baseMesh.addHollowCylinder(plateW - magMargin, magMargin, magR + 1.2, magR, -1.8, 0, 18);
        baseMesh.addHollowCylinder(magMargin, plateH - magMargin, magR + 1.2, magR, -1.8, 0, 18);
        baseMesh.addHollowCylinder(plateW - magMargin, plateH - magMargin, magR + 1.2, magR, -1.8, 0, 18);
      } else if (format === 'countersunk') {
        // Plaque with 4 Countersunk Screw Holes (M3/M4 flush mount)
        baseMesh.addBox(0, plateW, 0, plateH, 0, baseThickness);
        const borderWidth = 2.0;
        baseMesh.addBox(0, plateW, 0, borderWidth, baseThickness, baseThickness + 0.5);
        baseMesh.addBox(0, plateW, plateH - borderWidth, plateH, baseThickness, baseThickness + 0.5);
        baseMesh.addBox(0, borderWidth, 0, plateH, baseThickness, baseThickness + 0.5);
        baseMesh.addBox(plateW - borderWidth, plateW, 0, plateH, baseThickness, baseThickness + 0.5);

        const holeR = 2.1;
        const chamferR = 3.8;
        const screwMargin = 6.5;
        baseMesh.addHollowCylinder(screwMargin, screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
        baseMesh.addHollowCylinder(plateW - screwMargin, screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
        baseMesh.addHollowCylinder(screwMargin, plateH - screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
        baseMesh.addHollowCylinder(plateW - screwMargin, plateH - screwMargin, chamferR, holeR, baseThickness, baseThickness + 0.6, 18);
      } else {
        // Standard Wall Plaque
        baseMesh.addBox(0, plateW, 0, plateH, 0, baseThickness);
        const borderWidth = 2.5;
        baseMesh.addBox(0, plateW, 0, borderWidth, baseThickness, baseThickness + 0.6);
        baseMesh.addBox(0, plateW, plateH - borderWidth, plateH, baseThickness, baseThickness + 0.6);
        baseMesh.addBox(0, borderWidth, 0, plateH, baseThickness, baseThickness + 0.6);
        baseMesh.addBox(plateW - borderWidth, plateW, 0, plateH, baseThickness, baseThickness + 0.6);
      }

      // 2. Build Relief Geometry (QR modules + Center Emblem + Bottom Text)
      const matrixObj = options.matrixObj || window.QRGenerator.generateMatrix(options.text, options.centerEmoji ? 'H' : 'Q');
      const matrix = matrixObj.matrix;
      const count = matrixObj.size;
      const moduleSize = qrAreaSize / count;

      const hasCenter = Boolean(options.centerEmoji && options.centerEmoji.trim().length > 0);
      const centerReserve = hasCenter ? Math.floor(count * 0.28) : 0;
      const centerStart = Math.floor((count - centerReserve) / 2);
      const centerEnd = centerStart + centerReserve;

      // Extrude QR dark modules with selected shape
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (!matrix[r][c]) continue;
          if (centerReserve > 0 && r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) {
            continue;
          }

          const mx = qrMarginX + c * moduleSize;
          const my = qrMarginY + (count - 1 - r) * moduleSize;

          if (shape === 'dots') {
            const rad = moduleSize * 0.44;
            reliefMesh.addCylinder(mx + moduleSize / 2, my + moduleSize / 2, rad, baseThickness, totalZ, 12);
          } else if (shape === 'rounded') {
            const chamfer = moduleSize * 0.28;
            reliefMesh.addRoundedBox(mx, mx + moduleSize, my, my + moduleSize, chamfer, baseThickness, totalZ);
          } else {
            const gap = moduleSize * 0.03;
            reliefMesh.addBox(mx + gap, mx + moduleSize - gap, my + gap, my + moduleSize - gap, baseThickness, totalZ);
          }
        }
      }

      // 3. Center 3D Embossed Emblem / Logo
      if (hasCenter) {
        const qrCenterX = qrMarginX + qrAreaSize / 2;
        const qrCenterY = qrMarginY + qrAreaSize / 2;
        const badgeRadius = (centerReserve * moduleSize) * 0.54;
        const emoji = options.centerEmoji.trim();

        // Base circular pad
        baseMesh.addCylinder(qrCenterX, qrCenterY, badgeRadius + 0.8, baseThickness, baseThickness + 0.35, 24);
        // Raised outer relief border ring
        reliefMesh.addHollowCylinder(qrCenterX, qrCenterY, badgeRadius, badgeRadius - 1.0, baseThickness, totalZ + 0.25, 24);

        // 3D Embossed Icon
        if (emoji === '⭐') {
          reliefMesh.addStar(qrCenterX, qrCenterY, badgeRadius * 0.65, badgeRadius * 0.28, baseThickness, totalZ + 0.35);
        } else if (emoji === '🍽️') {
          const iconR = badgeRadius * 0.55;
          reliefMesh.addBox(qrCenterX - iconR * 0.7, qrCenterX - iconR * 0.45, qrCenterY - iconR * 0.8, qrCenterY + iconR * 0.1, baseThickness, totalZ + 0.35);
          reliefMesh.addBox(qrCenterX - iconR * 0.85, qrCenterX - iconR * 0.3, qrCenterY + iconR * 0.1, qrCenterY + iconR * 0.8, baseThickness, totalZ + 0.35);
          reliefMesh.addBox(qrCenterX + iconR * 0.45, qrCenterX + iconR * 0.7, qrCenterY - iconR * 0.8, qrCenterY + iconR * 0.8, baseThickness, totalZ + 0.35);
        } else if (emoji === '📶') {
          const iconR = badgeRadius * 0.65;
          reliefMesh.addCylinder(qrCenterX, qrCenterY - iconR * 0.4, iconR * 0.16, baseThickness, totalZ + 0.35, 12);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY - iconR * 0.4, iconR * 0.5, iconR * 0.36, baseThickness, totalZ + 0.35, 16);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY - iconR * 0.4, iconR * 0.85, iconR * 0.71, baseThickness, totalZ + 0.35, 18);
        } else if (emoji === '☕') {
          const iconR = badgeRadius * 0.55;
          reliefMesh.addBox(qrCenterX - iconR * 0.6, qrCenterX + iconR * 0.4, qrCenterY - iconR * 0.6, qrCenterY + iconR * 0.4, baseThickness, totalZ + 0.35);
          reliefMesh.addBox(qrCenterX + iconR * 0.35, qrCenterX + iconR * 0.75, qrCenterY - iconR * 0.3, qrCenterY + iconR * 0.2, baseThickness, totalZ + 0.35);
        } else if (emoji === '📷') {
          const iconR = badgeRadius * 0.55;
          reliefMesh.addBox(qrCenterX - iconR * 0.75, qrCenterX + iconR * 0.75, qrCenterY - iconR * 0.5, qrCenterY + iconR * 0.4, baseThickness, totalZ + 0.35);
          reliefMesh.addCylinder(qrCenterX, qrCenterY, iconR * 0.32, baseThickness, totalZ + 0.45, 16);
        } else if (emoji === '📍') {
          const iconR = badgeRadius * 0.55;
          reliefMesh.addCylinder(qrCenterX, qrCenterY + iconR * 0.2, iconR * 0.5, baseThickness, totalZ + 0.35, 16);
          reliefMesh.addBox(qrCenterX - iconR * 0.25, qrCenterX + iconR * 0.25, qrCenterY - iconR * 0.7, qrCenterY + iconR * 0.2, baseThickness, totalZ + 0.35);
        } else if (emoji === '🛍️') {
          const iconR = badgeRadius * 0.55;
          reliefMesh.addBox(qrCenterX - iconR * 0.65, qrCenterX + iconR * 0.65, qrCenterY - iconR * 0.7, qrCenterY + iconR * 0.3, baseThickness, totalZ + 0.35);
          reliefMesh.addHollowCylinder(qrCenterX, qrCenterY + iconR * 0.3, iconR * 0.35, iconR * 0.22, baseThickness, totalZ + 0.35, 16);
        } else if (emoji === '🔗') {
          const iconR = badgeRadius * 0.55;
          reliefMesh.addHollowCylinder(qrCenterX - iconR * 0.25, qrCenterY, iconR * 0.45, iconR * 0.25, baseThickness, totalZ + 0.35, 16);
          reliefMesh.addHollowCylinder(qrCenterX + iconR * 0.25, qrCenterY, iconR * 0.45, iconR * 0.25, baseThickness, totalZ + 0.35, 16);
        } else {
          reliefMesh.addStar(qrCenterX, qrCenterY, badgeRadius * 0.58, badgeRadius * 0.26, baseThickness, totalZ + 0.35);
        }
      }

      // 4. Custom Bottom Text with Intelligent Auto-Fitting & Auto-Centering
      if (options.bottomText && options.bottomText.trim().length > 0) {
        const availableHeight = (format === 'keychain') ? 11 : (qrMarginY - 4);
        const layout = getFittedTextLayout(options.bottomText, plateW, availableHeight);

        if (layout && layout.lines && layout.lines.length > 0) {
          const pixelSize = layout.pixelSize;
          const lineCount = layout.lines.length;
          const lineSpacing = 8.5 * pixelSize;
          const totalTextH = 7 * pixelSize + (lineCount - 1) * lineSpacing;

          const areaMinY = (format === 'keychain') ? 2 : 3;
          const areaMaxY = (format === 'keychain') ? (qrMarginY - 2) : (qrMarginY - 2);
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
