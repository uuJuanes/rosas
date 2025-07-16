let regions; // Variable para guardar los datos del JSON

// 1. Cargar el JSON (equivalente a 'with open(...) as f:')
// p5.js lo carga antes de que el programa empiece
function preload() {
  regions = loadJSON('rosas.json');
}

function setup() {
  // Configurar el lienzo (equivalente a turtle.Screen() y .setup())
  createCanvas(800, 800);
  background('black'); // Equivalente a screen.bgcolor("black")
  
  // Como el dibujo no se mueve, le decimos a p5 que solo dibuje una vez
  noLoop(); 
}

function draw() {
  // El código dentro de draw() se ejecuta después de setup()
  // "regions" ya es un objeto de JS gracias a loadJSON
  const regionArray = Object.values(regions);

  // 2. Calcular límites para centrar el dibujo (misma lógica que en Python)
  const allPoints = regionArray.flatMap(r => r.contour);
  const min_x = Math.min(...allPoints.map(p => p[0]));
  const max_x = Math.max(...allPoints.map(p => p[0]));
  const min_y = Math.min(...allPoints.map(p => p[1]));
  const max_y = Math.max(...allPoints.map(p => p[1]));

  // 3. Calcular escala y centro (misma lógica)
  const width = max_x - min_x;
  const height = max_y - min_y;
  const scale = Math.min(600 / width, 600 / height);
  const center_x = (min_x + max_x) / 2;
  const center_y = (min_y + max_y) / 2;

  // ¡Importante! En p5.js, el origen (0,0) es la esquina superior izquierda.
  // Movemos todo el sistema de coordenadas al centro del lienzo.
  translate(width / 2, height / 2);

  // 4. Dibujar cada región (equivalente al bucle for de Python)
  for (const region of regionArray) {
    // Configurar color de relleno
    const c = region.color;
    fill(c[0], c[1], c[2]);
    noStroke(); // No dibujar el borde de la forma

    // Dibujar el polígono (equivalente a begin_fill, goto y end_fill)
    beginShape();
    for (const point of region.contour) {
      // Aplicar la misma transformación de escala y centrado
      const x = (point[0] - center_x) * scale;
      // La coordenada 'y' se invierte en p5.js en comparación con turtle
      const y = (point[1] - center_y) * -scale; 
      vertex(x, y);
    }
    endShape(CLOSE); // Cierra la forma
  }
}