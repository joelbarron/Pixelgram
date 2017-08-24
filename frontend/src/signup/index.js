// asignar librerias a variables
var page = require('page')
var empty = require('empty-element')
var template = require('./template')
var title = require('title')


// crear la ruta
page('/signup', function (ctx, next) {
      title('Platzigram - Signup')
      var main = document.getElementById('main-container')

      // asignar el template
      empty(main).appendChild(template)
})
