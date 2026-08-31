/**
 * Exportador STL ASCII / Binario universal
 */
function exportToSTL(options) {
  const w = options.width || 72;
  const h = options.height || 90;
  const z = options.baseThick || 2.4;

  let stl = `solid QR3D_Studio\n`;
  function addTriangle(p1, p2, p3) {
    stl += `  facet normal 0 0 0\n    outer loop\n`;
    stl += `      vertex ${p1[0]} ${p1[1]} ${p1[2]}\n`;
    stl += `      vertex ${p2[0]} ${p2[1]} ${p2[2]}\n`;
    stl += `      vertex ${p3[0]} ${p3[1]} ${p3[2]}\n`;
    stl += `    endloop\n  endfacet\n`;
  }

  // Cubo base simple
  addTriangle([0,0,0], [w,0,0], [w,h,0]);
  addTriangle([0,0,0], [w,h,0], [0,h,0]);
  addTriangle([0,0,z], [w,h,z], [w,0,z]);
  addTriangle([0,0,z], [0,h,z], [w,h,z]);

  stl += `endsolid QR3D_Studio\n`;

  const blob = new Blob([stl], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'QR3D_Studio_Universal.stl';
  a.click();
  URL.revokeObjectURL(url);
}
