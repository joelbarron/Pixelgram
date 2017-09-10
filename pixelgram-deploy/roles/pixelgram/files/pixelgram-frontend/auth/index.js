var uuid = require('uuid-base62')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var jwt = require('jsonwebtoken')
var pixelgramClient = require('pixelgram-client')
var config = require('../config')


// Cliente API para consumir servicios
var client = pixelgramClient.createClient(config.client)

// AUTHENTICACION LOCAL
exports.localStrategy = new LocalStrategy((username, password, done) => {
  // esta funcion va al clinete hace la pericon al API y te regresa un token firmado
  client.auth(username, password, (err, token) => {
    if (err) {
      return done(null, false, { message: 'Username and password not found' })
    }

    client.getUser(username, (err, user) => {
      if (err) {
        return done(null, false, { message: `An error ocurred: ${err.message}` })
      }

      // agregar el token
      user.token = token

      //enviar el usuario con el token
      return done(null, user)
    })
  })
})

// AUTHENTICACION FACEBOOK
exports.facebookStrategy = new FacebookStrategy({

  clientID: config.auth.facebook.clientID,
  clientSecret: config.auth.facebook.clientSecret,
  callbackURL: config.auth.facebook.callbackURL,
  profileFields: ['id', 'displayName', 'email']

}, function (accessToken, refreshToken, profile, done) {

  var userProfile = {
    email: profile._json.email,
    username: profile._json.id,
    password: uuid.uuid(),
    name: profile._json.name,
    facebook: true
  }

  // llamar a la funcion
  // se otendra el usuario ya sea que lo registre o lo obtenga ya existente
  // y se generara un token
  // para retornarlo y que los metodos de serializacion y desserializacion puedan utilizarlo y confirmar la autenticacion
  findOrCreate(userProfile, (err, user) => {
    if (err) return done(err)

    var token = 'no token sign'

    try {
      token = jwt.sign({ userId: user.username }, config.secret)
    } catch (e) {
      return done(e)
    }
    user.token = token
    // regresar el usuario final con el token
    return done(null, user)
  })


// FUNCION
  // ver si el usuario existe en la DB
  // si no hay que crearlo
  function findOrCreate(user, callback) {
    client.getUser(user.username, (err, usr) => {
      if (err) {
        // si no existe lo creo en la db
        return client.saveUser(user, callback)
      }

      //si existe lo regreso tal cual
      callback(null, usr)
    })
  }

})

// este metodo toma el user y solo envia lo necesario para almacenarlo en session
exports.serializeUser = function (user, done) {
  done(null, {
    username: user.username,
    token: user.token
  })
}

// este metodo obtiene el usuario a partir de un username y le agrega el token
exports.deserializeUser = function (user, done) {

  client.getUser(user.username, (err, usr) => {
    // if (err) {
    //   return done(null, false, { message: `An error ocurred: ${err.message}` })
    // }

    if (err) return done(err)

    // agregar el token
    usr.token = user.token
    //enviar el usuario con el token
    return done(null, usr)
  })
}
