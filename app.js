const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para leer JSON
app.use(express.json());

// Funciones para el estado
function leerEstadoMantenimiento() {
  const estado = fs.readFileSync('estado_mantenimiento.json');
  return JSON.parse(estado);
}

function actualizarEstadoMantenimiento(estado) {
  fs.writeFileSync('estado_mantenimiento.json', JSON.stringify({ modo_mantenimiento: estado }));
}

// ⚠️ PRIMERO: rutas que deben funcionar SIEMPRE

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

// Servir mant.html directamente SIN bloqueo
app.get('/mant.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mant.html'));
});

// ⚠️ SEGUNDO: middleware para bloquear si está en mantenimiento

app.use((req, res, next) => {
  const estado = leerEstadoMantenimiento();

  // Permitir acceso a rutas básicas aunque haya mantenimiento
  const rutasPermitidas = [
    '/mant.html',
    '/estado-mantenimiento',
    '/activar-mantenimiento',
    '/desactivar-mantenimiento',
    '/mantenimiento',
  ];

  if (estado.modo_mantenimiento === 'activo' && !rutasPermitidas.includes(req.path)) {
    return res.redirect('/mantenimiento');
  }

  next();
});

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Página de mantenimiento
app.get('/mantenimiento', (req, res) => {
  res.send('⚙️ El sitio está en mantenimiento. Por favor, vuelve más tarde.');
});

// Página principal (index.html en la raíz del proyecto)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
