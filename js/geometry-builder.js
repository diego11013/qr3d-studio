/**
 * Construcción geométrica y auto-escalado de texto
 */
function layoutEmbossedText(text, targetWidth, targetHeight, userScalePercent = 100) {
  if (!text || !text.trim()) return { lines: [], fontSize: 0 };
  const lines = text.trim().split('\n').filter(l => l.length > 0).slice(0, 2);
  const lineCount = lines.length;

  let baseFontSize = lineCount === 1 ? targetHeight * 0.70 : targetHeight * 0.38;
  const manualScale = userScalePercent / 100;
  let fontSize = baseFontSize * manualScale;

  // Medición aproximada de ancho (proporción ~0.60 por carácter)
  let maxLineLen = 0;
  lines.forEach(l => { if (l.length > maxLineLen) maxLineLen = l.length; });

  const requiredWidth = maxLineLen * (fontSize * 0.60);
  const maxAllowedWidth = targetWidth * 0.90;

  if (requiredWidth > maxAllowedWidth) {
    const scaleFactor = maxAllowedWidth / requiredWidth;
    fontSize *= scaleFactor;
  }

  return {
    lines,
    fontSize,
    lineHeight: fontSize * 1.2
  };
}
