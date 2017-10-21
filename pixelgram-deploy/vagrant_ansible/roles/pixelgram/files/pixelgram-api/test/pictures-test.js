'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures'
import utils from '../lib/utils'
import config from '../config'
import pictures from '../pictures'

// ESTE TEST SE EJECUTA PRIMERO QUE TODOS LOS DEMAS Y SE ENCARGA DE:
// LEVANTAR EL SERVICIO
test.beforeEach(async t => {
  let srv = micro(pictures)
  t.context.url = await listen(srv)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL ENDPOINT GET DE LAS PICTURES
test('GET /:id', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let body = await request({ uri: `${url}/${image.publicId}`, json: true })
  t.deepEqual(body, image)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDA DE:
// EL ENDPOINT POST DE LAS PICTURES PARA UN TOKEN INVALIDO
test('no token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    resolveWithFullResponse: true
  }

  await t.throws(request(options), /invalid token/)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDA DE:
// EL ENDPOINT POST DE LAS PICTURES PARA UN TOKEN "VALIDO"
test('secure token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: image.userId }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, image)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDA DE:
// EL ENDPOINT POST DE LAS PICTURES PARA UN TOKEN "INTERCEPTADO O MODIFICADO"
test('invalid token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: 'hacky' }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  await t.throws(request(options), /invalid token/)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL ENDPOINT POST PARA DAR LIKE
test('POST /:id/like', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: `${url}/${image.id}/like`,
    json: true
  }

  let body = await request(options)
  let imageNew = JSON.parse(JSON.stringify(image))
  imageNew.liked = true
  imageNew.likes = 1

  t.deepEqual(body, imageNew)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL ENDPOINT GET PARA OBTENER LA LISTA DE PICTURES
test('GET /list', async t => {
  let images = fixtures.getImages()
  let url = t.context.url

  let options = {
    method: 'GET',
    uri: `${url}/list`,
    json: true
  }

  let body = await request(options)
  t.deepEqual(body, images)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// EL ENDPOINT GET PARA OBTENER LA LISTA DE PICTURES POR TAG
test('GET /tag/:tag', async t => {
  let images = fixtures.getImagesByTag()
  let url = t.context.url

  let options = {
    method: 'GET',
    uri: `${url}/tag/awesome`,
    json: true
  }

  let body = await request(options)
  t.deepEqual(body, images)
})
