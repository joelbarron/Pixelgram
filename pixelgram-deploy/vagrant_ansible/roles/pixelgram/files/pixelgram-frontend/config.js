'use strict'

const config = {
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY
  },
  client: {
    endpoints: {
      pictures: process.env.ENDPOINT_PICTURES_URL,
      users: process.env.ENDPOINT_USERS_URL,
      auth: process.env.ENDPOINT_AUTH_URL
    }
  },
  auth: {
    facebook: {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL
    }
  },
  secret: process.env.PIXELGRAM_SECRET || 'pixel',
  port: process.env.PORT ||5050,
  socketIoUrl: process.env.SOCKET_IO_URL || 'http://pixelgram-ws.usbix.com.mx'
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
