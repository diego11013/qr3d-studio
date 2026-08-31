/**
 * Generador QR 2D nativo simplificado para canvas
 */
function generateQRMatrix(text) {
  const size = 25; // Versión básica estándar
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Finder patterns (3 esquinas)
  function drawFinder(r0, c0) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[r0 + r][c0 + c] = true;
        }
      }
    }
  }
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Generar patrón pseudo-aleatorio basado en hash del texto
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash << 5) - hash + text.charCodeAt(i);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Omitir finders
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      matrix[r][c] = ((r * c + hash + (r * 7)) % 3 === 0);
    }
  }
  return matrix;
}
