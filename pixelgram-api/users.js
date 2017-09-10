'use strict'

import { send, json } from 'micro'
import HttpHash from 'http-hash'
import Db from 'pixelgram-db'
import config from './config'
import DbStub from './test/stub/db'
import gravatar from 'gravatar'
var util = require('util')

// TRAER LA VARIABLE DE ENTORNO PARA DECIDIR LA DB A USAR
const env = process.env.NODE_ENV || 'develop' // test (tambien para ejecutar las pruebas)
let db = new Db(config.db)
console.log(`La variable de entorno NODE_ENV: ${env}`)
console.log(`La variable de entorno PIXELGRAM_SECRET: ${config.secret}`)
console.log(`La variable de setup DB: ${config.db.setup}`)

// SI ES PRUEBA LLAMAMOS NUESTRA CLASE STUB
if (env === 'test') {
  db = new DbStub()
}

// OBJ PARA LOS ENDPOINTS
const hash = HttpHash()

// ENDPOINT POST :: GUARDAR USERS
hash.set('POST /', async function postUser (req, res, params) {
  let user = await json(req)
  await db.connect()
  let created = await db.saveUser(user)
  await db.disconnect()

  delete created.email
  delete created.password

  send(res, 201, created)
})

// ENDPOINT GET :: OBTENER USERS Y SUS IMAGENES
hash.set('GET /:username', async function getUser (req, res, params) {
  let username = params.username
  await db.connect()
  let user = await db.getUser(username)
   // obtener imagenes
  let images = await db.getImagesByUser(username)

  // obtener un avatar de GRAVATAR
  user.avatar = gravatar.url(user.email)

  if (images) {
    user.pictures = images
  } else {
    user.pictures = 'nothing to send'
  }

  delete user.email
  delete user.password

  send(res, 200, user)
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
