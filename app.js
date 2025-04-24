const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware para permitir el uso de JSON
app.use(express.json());

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Función para leer el estado de mantenimiento
function leerEstadoMantenimiento() {
  const estado = fs.readFileSync('estado_mantenimiento.json');
  return JSON.parse(estado);
}

// Función para actualizar el estado de mantenimiento
function actualizarEstadoMantenimiento(estado) {
  fs.writeFileSync('estado_mantenimiento.json', JSON.stringify({ modo_mantenimiento: estado }));
}

// Ruta para verificar el estado del mantenimiento
app.get('/estado-mantenimiento', (req, res) => {
  const estado = leerEstadoMantenimiento();
  res.json({ estado: estado.modo_mantenimiento });
});

// Ruta para activar el mantenimiento
app.post('/activar-mantenimiento', (req, res) => {
  actualizarEstadoMantenimiento('activo');
  res.json({ mensaje: 'Modo mantenimiento ACTIVADO' });
});

// Ruta para desactivar el mantenimiento
app.post('/desactivar-mantenimiento', (req, res) => {
  actualizarEstadoMantenimiento('inactivo');
  res.json({ mensaje: 'Modo mantenimiento DESACTIVADO' });
});

// Middleware global para redirigir a mantenimiento si está activado
app.use((req, res, next) => {
  const estado = leerEstadoMantenimiento();
  if (estado.modo_mantenimiento === 'activo') {
    res.redirect('/mantenimiento');
  } else {
    next();  // De lo contrario, continúa con la petición normal
  }
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido al sitio! El mantenimiento no está activado.');
});

// Página de mantenimiento
app.get('/mantenimiento', (req, res) => {
  res.send('El sitio está en mantenimiento. Por favor, vuelve más tarde.');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
