/**
 * QR3D Studio - QR Code Engine (Pure JavaScript)
 * Standard Reed-Solomon QR Code Generator supporting Modes: Numeric, Alphanumeric, Byte
 * and Error Correction Levels (L, M, Q, H).
 */
(function(window) {
  'use strict';

  // Galois Field & Math tables for QR polynomial calculation
  const QRMath = {
    glog: function(n) {
      if (n < 1) throw new Error("glog(" + n + ")");
      return QRMath.LOG_TABLE[n];
    },
    gexp: function(n) {
      while (n < 0) n += 255;
      while (n >= 256) n -= 255;
      return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
  };

  for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
  for (let i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  }
  for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

  function QRPolynomial(num, shift) {
    if (num.length === undefined) throw new Error(num.length + "/" + shift);
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
    for (let i = num.length - offset; i < this.num.length; i++) this.num[i] = 0;
  }

  QRPolynomial.prototype = {
    get: function(index) { return this.num[index] || 0; },
    getLength: function() { return this.num.length; },
    multiply: function(e) {
      const num = new Array(this.getLength() + e.getLength() - 1);
      for (let k = 0; k < num.length; k++) num[k] = 0;
      for (let i = 0; i < this.getLength(); i++) {
        const vi = this.get(i);
        if (vi === 0) continue;
        for (let j = 0; j < e.getLength(); j++) {
          const vj = e.get(j);
          if (vj === 0) continue;
          num[i + j] ^= QRMath.gexp(QRMath.glog(vi) + QRMath.glog(vj));
        }
      }
      return new QRPolynomial(num, 0);
    },
    mod: function(e) {
      if (this.getLength() - e.getLength() < 0) return this;
      const num = new Array(this.getLength());
      for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
      
      const v0 = this.get(0);
      const e0 = e.get(0);
      if (v0 === 0) return new QRPolynomial(num, 0);
      
      const ratio = QRMath.glog(v0) - QRMath.glog(e0);
      for (let i = 0; i < e.getLength(); i++) {
        const vi = e.get(i);
        if (vi !== 0) {
          num[i] ^= QRMath.gexp(QRMath.glog(vi) + ratio);
        }
      }
      return new QRPolynomial(num, 0).mod(e);
    }
  };

  const QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
  const QRMaskPattern = {
    PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3,
    PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7
  };

  const QRRSBlock = {
    RS_BLOCK_TABLE: [
      [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], // V1
      [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], // V2
      [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], // V3
      [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],  // V4
      [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], // V5
      [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], // V6
      [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], // V7
      [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], // V8
      [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], // V9
      [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16] // V10
    ],
    getRSBlocks: function(typeNumber, errorCorrectLevel) {
      const rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
      if (!rsBlock) throw new Error("Bad RS block @ type: " + typeNumber);
      const length = rsBlock.length / 3;
      const list = [];
      for (let i = 0; i < length; i++) {
        const count = rsBlock[i * 3 + 0];
        const totalCount = rsBlock[i * 3 + 1];
        const dataCount = rsBlock[i * 3 + 2];
        for (let j = 0; j < count; j++) {
          list.push({ totalCount: totalCount, dataCount: dataCount });
        }
      }
      return list;
    },
    getRsBlockTable: function(typeNumber, errorCorrectLevel) {
      switch (errorCorrectLevel) {
        case QRErrorCorrectLevel.L: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
        case QRErrorCorrectLevel.M: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
        case QRErrorCorrectLevel.Q: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
        case QRErrorCorrectLevel.H: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
        default: return undefined;
      }
    }
  };

  function QRBitBuffer() {
    this.buffer = [];
    this.length = 0;
  }
  QRBitBuffer.prototype = {
    get: function(index) {
      const bufIndex = Math.floor(index / 8);
      return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1;
    },
    put: function(num, length) {
      for (let i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    },
    getLengthInBits: function() { return this.length; },
    putBit: function(bit) {
      const bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) this.buffer.push(0);
      if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      this.length++;
    }
  };

  const QR8BitByte = function(data) {
    this.mode = 4;
    this.data = data;
    this.parsedData = [];
    for (let i = 0; i < this.data.length; i++) {
      const c = this.data.charCodeAt(i);
      if (c < 128) {
        this.parsedData.push(c);
      } else if (c < 2048) {
        this.parsedData.push((c >> 6) | 192);
        this.parsedData.push((c & 63) | 128);
      } else {
        this.parsedData.push((c >> 12) | 224);
        this.parsedData.push(((c >> 6) & 63) | 128);
        this.parsedData.push((c & 63) | 128);
      }
    }
  };
  QR8BitByte.prototype = {
    getLength: function() { return this.parsedData.length; },
    write: function(buffer) {
      for (let i = 0; i < this.parsedData.length; i++) {
        buffer.put(this.parsedData[i], 8);
      }
    }
  };

  function QRCodeModel(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  QRCodeModel.prototype = {
    addData: function(data) {
      const newData = new QR8BitByte(data);
      this.dataList.push(newData);
      this.dataCache = null;
    },
    isDark: function(row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        return false;
      }
      return this.modules[row][col] || false;
    },
    getModuleCount: function() { return this.moduleCount; },
    make: function() {
      if (this.typeNumber < 1) {
        let typeNumber = 1;
        for (; typeNumber < 10; typeNumber++) {
          const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
          const buffer = new QRBitBuffer();
          let totalDataCount = 0;
          for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
          for (let i = 0; i < this.dataList.length; i++) {
            const data = this.dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.getLength(), typeNumber >= 10 ? 16 : 8);
            data.write(buffer);
          }
          if (buffer.getLengthInBits() <= totalDataCount * 8) break;
        }
        this.typeNumber = typeNumber;
      }
      this.makeImpl(false, this.getBestMaskPattern());
    },
    makeImpl: function(test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);
      for (let row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);
        for (let col = 0; col < this.moduleCount; col++) {
          this.modules[row][col] = null;
        }
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(test, maskPattern);
      if (this.typeNumber >= 7) this.setupTypeNumber(test);
      if (this.dataCache == null) {
        this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
      }
      this.mapData(this.dataCache, maskPattern);
    },
    setupPositionProbePattern: function(row, col) {
      for (let r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r) continue;
        for (let c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c) continue;
          if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
              (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
              (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    },
    getBestMaskPattern: function() {
      let minLostPoint = 0;
      let pattern = 0;
      for (let i = 0; i < 8; i++) {
        this.makeImpl(true, i);
        const lostPoint = QRCodeModel.getLostPoint(this);
        if (i === 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }
      return pattern;
    },
    setupTimingPattern: function() {
      for (let r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] !== null) continue;
        this.modules[r][6] = (r % 2 === 0);
      }
      for (let c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c] !== null) continue;
        this.modules[6][c] = (c % 2 === 0);
      }
    },
    setupPositionAdjustPattern: function() {
      const pos = QRCodeModel.getPatternPosition(this.typeNumber);
      for (let i = 0; i < pos.length; i++) {
        for (let j = 0; j < pos.length; j++) {
          const row = pos[i];
          const col = pos[j];
          if (this.modules[row][col] !== null) continue;
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    },
    setupTypeInfo: function(test, maskPattern) {
      const data = (this.errorCorrectLevel << 3) | maskPattern;
      const bits = QRCodeModel.getBCHTypeInfo(data);
      for (let i = 0; i < 15; i++) {
        const mod = (!test && ((bits >> i) & 1) === 1);
        if (i < 6) this.modules[i][8] = mod;
        else if (i < 8) this.modules[i + 1][8] = mod;
        else this.modules[this.moduleCount - 15 + i][8] = mod;

        if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod;
        else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
        else this.modules[8][15 - i - 1] = mod;
      }
      this.modules[this.moduleCount - 8][8] = (!test);
    },
    setupTypeNumber: function(test) {
      const bits = QRCodeModel.getBCHTypeNumber(this.typeNumber);
      for (let i = 0; i < 18; i++) {
        const mod = (!test && ((bits >> i) & 1) === 1);
        this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
        this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    },
    mapData: function(data, maskPattern) {
      let inc = -1;
      let row = this.moduleCount - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (this.modules[row][col - c] === null) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
              }
              const mask = QRCodeModel.getMask(maskPattern, row, col - c);
              if (mask) dark = !dark;
              this.modules[row][col - c] = dark;
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
  };

  QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
    const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new QRBitBuffer();
    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), typeNumber >= 10 ? 16 : 8);
      data.write(buffer);
    }
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error("Code length overflow.");
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
    while (buffer.getLengthInBits() % 8 !== 0) buffer.putBit(false);
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xEC, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
  };

  QRCodeModel.createBytes = function(buffer, rsBlocks) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcdata = new Array(rsBlocks.length);
    const ecdata = new Array(rsBlocks.length);
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;
      const rsPoly = QRCodeModel.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
      }
    }
    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
    const data = new Array(totalCodeCount);
    let index = 0;
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) data[index++] = dcdata[r][i];
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) data[index++] = ecdata[r][i];
      }
    }
    return data;
  };

  QRCodeModel.getErrorCorrectPolynomial = function(errorCorrectLength) {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  };

  QRCodeModel.getPatternPosition = function(typeNumber) {
    const PATTERN_POSITION_TABLE = [
      [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
      [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]
    ];
    return PATTERN_POSITION_TABLE[typeNumber - 1] || [];
  };

  QRCodeModel.getMask = function(maskPattern, i, j) {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000: return (i + j) % 2 === 0;
      case QRMaskPattern.PATTERN001: return i % 2 === 0;
      case QRMaskPattern.PATTERN010: return j % 3 === 0;
      case QRMaskPattern.PATTERN011: return (i + j) % 3 === 0;
      case QRMaskPattern.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case QRMaskPattern.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0;
      case QRMaskPattern.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0;
      case QRMaskPattern.PATTERN111: return ((i * j) % 3 + (i + j) % 2) === 0;
      default: throw new Error("bad maskPattern:" + maskPattern);
    }
  };

  QRCodeModel.getLostPoint = function(qrCode) {
    const moduleCount = qrCode.getModuleCount();
    let lostPoint = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameCount = 0;
        const dark = qrCode.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            if (dark === qrCode.isDark(row + r, col + c)) sameCount++;
          }
        }
        if (sameCount > 5) lostPoint += (3 + sameCount - 5);
      }
    }
    return lostPoint;
  };

  QRCodeModel.getBCHTypeInfo = function(data) {
    let d = data << 10;
    while (QRCodeModel.getBCHDigit(d) - QRCodeModel.getBCHDigit(1335) >= 0) {
      d ^= (1335 << (QRCodeModel.getBCHDigit(d) - QRCodeModel.getBCHDigit(1335)));
    }
    return ((data << 10) | d) ^ 21522;
  };

  QRCodeModel.getBCHTypeNumber = function(data) {
    let d = data << 12;
    while (QRCodeModel.getBCHDigit(d) - QRCodeModel.getBCHDigit(7973) >= 0) {
      d ^= (7973 << (QRCodeModel.getBCHDigit(d) - QRCodeModel.getBCHDigit(7973)));
    }
    return (data << 12) | d;
  };

  QRCodeModel.getBCHDigit = function(data) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  };

  /**
   * Main Generator Class
   */
  const QRGenerator = {
    generateMatrix: function(text, ecLevelStr) {
      const ecLevel = QRErrorCorrectLevel[ecLevelStr || 'H'] !== undefined ?
                      QRErrorCorrectLevel[ecLevelStr || 'H'] : QRErrorCorrectLevel.H;
      const qr = new QRCodeModel(0, ecLevel);
      qr.addData(text || "https://ejemplo.com");
      qr.make();
      const count = qr.getModuleCount();
      const matrix = [];
      for (let r = 0; r < count; r++) {
        const row = [];
        for (let c = 0; c < count; c++) {
          row.push(qr.isDark(r, c));
        }
        matrix.push(row);
      }
      return {
        matrix: matrix,
        size: count,
        isDark: (r, c) => matrix[r][c]
      };
    },

    /**
     * Renders QR to a 2D HTML Canvas with High-DPI support
     */
    renderCanvas: function(canvas, options) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const matrixObj = options.matrixObj || this.generateMatrix(options.text, options.centerEmoji ? 'H' : 'Q');
      const matrix = matrixObj.matrix;
      const count = matrixObj.size;
      const size = options.canvasSize || 512;
      const marginModules = options.marginModules !== undefined ? options.marginModules : 3;
      const totalModules = count + marginModules * 2;
      const moduleSize = size / totalModules;

      // Set canvas physical resolution
      canvas.width = size;
      canvas.height = size;

      // Fill background
      ctx.fillStyle = options.bgColor || '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Render modules
      ctx.fillStyle = options.fgColor || '#111827';
      const shape = options.shape || 'square'; // 'square', 'rounded', 'dots'

      const hasCenter = Boolean(options.centerEmoji && options.centerEmoji.trim().length > 0);
      const centerReserve = hasCenter ? Math.floor(count * 0.28) : 0;
      const centerStart = Math.floor((count - centerReserve) / 2);
      const centerEnd = centerStart + centerReserve;

      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (!matrix[r][c]) continue;

          // Check if in center reserved zone
          if (centerReserve > 0 && r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) {
            continue;
          }

          const x = (c + marginModules) * moduleSize;
          const y = (r + marginModules) * moduleSize;

          if (shape === 'dots') {
            // Circular Dots
            ctx.beginPath();
            ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else if (shape === 'rounded') {
            // Smooth Rounded Rectangles
            const rad = moduleSize * 0.35;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, moduleSize, moduleSize, rad);
            } else {
              ctx.rect(x, y, moduleSize, moduleSize);
            }
            ctx.fill();
          } else {
            // Classic Sharp Squares
            ctx.fillRect(x, y, moduleSize, moduleSize);
          }
        }
      }

      // Draw Center Logo / Emoji Badge if present
      if (hasCenter) {
        const cx = size / 2;
        const cy = size / 2;
        const boxSize = centerReserve * moduleSize;
        const radius = boxSize * 0.56;

        // Base badge background circle
        ctx.fillStyle = options.bgColor || '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border ring in contrast color
        ctx.strokeStyle = options.fgColor || '#111827';
        ctx.lineWidth = Math.max(3, moduleSize * 0.35);
        ctx.stroke();

        // Render center emoji character
        const fontSize = Math.floor(radius * 1.15);
        ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(options.centerEmoji.trim(), cx, cy + fontSize * 0.06);
      }

      return canvas;
    },

    /**
     * Generates an SVG string representation
     */
    generateSVG: function(options) {
      const matrixObj = options.matrixObj || this.generateMatrix(options.text, options.centerEmoji ? 'H' : 'Q');
      const matrix = matrixObj.matrix;
      const count = matrixObj.size;
      const margin = 3;
      const total = count + margin * 2;
      const scale = 12;
      const svgSize = total * scale;

      const hasCenter = Boolean(options.centerEmoji && options.centerEmoji.trim().length > 0);
      const centerReserve = hasCenter ? Math.floor(count * 0.28) : 0;
      const centerStart = Math.floor((count - centerReserve) / 2);
      const centerEnd = centerStart + centerReserve;

      let paths = '';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (!matrix[r][c]) continue;
          if (centerReserve > 0 && r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) continue;
          const x = (c + margin) * scale;
          const y = (r + margin) * scale;
          if (options.shape === 'dots') {
            paths += `<circle cx="${(x + scale / 2).toFixed(1)}" cy="${(y + scale / 2).toFixed(1)}" r="${(scale * 0.45).toFixed(1)}" fill="${options.fgColor || '#111827'}"/>`;
          } else if (options.shape === 'rounded') {
            paths += `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" rx="${(scale * 0.35).toFixed(1)}" fill="${options.fgColor || '#111827'}"/>`;
          } else {
            paths += `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" fill="${options.fgColor || '#111827'}"/>`;
          }
        }
      }

      let emojiSvg = '';
      if (hasCenter) {
        const cx = svgSize / 2;
        const cy = svgSize / 2;
        const r = (centerReserve * scale) * 0.56;
        emojiSvg = `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="${options.bgColor || '#FFFFFF'}" stroke="${options.fgColor || '#111827'}" stroke-width="${Math.max(2, scale * 0.3).toFixed(1)}"/>` +
                   `<text x="${cx}" y="${(cy + r * 0.35).toFixed(1)}" font-size="${(r * 1.15).toFixed(1)}" text-anchor="middle" font-family="'Apple Color Emoji', 'Segoe UI Emoji', sans-serif">${options.centerEmoji.trim()}</text>`;
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
  <rect width="100%" height="100%" fill="${options.bgColor || '#FFFFFF'}"/>
  ${paths}
  ${emojiSvg}
</svg>`;
    }
  };

  window.QRGenerator = QRGenerator;
})(window);
