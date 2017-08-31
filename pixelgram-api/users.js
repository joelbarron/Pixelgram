'use strict'

import { send, json } from 'micro'
import HttpHash from 'http-hash'
import Db from 'pixelgram-db'
import config from './config'
import DbStub from './test/stub/db'

// TRAER LA VARIABLE DE ENTORNO PARA DECIDIR LA DB A USAR
const env = process.env.NODE_ENV || 'test'
let db = new Db(config.db)

// SI ES PRUEBA LLAMAMOS NUESTRA CLASE STUB
if (env === 'test') {
  db = new DbStub()
}

// OBJ PARA LOS ENDPOINTS
const hash = HttpHash()

// ENDPOINT POST :: GUARDAR IMAGENES
hash.set('POST /', async function postUser (req, res, params) {
  let user = await json(req)
  await db.connect()
  let created = await db.saveUser(user)
  await db.disconnect()

  delete created.email
  delete created.password

  send(res, 201, created)
})

// ENDPOINT GET :: OBTENER USERS
hash.set('GET /:username', async function getUser (req, res, params) {
  let username = params.username
  await db.connect()
  let user = await db.getUser(username)
  await db.disconnect()

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
