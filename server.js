const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const app = express();
const port = 3003;

require('dotenv').config();

mongoose.connect(process.env.CADENA)
  .then(() => console.log('Connected!'));

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());
app.use(express.static('public'));
const modeloOrdenador = require('./models/ordenador');
const User = require("./models/User");


// Ruta para subir archivos
app.post('/subir', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo' });
  }
  res.json({ message: 'Archivo subido correctamente', file: req.file });
});


//registro de usuario
app.post('/registro', (req, res) => {
  const { name, email, password } = req.body;

  // Encriptar contraseña
  bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(password, salt))
    .then(hashedPassword => {
      // Crear usuario
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });


      // Guardar usuario
      return newUser.save();
    })
    .then(() => {
      res.json({ message: 'Usuario registrado correctamente' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;


  // Buscar usuario
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }


      // Comparar contraseñas
      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
          }


          res.json({ message: 'Usuario autenticado correctamente' });
        });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    });
});


// Obtener todos los ítems
app.get("/items", (req, res) => {
  modeloOrdenador.buscaTodos()
  .then(
    ordenadores=>res.status(200).json(ordenadores)
  )
  .catch(err=>res.status(500).send("error"))
});


// Obtener un ítem por ID
app.get("/items/:id", (req, res) => {
  const itemId = req.params.id;
  modeloOrdenador.buscaPorId(itemId)
  .then(
    ordenador=>res.status(200).json(ordenador)
  )
  .catch(err=>res.status(500).send("error"))
});


// Crear un nuevo ítem
app.post("/items", (req, res) => {
    marca= req.body.marca;
    precio= req.body.precio;
    modeloOrdenador.creaNuevoOrdenador(marca,precio)
    .then(
      ordenador=>res.status(200).json(ordenador)
    )
    .catch(err=>res.status(500).send("error"))

});


// Actualizar un ítem existente
app.put("/items/:id", (req, res) => {
  const itemId = req.params.id;
  ordenador = req.body;
  //res.send(ordenador);
  modeloOrdenador.actualizaOrdenador(itemId,ordenador)
  .then(
    ordenadorAtualizado=>res.status(200).json(ordenadorAtualizado)
  )
  .catch(err=>res.status(500).send("error al actualizar el ordenador"))

});


// Eliminar un ítem
app.delete("/items/:id", (req, res) => {
  const itemId = req.params.id;
  modeloOrdenador.borraOrdenador(itemId)
  .then(
    ordenador=>res.status(200).json(ordenador)
  )
  .catch(err=>res.status(500).send("error"))

});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
