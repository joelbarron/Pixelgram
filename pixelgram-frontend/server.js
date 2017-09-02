// requerir la libreria del servidor
var express = require('express')
var ext = require('file-extension')
var bodyParser = require('body-parser')
var expressSession = require('express-session')
var passport = require('passport')
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
var config = require('./config')
var auth = require('./auth')
var pixelgramClient = require('pixelgram-client')


// crear el cliente para consumir al API
var client = pixelgramClient.createClient(config.client)

// DEBUG PARA LAS VARIABLES DE ENTORNO Y  CONFIGURACION
console.log(`La variable de entorno NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`La variable de entorno PIXELGRAM_SECRET: ${config.secret}`)
console.log(`La variable de un endpoint: ${config.client.endpoints.users}`)
console.log(`La variable de entorno AWS_ACCESS_KEY: ${config.aws.accessKey}`)
console.log(`La variable de entorno AWS_SECRET_KEY: ${config.aws.secretKey}`)
console.log(`La variable de entorno FACEBOOK_CLIENT_ID: ${config.auth.facebook.clientID}`)
console.log(`La variable de entorno FACEBOOK_CLIENT_SECRET: ${config.auth.facebook.clientSecret}`)
console.log(`La variable de callback de facebook: ${config.auth.facebook.callbackURL}`)
console.log(`La variable de entorno PORT: ${config.port}`)

console.log('-------------------------------------')


//objeto aws S3
var s3 = new aws.S3({
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretKey
})

//almacenar las fotografias
var storage = multerS3({
  s3: s3,
  bucket: 'pixelgram-storage',
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname })
  },
  key: function(req, file, cb) {
    cb(null, +Date.now()+ '.' + ext(file.originalname))
  }
})

var upload = multer({ storage: storage }).single('picture')


//                  EXPRESS


var app = express()

app.set(bodyParser.json()) // libreria para procesar los request y poderlos manejar
app.use(bodyParser.urlencoded({ extended: false }))


// app.set('trust proxy', 1)
// proxy: true,

app.use(expressSession({
  secret: config.secret,
  resave: true,
  saveUninitialized: true
}))


// vamos a utilizar passport para la autenticacion
app.use(passport.initialize())
app.use(passport.session())

// configuracion de passport
passport.use(auth.localStrategy)
passport.use(auth.facebookStrategy)
passport.deserializeUser(auth.deserializeUser)
passport.serializeUser(auth.serializeUser)


// asignar la libreria de pug para el renderizado de vistas
app.set('view engine', 'pug')
// asignar la ubicacion de los archivos estaticos
app.use(express.static('public'))


//            RUTAS

// asignar la vista principal
app.get('/', function(req, res) {
  res.render('index', { title: 'Pixelgram'})
})


// SIGNUP
app.get('/signup', function(req, res) {
  res.render('index', { title: 'Pixelgram - Signup'})
})

app.post('/signup', function(req, res) {
  var user = req.body
  client.saveUser(user, function (err, usr) {
    if (err) return res.status(500).send(err.message)

    res.redirect('/signin')
  })
})

// SIGNIN
app.get('/signin', function(req, res) {
  res.render('index', { title: 'Pixelgram - Signin'})
})

// LOGIN local
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))

app.get('/logout', function (req, res) {
  req.logout()

  res.redirect('/signin')
})

// LOGIN facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }))

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))

// obtener los datos del usuario logueado
app.get('/whoami', function (req, res) {

  if (req.isAuthenticated()) {
    return res.json(req.user)
  }
  res.json({ auth: false })
})




// PICTURES
app.get('/api/pictures', function(req, res) {

  client.listPictures(function (err, pictures) {
    if (err) return res.send([])

    res.send(pictures)
  })
})

app.post('/api/pictures', ensureAuth, function(req, res) {
  upload(req, res, function (err) {
    if(err) {
      console.log(err)
      return res.send(500, "Error uploading file")
    }

    var user = req.user
    var token = req.user.token
    var username = req.user.username
    var src = req.file.location

    client.savePicture({
      src: src,
      userId: username,
      user: {
        username: username,
        avatar: user.avatar,
        name: user.name
      }


    }, token, function (err, img) {
      if (err) return res.status(500).send(err.message)

      res.send(`File uploaded: ${req.file.location}`)
    })

  })
})

// USERS
app.get('/api/user/:username', function(req, res) {

  var username = req.params.username

  client.getUser(username, function (err, user){
    if (err) return res.status(404).send({ error: err })
    // if (err) return res.status(404).send({ error: 'user not found' })

    res.send(user);
  })
})

app.get('/:username', function(req, res) {
  res.render('index', { title: `Pixelgram - ${req.params.name || req.params.username}` })
})

app.get('/:username/:id', function(req, res) {
  res.render('index', { title: `Pixelgram - ${req.params.name || req.params.username}` })
})


// inicializar el servidor en el puerto 3000
app.listen(config.port, function(err){

  if (err) return console.log('Hubo un error'),process.exit(1)

  console.log(`pixelgram escuchando en el puerto ${config.port}`)
})




//metodo para garantizar la autenticacion
function ensureAuth (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  // res.status(401).send({ error: 'not authenticated' })
  return res.status(401).redirect('/signin')
}



// almacenar las fotografias local
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './')
//   },
//   filename: function (req, file, cb) {
//     cb(null, +Date.now()+ '.' + ext(file.originalname))
//   }
// })

// debug
// var util = require('util')
// console.log(util.inspect(user))
