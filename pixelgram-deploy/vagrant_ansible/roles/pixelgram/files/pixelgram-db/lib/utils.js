'use strict'
const crypto = require('crypto')

// Exportar las funciones
const utils = {
  extractTags,
  encrypt,
  normalize
}

// FUNCION PARA EXTRAER LOS TAGS
function extractTags (text) {
  if (text == null) return []

  let matches = text.match(/#(\w+)/g)

  if (matches === null) return []

  matches = matches.map(normalize)

  return matches
}

// FUNCION PARA ENCTIPTAR UNA CONTRASEÑA
function encrypt (password) {
  let shasum = crypto.createHash('sha256')
  shasum.update(password)
  return shasum.digest('hex')
}

// FUNCION AUXILIAR PARA NORMALIZAR UN TEXTO
function normalize (text) {
  text = text.toLowerCase()
  text = text.replace(/#/g, '')
  return text
}

module.exports = utils
