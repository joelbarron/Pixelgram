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

test.beforeEach(t => {
  t.context.client = pixelgram.createClient(options)
})

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

test('getPicture', async t => {
  const client = t.context.client

  let image = fixtures.getImage()

  nock(options.endpoints.pictures)
    .get(`/${image.publicId}`)
    .reply(200, image)

  let result = await client.getPicture(image.publicId)
  t.deepEqual(image, result)
})

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
