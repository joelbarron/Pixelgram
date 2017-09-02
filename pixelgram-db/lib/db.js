'use strict'

const co = require('co')
const r = require('rethinkdb')
const Promise = require('bluebird')
const uuid = require('uuid-base62')
const utils = require('./utils')

// VALORES POR DEFAULT SI NO SE INIDICAN UNOS PERSONALIZADOS
const defaults = {
  host: 'localhost',
  port: '28015',
  db: 'pixelgram'
}

class Db {
  // CONSTRUCTOR DE LA CLASE AL QUE LE PASAMOS LOS PARAMETROS PARA INICIALIXZAR LA CONEXION A LA DB
  constructor (options) {
    // Asignar los valores que se pasen por parametros
    // o en su defecto asignarle los de default
    options = options || {}
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.db = options.db || defaults.db
    this.setup = options.setup || false
  }

   // METODO QUE CONECTA HACIA LA DB
  connect (callback) {
    this.connection = r.connect({
      host: this.host,
      port: this.port
    })

    this.connected = true
    let db = this.db
    let connection = this.connection

    // SI NO SE HA INDICADO EXPLICITAMENTE HACER SETUP, SE REGRESA SOLAMENTE LA CONEXION Y SE IGNORA LO DEMAS
    if (!this.setup) {
      return Promise.resolve(connection).asCallback(callback)
    }

    // EL SETUP SE EJECUTA CADA VEZ QUE SE INTENTA UNA CONEXION
    // Y VERIFICA SI ESTAN CREADAS LAS TABLAS, EN CASO DE QUE NO ENCUENTRE: LAS CREA
    let setup = co.wrap(function * () {
      let conn = yield connection

      // db list es un arreglo que yield nos resolvio de la promesa
      let dbList = yield r.dbList().run(conn)

      if (dbList.indexOf(db) === -1) {
        yield r.dbCreate(db).run(conn)
      }

      let dbTables = yield r.db(db).tableList().run(conn)

      if (dbTables.indexOf('images') === -1) {
        yield r.db(db).tableCreate('images').run(conn)
        yield r.db(db).table('images').indexCreate('userId', { multi: true }).run(conn)
      }

      if (dbTables.indexOf('users') === -1) {
        yield r.db(db).tableCreate('users').run(conn)
        yield r.db(db).table('users').indexCreate('username', { multi: true }).run(conn)
      }

      return conn
    })

    // si no se pasa callback retornamos la promesa
    return Promise.resolve(setup()).asCallback(callback)
  }

  // METODO QUE DESCONECTA LA DB
  disconnect (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    this.connected = false
    return Promise.resolve(this.connection).then((conn) => conn.close())
  }

  // METODO QUE ALMACENA LOS DATOS DE UNA IMAGEN EN LA DB
  saveImage (image, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let db = this.db
    let connection = this.connection

    let task = co.wrap(function * () {
      let conn = yield connection
      image.createdAt = new Date()
      image.tags = utils.extractTags(image.description)

      let result = yield r.db(db).table('images').insert(image).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      image.id = result.generated_keys[0]

      yield r.db(db).table('images').get(image.id).update({
        publicId: uuid.encode(image.id)
      }).run(conn)

      let created = yield r.db(db).table('images').get(image.id).run(conn)

      return Promise.resolve(created)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE DA LIKE A UNA IMAGEN
  likeImage (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let db = this.db
    let connection = this.connection
    let getImage = this.getImage.bind(this)

    let task = co.wrap(function * () {
      let conn = yield connection

      let image = yield getImage(id)
      yield r.db(db).table('images').get(image.id).update({
        liked: true,
        likes: image.likes + 1
      }).run(conn)

      let created = yield getImage(id)
      return Promise.resolve(created)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE OBTIENE UNA IMAGEN DE LA DB
  getImage (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let db = this.db
    let connection = this.connection
    let imageId = uuid.decode(id)

    let task = co.wrap(function * () {
      let conn = yield connection

      let image = yield r.db(db).table('images').get(imageId).run(conn)

      if (!image) {
        return Promise.reject(new Error(`image ${imageId} not found`))
      }

      return Promise.resolve(image)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE OBTIENE UNA LISTA DE IMAGENES DE LA DB
  getImages (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let db = this.db
    let connection = this.connection

    let task = co.wrap(function * () {
      let conn = yield connection

      let images = yield r.db(db).table('images').orderBy(r.desc('createdAt')).run(conn)

      let result = yield images.toArray()

      return Promise.resolve(result)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE ALMACENA LOS DATOS DE UN USUARIO EL LA DB
  saveUser (user, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let db = this.db
    let connection = this.connection

    let task = co.wrap(function * () {
      let conn = yield connection

      user.password = utils.encrypt(user.password)
      user.createdAt = new Date()

      let result = yield r.db(db).table('users').insert(user).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      user.id = result.generated_keys[0]
      let created = yield r.db(db).table('users').get(user.id).run(conn)

      return Promise.resolve(created)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE OBTIENE UN USUARIO DE LA DB
  getUser (username, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let db = this.db
    let connection = this.connection

    let task = co.wrap(function * () {
      let conn = yield connection

      yield r.db(db).table('users').indexWait().run(conn)
      let users = yield r.db(db).table('users').getAll(username, {
        index: 'username'
      }).run(conn)

      let result = null

      try {
        result = yield users.next()
      } catch (e) {
        return Promise.reject(new Error(`user ${username} not found`))
      }

      return Promise.resolve(result)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE AUTENTICA A UN USUARIO
  authenticate (username, password, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let getUser = this.getUser.bind(this)

    let task = co.wrap(function * () {
      let user = null

      try {
        user = yield getUser(username)
      } catch (e) {
        return Promise.resolve(false)
      }

      if (user.password === utils.encrypt(password)) {
        return Promise.resolve(true)
      }
      return Promise.resolve(false)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE OBTIENE IMAGES POR USUARIO
  getImagesByUser (userId, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let connection = this.connection
    let db = this.db

    let task = co.wrap(function * () {
      let conn = yield connection

      // esperar a que se crean los indices
      yield r.db(db).table('images').indexWait().run(conn)

      // consulta
      let images = yield r.db(db).table('images').getAll(userId, {
        index: 'userId'
      }).orderBy(r.desc('createdAt')).run(conn)

      let result

      // asiganrlo a un array
      try {
        result = yield images.toArray()
      } catch (error) {
        return Promise.reject(new Error(error).asCallback(callback))
      }

      return Promise.resolve(result)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  // METODO QUE OBTIENE IMAGES POR USUARIO
  getImagesByTag (tag, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('nor connected').asCallback(callback))
    }

    let connection = this.connection
    let db = this.db
    tag = utils.normalize(tag)

    let task = co.wrap(function * () {
      let conn = yield connection

      // esperar a que se crean los indices
      yield r.db(db).table('images').indexWait().run(conn)

      // consulta
      let images = yield r.db(db).table('images').filter((img) => {
        return img('tags').contains(tag)
      }).orderBy(r.desc('createdAt')).run(conn)

      // asiganrlo a un array
      let result = yield images.toArray()

      return Promise.resolve(result)
    })

    return Promise.resolve(task()).asCallback(callback)
  }
}

module.exports = Db
