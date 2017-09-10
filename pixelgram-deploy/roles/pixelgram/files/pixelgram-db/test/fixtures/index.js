'use strict'
const uuid = require('uuid-base62')

const fixtures = {
  /**
   *
   *
   * @returns imagen de prueba
   */
  getImage () {
    return {
      description: 'an #awesome picture with #tags #pixel',
      url: 'something url',
      likes: 0,
      liked: false,
      userId: uuid.uuid()
    }
  },
  /**
   *
   *
   * @param {any} n cantidad de imagenes a generar
   * @returns un array de imagenes
   */
  getImages (n) {
    let images = []
    while (n-- > 0) {
      images.push(this.getImage())
    }
    return images
  },
  /**
   *
   *
   * @returns a user for test
   */
  getUser () {
    return {
      name: 'A random User',
      username: `user_${uuid.v4()}`,
      password: uuid.uuid(),
      email: `${uuid.v4()}@pixelgram.com`
    }
  }
}

module.exports = fixtures
