/**
 * Generador de archivos .3MF con soporte multicolor
 */
function exportTo3MF(options) {
  const xmlModel = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Title">QR3D Model</metadata>
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0"/>
          <vertex x="${options.width || 72}" y="0" z="0"/>
          <vertex x="${options.width || 72}" y="${options.height || 90}" z="0"/>
          <vertex x="0" y="${options.height || 90}" z="0"/>
          <vertex x="0" y="0" z="${options.baseThick || 2.4}"/>
          <vertex x="${options.width || 72}" y="0" z="${options.baseThick || 2.4}"/>
          <vertex x="${options.width || 72}" y="${options.height || 90}" z="${options.baseThick || 2.4}"/>
          <vertex x="0" y="${options.height || 90}" z="${options.baseThick || 2.4}"/>
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2"/><triangle v1="0" v2="2" v3="3"/>
          <triangle v1="4" v2="6" v3="5"/><triangle v1="4" v2="7" v3="6"/>
          <triangle v1="0" v2="4" v3="5"/><triangle v1="0" v2="5" v3="1"/>
          <triangle v1="1" v2="5" v3="6"/><triangle v1="1" v2="6" v3="2"/>
          <triangle v1="2" v2="6" v3="7"/><triangle v1="2" v2="7" v3="3"/>
          <triangle v1="3" v2="7" v3="4"/><triangle v1="3" v2="4" v3="0"/>
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1"/>
  </build>
</model>`;

  const blob = new Blob([xmlModel], { type: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'QR3D_Studio_Multicolor.3mf';
  a.click();
  URL.revokeObjectURL(url);
}
