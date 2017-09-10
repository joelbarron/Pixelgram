'use strict'

const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 28015,
    db: process.env.DB_NAME || 'pixelgram',
  }
}

module.exports = config
