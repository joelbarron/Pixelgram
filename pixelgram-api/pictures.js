'use strict'

import { send, json } from 'micro'
import HttpHash from 'http-hash'
import Db from 'pixelgram-db'
import config from './config'
import DbStub from './test/stub/db'
import utils from './lib/utils'

// TRAER LA VARIABLE DE ENTORNO PARA DECIDIR LA DB A USAR
const env = process.env.NODE_ENV || 'test'
let db = new Db(config.db)

// SI ES PRUEBA LLAMAMOS NUESTRA CLASE STUB
if (env === 'test') {
  db = new DbStub()
}

// OBJ PARA LOS ENDPOINTS
const hash = HttpHash()

// ENDPOINT GET :: OBTENER UNA LISTA DE IMAGENES POR TAG
hash.set('GET /tag/:tag', async function byTag (req, res, params) {
  let tag = params.tag
  await db.connect()
  let images = await db.getImagesByTag(tag)
  await db.disconnect()
  send(res, 200, images)
})

// ENDPOINT GET :: OBTENER UNA LISTA DE IMAGENES
hash.set('GET /list', async function list (req, res, params) {
  await db.connect()
  let images = await db.getImages()
  await db.disconnect()
  send(res, 200, images)
})

// ENDPOINT GET :: OBTENER UNA IMAGEN
hash.set('GET /:id', async function getPicture (req, res, params) {
  let id = params.id
  await db.connect()
  let image = await db.getImage(id)
  await db.disconnect()
  send(res, 200, image)
})

// ENDPOINT POST :: GUARDAR IMAGENES
hash.set('POST /', async function postPicture (req, res, params) {
  let image = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)

    if (encoded && encoded.userId !== image.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let created = await db.saveImage(image)
  await db.disconnect()
  send(res, 201, created)
})

// ENDPOINT POST :: DAR UN LIKE
hash.set('POST /:id/like', async function likePicture (req, res, params) {
  let id = params.id
  await db.connect()
  let image = await db.likeImage(id)
  await db.disconnect()
  send(res, 200, image)
})

export default async function main (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, { error: e.message })
    }
  } else {
    send(res, 404, { error: 'route not found' })
  }
}
