const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para permitir uso de JSON
app.use(express.json());

// Función para leer el estado de mantenimiento
function leerEstadoMantenimiento() {
  const estado = fs.readFileSync('estado_mantenimiento.json');
  return JSON.parse(estado);
}

// Función para actualizar el estado
function actualizarEstadoMantenimiento(estado) {
  fs.writeFileSync('estado_mantenimiento.json', JSON.stringify({ modo_mantenimiento: estado }));
}

// Rutas de API para controlar el mantenimiento
app.get('/estado-mantenimiento', (req, res) => {
  const estado = leerEstadoMantenimiento();
  res.json({ estado: estado.modo_mantenimiento });
});

app.post('/activar-mantenimiento', (req, res) => {
  actualizarEstadoMantenimiento('activo');
  res.json({ mensaje: 'Modo mantenimiento ACTIVADO' });
});

app.post('/desactivar-mantenimiento', (req, res) => {
  actualizarEstadoMantenimiento('inactivo');
  res.json({ mensaje: 'Modo mantenimiento DESACTIVADO' });
});

// Middleware para bloquear el sitio si el mantenimiento está activo
app.use((req, res, next) => {
  const estado = leerEstadoMantenimiento();

  const rutasPermitidas = [
    '/mant.html',
    '/estado-mantenimiento',
    '/activar-mantenimiento',
    '/desactivar-mantenimiento',
  ];

  // Permitir acceso si está en la lista blanca
  if (rutasPermitidas.includes(req.path)) {
    return next();
  }

  // Si está en mantenimiento y la ruta no está permitida
  if (estado.modo_mantenimiento === 'activo') {
    return res.redirect('/mantenimiento');
  }

  next();
});

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Página de mantenimiento
app.get('/mantenimiento', (req, res) => {
  res.send('El sitio está en mantenimiento. Por favor, vuelve más tarde.');
});

// Página principal (index.html desde raíz, NO desde /public)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Forzar servir mant.html directamente (por si acaso)
app.get('/mant.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mant.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

