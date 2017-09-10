'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures'
import utils from '../lib/utils'
import config from '../config'
import auth from '../auth'

// ESTE TEST SE EJECUTA PRIMERO QUE TODOS LOS DEMAS Y SE ENCARGA DE:
// LEVANTAR EL SERVICIO
test.beforeEach(async t => {
  let srv = micro(auth)
  t.context.url = await listen(srv)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDA DE:
// AUTENTICACION
test('success POST /', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      username: user.username,
      password: user.password
    }
  }

  let token = await request(options)
  let decoded = await utils.verifyToken(token, config.secret)

  t.is(decoded.username, user.username)
})
