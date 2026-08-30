/**
 * QR3D Studio - Binary STL Exporter (Pure JavaScript)
 * Merges base and relief meshes into standard IEEE 754 Binary STL
 * for universal 3D printer and slicer compatibility.
 */
(function(window) {
  'use strict';

  function computeFaceNormal(v1, v2, v3) {
    const ax = v2[0] - v1[0], ay = v2[1] - v1[1], az = v2[2] - v1[2];
    const bx = v3[0] - v1[0], by = v3[1] - v1[1], bz = v3[2] - v1[2];
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    const len = Math.hypot(nx, ny, nz) || 1;
    return [nx / len, ny / len, nz / len];
  }

  const STLExporter = {
    /**
     * Generates a binary STL Blob combining base and relief meshes
     */
    generateSTL: function(modelData) {
      const baseMesh = modelData.baseMesh;
      const reliefMesh = modelData.reliefMesh;

      const totalTriangles = baseMesh.triangles.length + reliefMesh.triangles.length;
      const bufferSize = 80 + 4 + (totalTriangles * 50);
      const buffer = new ArrayBuffer(bufferSize);
      const view = new DataView(buffer);

      // 80-byte header
      const headerStr = "Binary STL created by QR3D Studio (3D Printable QR)";
      for (let i = 0; i < Math.min(headerStr.length, 80); i++) {
        view.setUint8(i, headerStr.charCodeAt(i));
      }

      // Total triangle count at offset 80
      view.setUint32(80, totalTriangles, true);

      let offset = 84;

      // 1. Write Base Mesh Triangles
      for (let i = 0; i < baseMesh.triangles.length; i++) {
        const t = baseMesh.triangles[i];
        const v1 = baseMesh.vertices[t[0]];
        const v2 = baseMesh.vertices[t[1]];
        const v3 = baseMesh.vertices[t[2]];
        const norm = computeFaceNormal(v1, v2, v3);

        // Normal
        view.setFloat32(offset, norm[0], true);
        view.setFloat32(offset + 4, norm[1], true);
        view.setFloat32(offset + 8, norm[2], true);

        // Vertices
        view.setFloat32(offset + 12, v1[0], true);
        view.setFloat32(offset + 16, v1[1], true);
        view.setFloat32(offset + 20, v1[2], true);

        view.setFloat32(offset + 24, v2[0], true);
        view.setFloat32(offset + 28, v2[1], true);
        view.setFloat32(offset + 32, v2[2], true);

        view.setFloat32(offset + 36, v3[0], true);
        view.setFloat32(offset + 40, v3[1], true);
        view.setFloat32(offset + 44, v3[2], true);

        view.setUint16(offset + 48, 0, true); // attribute byte count
        offset += 50;
      }

      // 2. Write Relief Mesh Triangles
      for (let i = 0; i < reliefMesh.triangles.length; i++) {
        const t = reliefMesh.triangles[i];
        const v1 = reliefMesh.vertices[t[0]];
        const v2 = reliefMesh.vertices[t[1]];
        const v3 = reliefMesh.vertices[t[2]];
        const norm = computeFaceNormal(v1, v2, v3);

        // Normal
        view.setFloat32(offset, norm[0], true);
        view.setFloat32(offset + 4, norm[1], true);
        view.setFloat32(offset + 8, norm[2], true);

        // Vertices
        view.setFloat32(offset + 12, v1[0], true);
        view.setFloat32(offset + 16, v1[1], true);
        view.setFloat32(offset + 20, v1[2], true);

        view.setFloat32(offset + 24, v2[0], true);
        view.setFloat32(offset + 28, v2[1], true);
        view.setFloat32(offset + 32, v2[2], true);

        view.setFloat32(offset + 36, v3[0], true);
        view.setFloat32(offset + 40, v3[1], true);
        view.setFloat32(offset + 44, v3[2], true);

        view.setUint16(offset + 48, 0, true); // attribute byte count
        offset += 50;
      }

      return new Blob([buffer], { type: 'model/stl' });
    }
  };

  window.STLExporter = STLExporter;
})(window);
