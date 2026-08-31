/**
 * QR3D Studio - Dual-Color .3MF Exporter (Pure JavaScript)
 * Generates standards-compliant .3MF files with native color definitions
 * for Bambu Studio, OrcaSlicer, PrusaSlicer and Cura without external dependencies.
 */
(function(window) {
  'use strict';

  // CRC32 Checksum table
  function getCRC32Table() {
    let table = getCRC32Table.table;
    if (!table) {
      table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
      }
      getCRC32Table.table = table;
    }
    return table;
  }

  function crc32(uint8Array) {
    const table = getCRC32Table();
    let crc = 0 ^ (-1);
    for (let i = 0; i < uint8Array.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ uint8Array[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  /**
   * Constructs an uncompressed (STORE) ZIP archive
   */
  function buildStoreZip(files) {
    const encoder = new TextEncoder();
    const fileEntries = files.map(f => {
      const nameBytes = encoder.encode(f.name);
      const dataBytes = typeof f.content === 'string' ? encoder.encode(f.content) : f.content;
      const crcVal = crc32(dataBytes);
      return {
        nameBytes: nameBytes,
        dataBytes: dataBytes,
        crc: crcVal,
        size: dataBytes.length
      };
    });

    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    for (const entry of fileEntries) {
      // Local file header (30 bytes + name + data)
      const localHeader = new Uint8Array(30 + entry.nameBytes.length + entry.size);
      const view = new DataView(localHeader.buffer);

      view.setUint32(0, 0x04034b50, true); // Local header signature
      view.setUint16(4, 20, true);         // Version needed (2.0)
      view.setUint16(6, 0x0800, true);     // General purpose flag (UTF-8)
      view.setUint16(8, 0, true);          // Compression method (0 = STORE)
      view.setUint16(10, 0, true);         // Last mod time
      view.setUint16(12, 0, true);         // Last mod date
      view.setUint32(14, entry.crc, true); // CRC-32
      view.setUint32(18, entry.size, true);// Compressed size
      view.setUint32(22, entry.size, true);// Uncompressed size
      view.setUint16(26, entry.nameBytes.length, true); // File name length
      view.setUint16(28, 0, true);         // Extra field length

      localHeader.set(entry.nameBytes, 30);
      localHeader.set(entry.dataBytes, 30 + entry.nameBytes.length);
      localHeaders.push(localHeader);

      // Central directory header (46 bytes + name)
      const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
      const cView = new DataView(centralHeader.buffer);

      cView.setUint32(0, 0x02014b50, true); // Central header signature
      cView.setUint16(4, 20, true);         // Version made by
      cView.setUint16(6, 20, true);         // Version needed
      cView.setUint16(8, 0x0800, true);     // UTF-8 flag
      cView.setUint16(10, 0, true);         // Compression: STORE
      cView.setUint16(12, 0, true);         // Time
      cView.setUint16(14, 0, true);         // Date
      cView.setUint32(16, entry.crc, true); // CRC-32
      cView.setUint32(20, entry.size, true);// Compressed size
      cView.setUint32(24, entry.size, true);// Uncompressed size
      cView.setUint16(28, entry.nameBytes.length, true);
      cView.setUint16(30, 0, true);         // Extra field length
      cView.setUint16(32, 0, true);         // Comment length
      cView.setUint16(34, 0, true);         // Disk start
      cView.setUint16(36, 0, true);         // Internal attributes
      cView.setUint32(38, 0, true);         // External attributes
      cView.setUint32(42, offset, true);    // Offset of local header

      centralHeader.set(entry.nameBytes, 46);
      centralHeaders.push(centralHeader);

      offset += localHeader.length;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) centralDirSize += ch.length;

    // End of Central Directory (22 bytes)
    const eocd = new Uint8Array(22);
    const eView = new DataView(eocd.buffer);
    eView.setUint32(0, 0x06054b50, true); // EOCD signature
    eView.setUint16(4, 0, true);          // Disk number
    eView.setUint16(6, 0, true);          // Central dir disk
    eView.setUint16(8, fileEntries.length, true);  // Disk entries
    eView.setUint16(10, fileEntries.length, true); // Total entries
    eView.setUint32(12, centralDirSize, true);     // Size of central dir
    eView.setUint32(16, centralDirOffset, true);   // Offset of central dir
    eView.setUint16(20, 0, true);                  // Comment length

    const totalLength = offset + centralDirSize + 22;
    const out = new Uint8Array(totalLength);
    let pos = 0;

    for (const lh of localHeaders) {
      out.set(lh, pos);
      pos += lh.length;
    }
    for (const ch of centralHeaders) {
      out.set(ch, pos);
      pos += ch.length;
    }
    out.set(eocd, pos);

    return out;
  }

  function formatHexColor(color) {
    if (!color) return '#FFFFFF';
    let hex = color.trim().toUpperCase();
    if (!hex.startsWith('#')) hex = '#' + hex;
    return hex;
  }

  function meshToXML(mesh) {
    let vertXML = '<vertices>\n';
    for (let i = 0; i < mesh.vertices.length; i++) {
      const v = mesh.vertices[i];
      vertXML += `      <vertex x="${v[0].toFixed(3)}" y="${v[1].toFixed(3)}" z="${v[2].toFixed(3)}"/>\n`;
    }
    vertXML += '    </vertices>\n';

    let triXML = '    <triangles>\n';
    for (let i = 0; i < mesh.triangles.length; i++) {
      const t = mesh.triangles[i];
      triXML += `      <triangle v1="${t[0]}" v2="${t[1]}" v3="${t[2]}"/>\n`;
    }
    triXML += '    </triangles>';

    return vertXML + triXML;
  }

  const ThreeMFExporter = {
    /**
     * Exports dual-color 3MF Blob from baseMesh and reliefMesh
     */
    generate3MF: function(modelData, options) {
      const baseColor = formatHexColor(options.baseColor || '#FFFFFF');
      const reliefColor = formatHexColor(options.reliefColor || '#111827');

      const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

      const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

      const baseMeshXML = meshToXML(modelData.baseMesh);
      const reliefMeshXML = meshToXML(modelData.reliefMesh);

      const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="es-ES"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <metadata name="Title">QR3D Model - Dual Color</metadata>
  <metadata name="Designer">QR3D Studio</metadata>
  <resources>
    <!-- Multi-Color Group Definition -->
    <m:colorgroup id="1">
      <m:color color="${baseColor}"/>
      <m:color color="${reliefColor}"/>
    </m:colorgroup>

    <!-- Part 1: Base Plate Body (Filament 1 / Base Color) -->
    <object id="2" type="model" pid="1" pindex="0" name="QR3D_Base_Color">
      <mesh>
    ${baseMeshXML}
      </mesh>
    </object>

    <!-- Part 2: QR & Text Relief Body (Filament 2 / Relief Color) -->
    <object id="3" type="model" pid="1" pindex="1" name="QR3D_Relief_Color">
      <mesh>
    ${reliefMeshXML}
      </mesh>
    </object>

    <!-- Root Multi-Material Assembly Object -->
    <object id="1" type="model" name="QR3D_Complete_Assembly">
      <components>
        <component objectid="2"/>
        <component objectid="3"/>
      </components>
    </object>
  </resources>

  <build>
    <item objectid="1"/>
  </build>
</model>`;

      const zipBytes = buildStoreZip([
        { name: '[Content_Types].xml', content: contentTypesXml },
        { name: '_rels/.rels', content: relsXml },
        { name: '3D/3dmodel.model', content: modelXml }
      ]);

      return new Blob([zipBytes], { type: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml' });
    }
  };

  window.ThreeMFExporter = ThreeMFExporter;
})(window);
