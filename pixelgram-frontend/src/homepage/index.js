// asignar librerias a variables
var page = require('page')
var title = require('title')
var empty = require('empty-element')
var template = require('./template')
var request = require('superagent')
var header = require('../header')
var axios = require('axios')

page('/',header, loading, loadPicturesAsyncLoad, function (ctx, next) {
      title('Pixelgram - Home')
      var main = document.getElementById('main-container')

      empty(main).appendChild(template(ctx.pictures))
})

function loading (ctx, next){
  var el = document.createElement('div')
  el.classList.add('loader')

  document.getElementById('main-container').appendChild(el)
  next()
}

//llamada al web service, es 2015
async function loadPicturesAsyncLoad(ctx, next) {
  try {
    ctx.pictures = await fetch('/api/pictures').then(res => res.json());
    next();
  } catch (err) {
    return console.log(err);
  }
}


//funcion que carga las fotos
/*function loadPictures(ctx, next) {
  request
    .get('/api/pictures')
    .end(function (err, res) {
      if (err) return console.log(err)

      ctx.pictures = res.body
      next()
    })
}*/

/*
//funcion que carga las fotos
function loadPicturesAxios(ctx, next) {
  axios
    .get('/api/pictures')
    .then(function(res) {  
      ctx.pictures = res.data
      next()
    })
    .catch(function(err) {
      console.log(err)
    } )
}
*/

/*
function loadPicturesFetch(ctx, next) {
  fetch('api/pictures')
    .then(function(res) {
      return res.json()
    })
    .then(function(pictures) {
      ctx.pictures = pictures
      next()
    })
    .catch(function(err) {
      console.log(err)
    })
}
*/