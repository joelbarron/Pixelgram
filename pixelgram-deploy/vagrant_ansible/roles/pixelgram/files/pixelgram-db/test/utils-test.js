'use strict'

const test = require('ava')
const utils = require('../lib/utils')

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// OBTENER LOS TAGS DE UN TEXTO (ejemplo: #Tag = tag)
// ADEMAS CONVIERTE TODO A MINUSCULAS
test('extracting hashtags from text', t => {
  let tags = utils.extractTags('a #picture wIth tags #aWesome #100 #Platzi #ava')

  t.deepEqual(tags, [
    'picture',
    'awesome',
    '100',
    'platzi',
    'ava'
  ])

  tags = utils.extractTags('a picture with no tags')
  t.deepEqual(tags, [])

  tags = utils.extractTags(null)
  t.deepEqual(tags, [])
})

// ESTE TEST SIRVE PARA PROBAR LA FUNCIONALIDAD DE:
// LA ENCRIPTACION DE UN PASSWORD
test('encrypt password', t => {
  let password = 'foo123'
  let encrypted = '02b353bf5358995bc7d193ed1ce9c2eaec2b694b21d2f96232c9d6a0832121d1'

  let result = utils.encrypt(password)
  t.is(result, encrypted)
})
