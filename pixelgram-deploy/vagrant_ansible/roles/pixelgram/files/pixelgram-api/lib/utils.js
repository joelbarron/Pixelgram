'use strict'

import jwt from 'jsonwebtoken'
import bearer from 'token-extractor'

export default {
  // METODO PARA FIRMAR UN TOKEN
  async signToken (payload, secret, options) {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) return reject(err)

        resolve(token)
      })
    })
  },
  // METODO PARA VERIFICAR UN TOKEN
  async verifyToken (token, secret, options) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (err, decoded) => {
        if (err) return reject(err)

        resolve(decoded)
      })
    })
  },
  async extractToken (req) {
    // Autorization: Bearer <token>
    return new Promise((resolve, reject) => {
      bearer(req, (err, token) => {
        if (err) return reject(err)

        resolve(token)
      })
    })
  }
}
