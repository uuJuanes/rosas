// --- VARIABLES PARA LA ANIMACIÓN ---
let regionsData; // Para guardar los datos del JSON
let transformedRegions = []; // Para guardar las regiones con coordenadas ya calculadas

// Estado de la animación
let currentRegionIndex = 0; // ¿Qué región estamos dibujando?
let currentPointIndex = 0; // ¿Qué vértice de esa región estamos dibujando?

let animationIsFinished = false;

// 1. Cargar el JSON antes de que todo empiece
function preload() {
  regionsData = loadJSON('rosas.json');
}


function setup() {
  createCanvas(800, 800);
  background('black');
  
  // Ajusta la velocidad de la animación (más alto = más rápido)
  // Puedes jugar con este valor. 60 es un buen punto de partida.
  frameRate(60);

  // --- CÁLCULOS INICIALES (los hacemos solo una vez) ---
  const regionArray = Object.values(regionsData);

  // Calcular límites (misma lógica que Python)
  const allPoints = regionArray.flatMap(r => r.contour);
  const min_x = Math.min(...allPoints.map(p => p[0]));
  const max_x = Math.max(...allPoints.map(p => p[0]));
  const min_y = Math.min(...allPoints.map(p => p[1]));
  const max_y = Math.max(...allPoints.map(p => p[1]));

  // Calcular escala y centro (misma lógica)
  const drawingWidth = max_x - min_x;
  const drawingHeight = max_y - min_y;
  const scale = Math.min(600 / drawingWidth, 600 / drawingHeight);
  const center_x = (min_x + max_x) / 2;
  const center_y = (min_y + max_y) / 2;

  // Pre-calcular todas las coordenadas transformadas
  for (const region of regionArray) {
    const transformedPoints = region.contour.map(point => {
      const x = (point[0] - center_x) * scale;
      // LA CORRECCIÓN CLAVE: Invertimos el eje Y para que coincida con turtle
      const y = (point[1] - center_y) * -scale;
      return { x, y };
    });
    transformedRegions.push({
      points: transformedPoints,
      color: region.color,
    });
  }
}

// 2. BUCLE DE DIBUJO (se ejecuta en cada fotograma)
function draw() {
  if (animationIsFinished) {
    noLoop(); // Detenemos el bucle si ya terminamos
    return;
  }
  
  // LA CORRECCIÓN DE POSICIÓN: Movemos el origen al centro del lienzo
  translate(width / 2, height / 2);
  
  // Dibujamos las regiones que ya están completas
  for (let i = 0; i < currentRegionIndex; i++) {
    const region = transformedRegions[i];
    const c = region.color;
    fill(c[0], c[1], c[2]);
    noStroke();
    
    beginShape();
    for(const p of region.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
  
  // --- LÓGICA DE LA ANIMACIÓN ---
  // Dibuja la región actual, línea por línea
  const currentRegion = transformedRegions[currentRegionIndex];
  const c = currentRegion.color;
  
  stroke(c[0], c[1], c[2]); // Damos color al trazo
  strokeWeight(2);          // Hacemos el trazo visible
  noFill();                 // No rellenamos mientras se dibuja la línea

  beginShape();
  for (let i = 0; i <= currentPointIndex; i++) {
    const point = currentRegion.points[i];
    vertex(point.x, point.y);
  }
  endShape();
  
  // Avanzamos al siguiente punto
  currentPointIndex++;

  // Si terminamos los puntos de la región actual...
  if (currentPointIndex >= currentRegion.points.length) {
    // Rellenamos la forma que acabamos de terminar de trazar
    fill(c[0], c[1], c[2]);
    noStroke();
    beginShape();
    for(const p of currentRegion.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    
    // Y pasamos a la siguiente región
    currentRegionIndex++;
    currentPointIndex = 0;
  }
  
  // Si ya no hay más regiones, terminamos la animación
  if (currentRegionIndex >= transformedRegions.length) {
    animationIsFinished = true;
  }
}
