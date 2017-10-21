'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures'
import users from '../users'

// ESTE TEST SE EJECUTA PRIMERO QUE TODOS LOS DEMAS Y SE ENCARGA DE:
// LEVANTAR EL SERVICIO
test.beforeEach(async t => {
  let srv = micro(users)
  t.context.url = await listen(srv)
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDA DE:
// EL ENDPOINT POST DE LOS USUARIOS
test('POST /', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)

  delete user.email
  delete user.password

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, user)
})

test('GET /:username', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'GET',
    uri: `${url}/${user.username}`,
    json: true
  }

  let body = await request(options)

  delete user.email
  delete user.password

  t.deepEqual(body, user)
})
