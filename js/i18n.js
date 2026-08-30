/**
 * QR3D Studio - Internationalization Engine (ES / EN)
 * Complete bilingual dictionary for Spanish and English with instant DOM reactivity.
 */
(function(window) {
  'use strict';

  const translations = {
    es: {
      // Header & Navigation
      "app.title": "QR3D Studio",
      "app.badge": "3MF Multicolor",
      "app.trust": "100% en tu navegador (Sin servidores)",
      "lang.switch": "English",

      // Hero
      "hero.title": "Generador de Códigos QR para Impresión 3D",
      "hero.desc": "Diseña soportes de sobremesa, llaveros, placas magnéticas y de pared con relieve táctil. Exportación nativa en <strong>.3MF multicolor con dos cuerpos</strong> para Bambu Lab AMS y Prusa MMU, o en <strong>.STL universal</strong>.",
      "hero.badge1": "Sin registros ni esperas",
      "hero.badge2": "Color embebido en el archivo",
      "hero.badge3": "Gestos táctiles & Trackpad",

      // Presets Bar
      "presets.title": "⚡ Presets Rápidos en 1-Clic:",
      "preset.menu": "Menú Restaurante",
      "preset.reviews": "Reseñas Google",
      "preset.wifi": "WiFi Huéspedes",
      "preset.instagram": "Instagram / Redes",
      "preset.magnet": "Imán para Nevera",

      // Left Panel: Customization
      "panel.customize": "Personaliza tu QR 3D",
      "label.qr_content": "1. Enlace o Contenido del QR",
      "placeholder.qr_input": "https://tu-restaurante.com/carta o enlace de Google Reviews",
      "btn.wifi": "WiFi",

      "label.format": "2. Formato del Objeto 3D",
      "format.stand": "Soporte Mesa",
      "format.stand_sub": "Cartas y reseñas",
      "format.keychain": "Llavero",
      "format.keychain_sub": "Con anilla",
      "format.plaque": "Placa Pared",
      "format.plaque_sub": "Pared o mostrador",
      "format.magnetic": "Imán Nevera",
      "format.magnetic_sub": "Cajeado neodimio",
      "format.countersunk": "Con Tornillos",
      "format.countersunk_sub": "Agujeros cónicos",

      "label.colors": "3. Colores de Filamento (Multicolor)",
      "label.base_color": "Color de la Base",
      "label.relief_color": "Color del QR / Relieve",
      "label.palettes": "Paletas:",
      "palette.bw": "Blanco/Negro",
      "palette.gold": "Azul/Oro",
      "palette.red": "Blanco/Rojo",
      "palette.green": "Negro/Verde",

      "contrast.optimal": "✓ Contraste óptimo para escaneo con smartphone",
      "contrast.warning": "⚠️ Bajo contraste: La combinación elegida podría dificultar el escaneo óptico.",

      "label.style_and_icon": "4. Estilo de los Puntos e Icono Central",
      "shape.square": "Cuadrado",
      "shape.rounded": "Redondeado",
      "shape.dots": "Puntos 3D",
      "placeholder.custom_emoji": "O escribe otro emoji...",
      "btn.clear_emoji": "Quitar",

      "label.dimensions": "5. Dimensiones y Grosores de Impresión",
      "label.base_thick": "Grosor de la Base:",
      "label.relief_height": "Altura del Relieve:",

      "label.bottom_text": "6. Texto en Relieve (Inferior)",
      "placeholder.bottom_text": "Ej: MENU DIGITAL o VALORANOS EN GOOGLE",

      // Right Panel: 3D Viewport
      "panel.viewport": "Vista Previa 3D Interactiva",
      "badge.touch": "Gesto Táctil & Trackpad",
      "badge.multimaterial": "3MF Multi-Material",
      "btn.center_view": "Centrar Vista",
      "hint.touch": "Desliza en cualquier dirección para rotar en 3D",
      "label.zoom": "Zoom:",

      // Downloads
      "btn.download_3mf": "Descargar .3MF (Multicolor con Color Nativo)",
      "btn.download_stl": "Descargar .STL (Universal para cualquier impresora)",
      "download.toast": "¡Descarga iniciada con éxito! Ya puedes abrir el archivo en tu laminador.",

      // 2D QR Section
      "section_2d.title": "Código QR en 2D (Digital e Impresión Gráfica)",
      "section_2d.desc": "Visualiza y descarga el mismo código QR con tus colores personalizados, forma de puntos y distintivo central. Listo para imprimir en papel, incluir en cartas plastificadas, tarjetas de visita o publicar en redes sociales.",
      "meta.error_correction": "🛡️ Corrección de error: Nivel H (30%)",
      "meta.svg": "📐 Formato Vectorial SVG",
      "meta.png": "🖼️ Imagen PNG 1024 × 1024 px",
      "meta.scan": "⚡ Escaneo instantáneo",
      "btn.download_png": "Descargar PNG (Alta Definición)",
      "btn.download_svg": "Descargar SVG (Vectorial Escalable)",

      // Recommendations / Supplies
      "supplies.title": "🛠️ Materiales Recomendados para Imprimir Códigos QR",
      "supplies.desc": "Selección de filamentos de alto contraste y accesorios ideales para acabados profesionales.",
      "supplies.card1_title": "Filamentos PLA+ Alta Opacidad",
      "supplies.card1_desc": "Máximo contraste óptico entre blanco y negro para escaneo rápido con smartphones.",
      "supplies.card2_title": "Imanes de Neodimio (6×2 mm)",
      "supplies.card2_desc": "Ajuste perfecto para el formato de placa magnética en neveras o mostradores.",
      "supplies.card3_title": "Kits de Anillas para Llaveros",
      "supplies.card3_desc": "Anillas de acero niquelado de 25 mm listas para montar tus llaveros QR 3D.",

      // 3 Steps
      "steps.heading": "Diseña y descarga tu QR 3D en 3 sencillos pasos",
      "steps.subheading": "Del navegador a tu impresora 3D en menos de 1 minuto, sin software de diseño complejo.",
      "step1.title": "Configura el contenido y el soporte",
      "step1.desc": "Pega tu enlace, menú de restaurante, reseña de Google o clave WiFi. Elige entre soporte de mesa, llavero, placa magnética o con tornillos.",
      "step2.title": "Personaliza colores y revisa en 3D",
      "step2.desc": "Selecciona los dos colores de filamento para la base y el relieve. Ajusta dimensiones e inspecciona en el visor 3D en tiempo real.",
      "step3.title": "Descarga en .3MF y manda a imprimir",
      "step3.desc": "Descarga el archivo .3MF listo para Bambu Studio, OrcaSlicer o PrusaSlicer con colores ya asignados, o el .STL universal.",

      // Use cases
      "cases.heading": "Ideas de uso profesionales para negocios y eventos",
      "cases.subheading": "Aumenta las conversiones de tu negocio físico con señalética 3D duradera, táctil y profesional.",
      "case1.title": "Restaurantes, Bares y Cafés",
      "case1.badge": "Soporte de Mesa",
      "case1.desc": "Menús digitales y cartas sin contacto en soportes lavables y elegantes que no se vuelan con el viento en terrazas ni se deterioran con líquidos.",
      "case2.title": "Reseñas de Google y TripAdvisor",
      "case2.badge": "Mostrador y Caja",
      "case2.desc": "Multiplica tus valoraciones de 5 estrellas en Google colocando un soporte llamativo junto al TPV para que el cliente opine justo al pagar.",
      "case3.title": "Alojamientos Turísticos y Airbnb",
      "case3.badge": "WiFi de Huéspedes",
      "case3.desc": "Placas decorativas para la entrada o mesita de noche con conexión WiFi automática al enfocar la cámara, sin teclear contraseñas largas.",
      "case4.title": "Llaveros de Eventos y Networking",
      "case4.badge": "Llavero Portátil",
      "case4.desc": "Comparte tu perfil de LinkedIn, Instagram o tarjeta de contacto vCard en ferias y congresos llevando un llavero 3D indestructible.",
      "case5.title": "Placas de Pared y Pagos Rápidos",
      "case5.badge": "Placa con Tornillos",
      "case5.desc": "Códigos de pago rápido (Bizum, Mercado Pago, transferencias) y señalética para fijar con tornillos o adhesivo en muros y mostradores.",

      // 3D Technical Guide
      "guide.heading": "Guía Técnica de Impresión y Laminación 3D",
      "guide.subheading": "Consejos de configuración para conseguir códigos QR con contraste perfecto y lectura óptica instantánea.",
      "guide.ams_title": "Impresoras Multicolor (Bambu AMS, Prusa MMU, Kobra)",
      "guide.ams_1": "Abre el archivo .3MF en Bambu Studio, OrcaSlicer o PrusaSlicer.",
      "guide.ams_2": "El archivo se carga como un ensamblaje con 2 piezas separadas: Base y Relieve QR.",
      "guide.ams_3": "Asigna el filamento de fondo (blanco/claro) a la base y el de contraste (negro/oscuro) al relieve.",
      "guide.ams_4": "Haz clic en Laminar e imprime sin necesidad de colorear manualmente caras ni geometrías.",
      "guide.single_title": "Impresoras Monocromo (Ender 3, Neptune, Klipper)",
      "guide.single_1": "Carga el archivo .STL o .3MF en tu laminador habitual (Cura, PrusaSlicer).",
      "guide.single_2": "Localiza la capa exacta donde termina la base y empieza el relieve.",
      "guide.single_3": "Añade una pausa por altura de capa (comando M600 o Pause at height).",
      "guide.single_4": "Inicia con el color base; al pausar, cambia el carrete al color del QR y reanuda.",

      // FAQ
      "faq.heading": "Preguntas Frecuentes",
      "faq.subheading": "Todo sobre la creación, compatibilidad y laminación de códigos QR 3D.",
      "faq.q1": "¿Qué combinación de colores garantiza que el código QR se escanee sin problemas?",
      "faq.a1": "Para una lectura rápida con cualquier cámara de smartphone es imprescindible un alto contraste óptico. Las combinaciones más fiables son base blanca/clara con relieve negro/oscuro. Evita filamentos transparentes, con purpurina o combinaciones de bajo contraste.",
      "faq.q2": "¿Con qué programas de laminación (slicers) son compatibles los archivos descargados?",
      "faq.a2": "Los archivos .3MF son compatibles nativamente con Bambu Studio, OrcaSlicer, PrusaSlicer y Ultimaker Cura. Los archivos .STL son compatibles con la totalidad de laminadores y plataformas de modelado 3D del mercado.",
      "faq.q3": "¿Cuál es la diferencia entre descargar en formato .3MF y formato .STL?",
      "faq.a3": "El formato .3MF almacena la geometría organizada en piezas separadas con información de color lista para impresoras multicolor (sistemas tipo AMS o MMU). El formato .STL entrega la malla geométrica combinada, ideal para impresoras monocromáticas tradicionales o cambios de filamento manuales por capa.",
      "faq.q4": "¿Puedo imprimir estos modelos si mi impresora tiene un solo extrusor?",
      "faq.a4": "Sí. Dado que el diseño está configurado con la base en los primeros milímetros y el código QR en la parte superior, puedes programar una pausa de capa (M600) en tu laminador para cambiar el rollo de filamento manualmente justo antes de que empiece el relieve.",
      "faq.q5": "¿Qué tipo de filamento debo elegir (PLA, PETG, ABS)?",
      "faq.a5": "PLA es el material recomendado para interiores (llaveros, placas de oficina, cartas de restaurante cubiertas) por su facilidad de impresión y acabado nítido. PETG es ideal para exteriores o mesas de terraza, ya que resiste mejor la radiación solar, la humedad y el desgaste diario.",
      "faq.q6": "¿Mis enlaces o contraseñas WiFi quedan almacenados en la web?",
      "faq.a6": "No. La generación del código QR y el cálculo del modelo 3D se realizan íntegramente dentro de tu navegador web mediante JavaScript. Ningún dato es transmitido ni guardado en servidores externos.",

      // Legal & Footer
      "legal.privacy": "Política de Privacidad",
      "legal.terms": "Términos de Uso",
      "legal.contact": "Contacto y Feedback",
      "legal.coffee": "☕ Invítame a un café",
      "footer.copy": "© 2026 QR3D Studio — Generador de Códigos QR para Impresión 3D. 100% Client-Side."
    },

    en: {
      // Header & Navigation
      "app.title": "QR3D Studio",
      "app.badge": "3MF Multi-Color",
      "app.trust": "100% in your browser (No servers)",
      "lang.switch": "Español",

      // Hero
      "hero.title": "3D Printable QR Code Generator",
      "hero.desc": "Design tabletop stands, keychains, magnetic fridge plates, and wall plaques with tactile relief. Native export in <strong>dual-body multi-color .3MF</strong> for Bambu Lab AMS and Prusa MMU, or universal <strong>.STL</strong>.",
      "hero.badge1": "No signup required",
      "hero.badge2": "Embedded native color",
      "hero.badge3": "Touch Gestures & Trackpad",

      // Presets Bar
      "presets.title": "⚡ 1-Click Quick Presets:",
      "preset.menu": "Restaurant Menu",
      "preset.reviews": "Google Reviews",
      "preset.wifi": "Guest WiFi",
      "preset.instagram": "Instagram / Social",
      "preset.magnet": "Fridge Magnet",

      // Left Panel: Customization
      "panel.customize": "Customize your 3D QR",
      "label.qr_content": "1. QR Code Link or Content",
      "placeholder.qr_input": "https://your-restaurant.com/menu or Google Reviews link",
      "btn.wifi": "WiFi",

      "label.format": "2. 3D Object Format",
      "format.stand": "Desk Stand",
      "format.stand_sub": "Menus & reviews",
      "format.keychain": "Keychain",
      "format.keychain_sub": "With ring hole",
      "format.plaque": "Wall Plaque",
      "format.plaque_sub": "Wall or counter",
      "format.magnetic": "Fridge Magnet",
      "format.magnetic_sub": "Neodymium pocket",
      "format.countersunk": "Screw Mount",
      "format.countersunk_sub": "Countersunk holes",

      "label.colors": "3. Filament Colors (Multi-Color)",
      "label.base_color": "Base Plate Color",
      "label.relief_color": "QR / Relief Color",
      "label.palettes": "Palettes:",
      "palette.bw": "White/Black",
      "palette.gold": "Blue/Gold",
      "palette.red": "White/Red",
      "palette.green": "Black/Green",

      "contrast.optimal": "✓ Optimal contrast for smartphone scanning",
      "contrast.warning": "⚠️ Low contrast: The selected combination may be difficult for cameras to scan.",

      "label.style_and_icon": "4. Module Style & Center Icon",
      "shape.square": "Square",
      "shape.rounded": "Rounded",
      "shape.dots": "3D Dots",
      "placeholder.custom_emoji": "Or type another emoji...",
      "btn.clear_emoji": "Remove",

      "label.dimensions": "5. Printing Dimensions & Thickness",
      "label.base_thick": "Base Thickness:",
      "label.relief_height": "Relief Height:",

      "label.bottom_text": "6. Embossed Bottom Text",
      "placeholder.bottom_text": "e.g. DIGITAL MENU or REVIEW US ON GOOGLE",

      // Right Panel: 3D Viewport
      "panel.viewport": "Interactive 3D Preview",
      "badge.touch": "Touch & Trackpad",
      "badge.multimaterial": "3MF Multi-Material",
      "btn.center_view": "Center View",
      "hint.touch": "Swipe in any direction to rotate in 3D",
      "label.zoom": "Zoom:",

      // Downloads
      "btn.download_3mf": "Download .3MF (Multi-Color with Native Color)",
      "btn.download_stl": "Download .STL (Universal for any 3D printer)",
      "download.toast": "Download started successfully! Open the file in your slicer.",

      // 2D QR Section
      "section_2d.title": "2D QR Code (Digital & Graphic Print)",
      "section_2d.desc": "Preview and download the same custom QR code with your chosen colors, dot style, and center emblem. Ready for paper printing, laminated cards, business cards, or social media.",
      "meta.error_correction": "🛡️ Error Correction: Level H (30%)",
      "meta.svg": "📐 Scalable SVG Vector",
      "meta.png": "🖼️ PNG Image 1024 × 1024 px",
      "meta.scan": "⚡ Instant scan",
      "btn.download_png": "Download PNG (High Definition)",
      "btn.download_svg": "Download SVG (Scalable Vector)",

      // Recommendations / Supplies
      "supplies.title": "🛠️ Recommended 3D Printing Supplies",
      "supplies.desc": "High-contrast filaments and essential hardware for professional results.",
      "supplies.card1_title": "High-Opacity PLA+ Filaments",
      "supplies.card1_desc": "Maximum optical contrast between white and black for instant smartphone scanning.",
      "supplies.card2_title": "Neodymium Magnets (6×2 mm)",
      "supplies.card2_desc": "Snug fit for the magnetic plate format on fridges, whiteboards, or metal counters.",
      "supplies.card3_title": "Keyring Hardware Kits",
      "supplies.card3_desc": "Durable 25 mm nickel-plated steel rings ready to attach to your 3D QR keychains.",

      // 3 Steps
      "steps.heading": "Design and download your 3D QR in 3 easy steps",
      "steps.subheading": "From browser to 3D printer in under a minute, with no complex CAD design required.",
      "step1.title": "Set content and choose format",
      "step1.desc": "Paste your link, restaurant menu, Google review, or WiFi details. Choose between desk stand, keychain, magnetic plate, or screw plaque.",
      "step2.title": "Customize colors and inspect in 3D",
      "step2.desc": "Select filament colors for the base and relief. Adjust dimensions and inspect your model in the real-time 3D viewport.",
      "step3.title": "Download in .3MF and print",
      "step3.desc": "Download the .3MF file ready for Bambu Studio, OrcaSlicer, or PrusaSlicer with colors pre-assigned, or universal .STL.",

      // Use cases
      "cases.heading": "Professional use cases for businesses & events",
      "cases.subheading": "Boost conversions at your physical store with durable, tactile, and professional 3D signage.",
      "case1.title": "Restaurants, Bars & Cafes",
      "case1.badge": "Desk Stand",
      "case1.desc": "Digital menus and touchless cards on washable, elegant stands that won't blow away on outdoor patios or get damaged by liquids.",
      "case2.title": "Google & TripAdvisor Reviews",
      "case2.badge": "Counter & POS",
      "case2.desc": "Multiply your 5-star Google reviews by placing an eye-catching 3D stand right at checkout so customers review while paying.",
      "case3.title": "Hotels & Airbnb Rentals",
      "case3.badge": "Guest WiFi",
      "case3.desc": "Decorative signs for entrances or nightstands with automatic WiFi connection on camera focus, without typing long passwords.",
      "case4.title": "Event Keychains & Networking",
      "case4.badge": "Portable Keychain",
      "case4.desc": "Share your LinkedIn profile, Instagram, or vCard at trade shows and conferences with an indestructible 3D printed keychain.",
      "case5.title": "Wall Plaques & Fast Payments",
      "case5.badge": "Screw Mount Plaque",
      "case5.desc": "Quick payment QR codes (PayPal, Venmo, CashApp, transfers) and signage to screw or mount onto walls and store displays.",

      // 3D Technical Guide
      "guide.heading": "3D Printing & Slicing Technical Guide",
      "guide.subheading": "Best slicer settings for crisp optical contrast and instant smartphone camera scanning.",
      "guide.ams_title": "Multi-Color Printers (Bambu AMS, Prusa MMU, Kobra)",
      "guide.ams_1": "Open the .3MF file in Bambu Studio, OrcaSlicer, or PrusaSlicer.",
      "guide.ams_2": "The file loads as an assembly with 2 distinct bodies: Base and QR Relief.",
      "guide.ams_3": "Assign background filament (white/light) to the base and contrast filament (black/dark) to the relief.",
      "guide.ams_4": "Click Slice and print with zero manual face painting required.",
      "guide.single_title": "Single Extruder Printers (Ender 3, Neptune, Klipper)",
      "guide.single_1": "Load the .STL or .3MF file in your standard slicer (Cura, PrusaSlicer).",
      "guide.single_2": "Find the exact layer where the base ends and the QR relief begins.",
      "guide.single_3": "Add a pause at height command (M600 or Pause at height script).",
      "guide.single_4": "Start printing with base color; on pause, swap filament to the contrast color and resume.",

      // FAQ
      "faq.heading": "Frequently Asked Questions",
      "faq.subheading": "Everything about creating, compatibility, and 3D printing QR codes.",
      "faq.q1": "Which color combination guarantees effortless scanning?",
      "faq.a1": "High optical contrast is essential. The most reliable combinations are white/light base with black/dark relief. Avoid transparent filaments, glitter, or low-contrast combinations.",
      "faq.q2": "Which slicers are compatible with the downloaded files?",
      "faq.a2": ".3MF files are natively supported by Bambu Studio, OrcaSlicer, PrusaSlicer, and Ultimaker Cura. .STL files work with all 3D printing slicers and CAD software on the market.",
      "faq.q3": "What is the difference between .3MF and .STL download?",
      "faq.a3": "The .3MF format contains distinct segmented geometry with embedded color definitions for multi-material printers (AMS/MMU). The .STL format delivers a unified solid mesh for single-extruder printers using layer pauses.",
      "faq.q4": "Can I print these models on a single-extruder 3D printer?",
      "faq.a4": "Yes! Because the design is structured with the base in the bottom layers and the QR code on top, you can program a layer pause (M600) to change filament spools before the relief starts.",
      "faq.q5": "Which filament type should I use (PLA, PETG, ABS)?",
      "faq.a5": "PLA is recommended for indoor use (keychains, office plaques, covered restaurant menus) for ease of printing and crisp details. PETG is ideal for outdoor patio tables, resisting sun exposure and moisture.",
      "faq.q6": "Are my WiFi passwords or links stored on any server?",
      "faq.a6": "No. QR generation and 3D model calculations occur entirely inside your web browser via JavaScript. No data is transmitted or saved to external servers.",

      // Legal & Footer
      "legal.privacy": "Privacy Policy",
      "legal.terms": "Terms of Service",
      "legal.contact": "Contact & Feedback",
      "legal.coffee": "☕ Buy me a coffee",
      "footer.copy": "© 2026 QR3D Studio — 3D Printable QR Code Generator. 100% Client-Side."
    }
  };

  let currentLang = localStorage.getItem('qr3d_lang') || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'es');

  function t(key) {
    const langDict = translations[currentLang] || translations.es;
    return langDict[key] || translations.es[key] || key;
  }

  function setLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'es';
    localStorage.setItem('qr3d_lang', currentLang);
    document.documentElement.lang = currentLang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.getAttribute('placeholder')) el.setAttribute('placeholder', val);
        } else {
          el.innerHTML = val;
        }
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) el.setAttribute('placeholder', val);
    });

    // Update language switch button text
    const switchBtn = document.getElementById('langSwitchBtn');
    if (switchBtn) {
      switchBtn.textContent = currentLang === 'es' ? '🇺🇸 English' : '🇪🇸 Español';
    }
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'es' ? 'en' : 'es');
  }

  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    toggleLanguage: toggleLanguage,
    getLanguage: () => currentLang
  };
})(window);
