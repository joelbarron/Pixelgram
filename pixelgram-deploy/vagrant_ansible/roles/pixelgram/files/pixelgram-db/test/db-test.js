'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')
const fixtures = require('./fixtures')
const utils = require('../lib/utils')

// ESTE TEST SE EJECUTA PRIMERO QUE TODOS LOS DEMAS Y SE ENCARGA DE:
// CREAR LA BASE DE DATOS Y ASIGNARLA A NUESTRO CONTEXTO PARA POSTEERIORMENTE SER UTILIZADA POR LOS DEMAS TEST
test.beforeEach('setup database', async t => {
  const dbName = `pixelgram_${uuid.v4()}`
  const db = new Db({db: dbName, setup: true})
  await db.connect()
  t.context.db = db
  t.context.dbName = dbName
  t.true(db.connected, 'should be connected')
})

// ESTE TEST SE EJECUTA SIEMPRE (POR ESO LE PONEMOS EL ALWAYS) DESPUES DE CADA TEST Y SE ENCARGA DE:
// DESCONECTARNOS DE LA DB Y ELIMINAR TODO LO QUE HAYA SIDO ALMACENADO EN LA MISMA
test.afterEach.always('clean up database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName

  await db.disconnect()
  t.false(db.connected, 'should be disconected')

  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDA DE:
// EL GUARDADO DE UNA IMAGEN EN LA DB
// AL MISMO TIEMPO ESTRAE LOS TAGS DE LA DESCRIPCION CON LA UTILERIA QUE DESARROLLAMOS
test('save image', async t => {
  let db = t.context.db
  t.is(typeof db.saveImage, 'function', 'saveImage is function')

  // traer una imagen de prueba
  let image = fixtures.getImage()

  let created = await db.saveImage(image)
  t.is(created.description, image.description)
  t.is(created.url, image.url)
  t.is(created.likes, image.likes)
  t.is(created.liked, image.liked)
  t.deepEqual(created.tags, ['awesome', 'tags', 'pixel'])
  t.is(created.userId, image.userId)
  t.is(typeof created.id, 'string')
  t.is(created.publicId, uuid.encode(created.id))
  t.truthy(created.createdAt)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL LIKE HACIA UNA IMAGEN
test('like image', async t => {
  let db = t.context.db
  t.is(typeof db.likeImage, 'function', 'like image is a function')

  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.likeImage(created.publicId)

  t.true(result.liked)
  t.is(result.likes, image.likes + 1)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LA OBTENCION DE UNA IMAGEN DE LA DB
// VALIDAMOS QUE LA IMAGEN EXISTA
test('get image', async t => {
  let db = t.context.db
  t.is(typeof db.getImage, 'function', 'get image is a function')

  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.getImage(created.publicId)

  t.deepEqual(created, result)

  await t.throws(db.getImage('foo'), /not found/)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LA OBTENCION DE UNA LISTA DE IMAGENES DE LA BD
test('list all images', async t => {
  let db = t.context.db
  let images = fixtures.getImages(3)

  let saveImages = images.map(img => db.saveImage(img))

  let created = await Promise.all(saveImages)
  let result = await db.getImages()

  t.is(created.length, result.length)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL GUARDADO DE UN USUARIO EN LA DB
// AL MISMO TIEMPO SE HACE USO DE LA UTILERIA PARA ENCRIPTAR PASSWORD
test('save user', async t => {
  let db = t.context.db

  t.is(typeof db.saveUser, 'function', 'save user is a function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  let created = await db.saveUser(user)

  t.is(user.username, created.username)
  t.is(user.email, created.email)
  t.is(user.name, created.name)
  t.is(utils.encrypt(plainPassword), created.password)
  t.is(typeof created.id, 'string')
  t.truthy(created.createdAt)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LA OBTENCION DE UN USUARIO DE LA DB
// VALIDAMOS QUE EL USUARIO EXISTA
test('get user', async t => {
  let db = t.context.db

  t.is(typeof db.getUser, 'function', 'get user is a function')

  let user = fixtures.getUser()
  let created = await db.saveUser(user)
  let result = await db.getUser(user.username)

  t.deepEqual(created, result)

  await t.throws(db.getUser('foo'), /not found/)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LA AUTENTICACON DE UN USUARIO
// VALIDAMOS QUE EL USUARIO EXISTA
test('authenticate user', async t => {
  let db = t.context.db

  t.is(typeof db.authenticate, 'function', 'authenticate is a fucntion')

  let user = fixtures.getUser()
  let plainPassword = user.password
  await db.saveUser(user)

  let success = await db.authenticate(user.username, plainPassword)
  t.true(success)

  let fail = await db.authenticate(user.username, 'foo')
  t.false(fail)

  let failture = await db.authenticate('foo', 'bar')
  t.false(failture)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LISTAR IMAGENES POR USUUARIO
test('list images by user', async t => {
  let db = t.context.db
  t.is(typeof db.getImagesByUser, 'function', 'getImagesByUser is a function')

  // crear imagenes de prueba
  let images = fixtures.getImages(10)
  // crear un id para hacer el filtro
  let userId = uuid.uuid()
  // asignar ese id a un numero aleatorio de imagenes generadas en el paso anterior
  let random = Math.round(Math.random() * images.length)

  let saveImages = []

  for (let i = 0; i < images.length; i++) {
    if (i < random) {
      images[i].userId = userId
    }
    saveImages.push(db.saveImage(images[i]))
  }

  // resolver el arreglo de promesas(almacenarlas en la db)
  await Promise.all(saveImages)

  // obtener las images del usuario
  let result = await db.getImagesByUser(userId)
  // verificar que el resultado sea igual al numero de imagenes generadas a eses usuario
  t.is(result.length, random)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
//  LISTAR IMAGENES POR TAG
test('list images by tag', async t => {
  let db = t.context.db
  t.is(typeof db.getImagesByTag, 'function', 'getImagesByTag is a function')

  // crear imagenes de prueba
  let images = fixtures.getImages(10)
  // crear un id para hacer el filtro
  let tag = '#filterit'
  // asignar ese tag a un numero aleatorio de imagenes generadas en el paso anterior
  let random = Math.round(Math.random() * images.length)

  let saveImages = []

  for (let i = 0; i < images.length; i++) {
    if (i < random) {
      images[i].description = tag
    }
    saveImages.push(db.saveImage(images[i]))
  }

  // resolver el arreglo de promesas(almacenarlas en la db)
  await Promise.all(saveImages)

  // obtener las images del usuario
  let result = await db.getImagesByTag(tag)
  // verificar que el resultado sea igual al numero de imagenes generadas a eses usuario
  t.is(result.length, random)
})
