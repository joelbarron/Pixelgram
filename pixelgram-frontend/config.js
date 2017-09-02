'use strict'

const config = {
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY
  },
  client: {
    endpoints: {
      pictures: 'http://api.pixelgram.test/picture',
      users: 'http://api.pixelgram.test/user',
      auth: 'http://api.pixelgram.test/auth'
    }
  },
  auth: {
    facebook: {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://pixelgram.test:5050/auth/facebook/callback'
    }
  },
  secret: process.env.PIXELGRAM_SECRET || 'pixel',
  port: process.env.PORT ||5050
}

// configuracion para desarrollo
if (process.env.NODE_ENV !== 'production') {

  config.client.endpoints = {
    pictures: 'http://localhost:5000',
    users: 'http://localhost:5001',
    auth: 'http://localhost:5002'
  }

  config.auth.facebook.callbackURL = 'http://pixelgram.test:5050/auth/facebook/callback'

}

module.exports = config
