'use strict'

const test = require('ava')
const pixelgram = require('../')
const nock = require('nock')
const fixtures = require('./fixtures')

let options = {
  endpoints: {
    pictures: 'http://pixelgram.test/picture',
    users: 'http://pixelgram.test/user',
    auth: 'http://pixelgram.test/auth'
  }
}

// ESTE TEST SE EJECUTA AL INICIO DE CADA UNO DE LOS TEST
// SE ASIGNA AL CONTEXTO LAS OPCIONES
test.beforeEach(t => {
  t.context.client = pixelgram.createClient(options)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LAS CLASES DEL CLIENTE
test('client', t => {
  const client = pixelgram.createClient()

  t.is(typeof client.getPicture, 'function')
  t.is(typeof client.savePicture, 'function')
  t.is(typeof client.likePicture, 'function')
  t.is(typeof client.listPictures, 'function')
  t.is(typeof client.listPicturesByTag, 'function')
  t.is(typeof client.saveUser, 'function')
  t.is(typeof client.getUser, 'function')
  t.is(typeof client.auth, 'function')
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA OBTENER UNA IMAGEN
test('getPicture', async t => {
  const client = t.context.client

  let image = fixtures.getImage()

  nock(options.endpoints.pictures)
    .get(`/${image.publicId}`)
    .reply(200, image)

  let result = await client.getPicture(image.publicId)
  t.deepEqual(image, result)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA GUARDAR UNA IMAGEN
test('savePicture', async t => {
  const client = t.context.client
  let token = 'xxxx-xxx-xxx'
  let image = fixtures.getImage()
  let newImage = {
    src: image.src,
    description: image.description
  }

  nock(options.endpoints.pictures, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .post('/', newImage)
    .reply(201, image)

  let result = await client.savePicture(newImage, token)
  t.deepEqual(result, image)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA LIKEAR UNA IMAGEN
test('likePicture', async t => {
  const client = t.context.client

  let image = fixtures.getImage()
  image.liked = true
  image.likes = 1

  nock(options.endpoints.pictures)
    .post(`/${image.publicId}/like`)
    .reply(200, image)

  let result = await client.likePicture(image.publicId)
  t.deepEqual(image, result)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA OBTENER UNA LSTA DE IMAGENES
test('listPictures', async t => {
  const client = t.context.client

  let images = fixtures.getImages(3)

  nock(options.endpoints.pictures)
    .get('/list')
    .reply(200, images)

  let result = await client.listPictures()
  t.deepEqual(images, result)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA OBTENER UNA LSTA DE IMAGENES POR TAG
test('listPicturesByTag', async t => {
  const client = t.context.client

  let images = fixtures.getImages(3)
  let tag = 'pixel'

  nock(options.endpoints.pictures)
    .get(`/tag/${tag}`)
    .reply(200, images)

  let result = await client.listPicturesByTag(tag)
  t.deepEqual(images, result)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA GUARDAR UN USUARIO
test('saveUser', async t => {
  const client = t.context.client
  let user = fixtures.getUser()
  let newUser = {
    username: user.username,
    name: user.name,
    email: 'correo@pixelgram.com',
    password: 'foo123'
  }

  nock(options.endpoints.users)
    .post('/', newUser)
    .reply(201, user)

  let result = await client.saveUser(newUser)
  t.deepEqual(result, user)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA OBTENER UN USUARIO
test('getUser', async t => {
  const client = t.context.client

  let user = fixtures.getUser()

  nock(options.endpoints.users)
    .get(`/${user.username}`)
    .reply(200, user)

  let result = await client.getUser(user.username)
  t.deepEqual(result, user)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL CONSUMO CORRECTO DE ENDPOINT PARA AUTENTICARNOS
test('auth', async t => {
  const client = t.context.client

  let credentials = {
    username: 'joel',
    password: 'foo123'
  }
  let token = 'xxx-xxxx-xxxx-xxx'

  nock(options.endpoints.auth)
    .post('/', credentials)
    .reply(200, token)

  let result = await client.auth(credentials.username, credentials.password)
  t.deepEqual(result, token)
})
