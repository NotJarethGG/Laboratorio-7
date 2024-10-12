// Librerías
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var path = require('path');

// Importar el módulo de validación
var validationModule = require('./unalib/index');

// Servir archivos estáticos desde la carpeta 'unalib'
app.use('/unalib', express.static(path.join(__dirname, 'unalib')));

// Ruta raíz: servir el archivo index.html desde la raíz
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Escuchar una conexión por socket
io.on('connection', function(socket){
 

  // Si se escucha "Evento-Mensaje-Server"
  socket.on('Evento-Mensaje-Server', function(msg){
    const mensajeValidado = validationModule.validateMessage(msg);

    // Emitir el mensaje validado a todos los clientes
    io.emit('Evento-Mensaje-Server', mensajeValidado);
  });
});

// Iniciar el servidor
http.listen(port, function(){
  console.log('Escuchando en Localhost:' + port);
});
