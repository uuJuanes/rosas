// --- VARIABLES GLOBALES ---
let regionsData; // Datos crudos del JSON
let transformedRegions = []; // Regiones con coordenadas listas para dibujar
let loadError = null; // Variable para almacenar cualquier error de carga

// --- ESTADO DE LA ANIMACIÓN ---
let currentRegionIndex = 0;
let currentPointIndex = 0;
let animationIsFinished = false;

// 1. PRE-CARGA DE DATOS (CON MANEJO DE ERRORES)
function preload() {
  regionsData = loadJSON(
    'rosas.json',
    () => console.log("Éxito: rosas.json se ha cargado."),
    (error) => {
      console.error("Fallo al cargar rosas.json:", error);
      loadError = "Error: No se pudo cargar 'rosas.json'.\nVerifica que el archivo exista y esté bien escrito.";
    }
  );
}

// 2. CONFIGURACIÓN INICIAL (SETUP)
function setup() {
  createCanvas(800, 800);
  background('black');
  frameRate(60); // Ajusta la velocidad de la animación

  // Si hubo un error en la carga, no continuamos.
  if (loadError) {
    return;
  }

  // --- PROCESAMIENTO DE DATOS (MÁS ROBUSTO) ---
  let regionArray;
  // Detecta si el JSON es un array `[{...}]` o un objeto `{"clave": {...}}`
  if (Array.isArray(regionsData)) {
    console.log("Formato de JSON detectado: Array");
    regionArray = regionsData;
  } else {
    console.log("Formato de JSON detectado: Objeto");
    regionArray = Object.values(regionsData);
  }

  // Verificamos si tenemos datos para dibujar
  if (!regionArray || regionArray.length === 0) {
    loadError = "Error: El archivo JSON está vacío o no contiene regiones para dibujar.";
    return;
  }

  // --- CÁLCULOS DE ESCALA Y CENTRADO ---
  try {
    const allPoints = regionArray.flatMap(r => r.contour);
    const min_x = Math.min(...allPoints.map(p => p[0]));
    const max_x = Math.max(...allPoints.map(p => p[0]));
    const min_y = Math.min(...allPoints.map(p => p[1]));
    const max_y = Math.max(...allPoints.map(p => p[1]));

    const drawingWidth = max_x - min_x;
    const drawingHeight = max_y - min_y;
    const scale = Math.min(600 / drawingWidth, 600 / drawingHeight);
    const center_x = (min_x + max_x) / 2;
    const center_y = (min_y + max_y) / 2;

    // Pre-calculamos y transformamos todas las coordenadas
    for (const region of regionArray) {
      const transformedPoints = region.contour.map(point => {
        const x = (point[0] - center_x) * scale;
        const y = (point[1] - center_y) * -scale; // Invertimos Y para la orientación correcta
        return { x, y };
      });
      transformedRegions.push({
        points: transformedPoints,
        color: region.color,
      });
    }
  } catch (e) {
      console.error("Error durante el cálculo de coordenadas:", e);
      loadError = "Error: El formato de los datos en 'rosas.json' es incorrecto.";
  }
}

// 3. BUCLE DE DIBUJO (SE EJECUTA EN CADA FOTOGRAMA)
function draw() {
  // Si en algún momento hubo un error, lo mostramos en pantalla.
  if (loadError) {
    background('black');
    fill('red');
    textAlign(CENTER, CENTER);
    textSize(20);
    text(loadError, 10, 10, width - 20, height - 20); // Dibuja el texto con saltos de línea
    noLoop(); // Detiene la animación
    return;
  }

  // Si la animación ya terminó, no hacemos nada más.
  if (animationIsFinished) {
    noLoop();
    return;
  }

  // --- DIBUJO ---
  background('black'); // Limpiamos el lienzo en cada fotograma
  translate(width / 2, height / 2); // Centramos el sistema de coordenadas

  // 1. Dibuja todas las regiones ya completadas con su relleno
  for (let i = 0; i < currentRegionIndex; i++) {
    const region = transformedRegions[i];
    fill(region.color[0], region.color[1], region.color[2]);
    noStroke();
    beginShape();
    for (const p of region.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  // 2. Dibuja la animación de la región actual
  if (currentRegionIndex < transformedRegions.length) {
    const currentRegion = transformedRegions[currentRegionIndex];
    
    // Dibuja el trazo de la línea que se está formando
    stroke(currentRegion.color[0], currentRegion.color[1], currentRegion.color[2]);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i <= currentPointIndex; i++) {
      vertex(currentRegion.points[i].x, currentRegion.points[i].y);
    }
    endShape();

    // Avanzamos la animación
    currentPointIndex++;

    // Si terminamos de trazar la región actual
    if (currentPointIndex >= currentRegion.points.length) {
      currentRegionIndex++;
      currentPointIndex = 0;
    }
  } else {
    // Si ya no hay más regiones, terminamos
    animationIsFinished = true;
  }
}
