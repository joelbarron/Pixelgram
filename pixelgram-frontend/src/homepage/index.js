// asignar librerias a variables
var page = require('page')
var title = require('title')
var empty = require('empty-element')
var template = require('./template')
var header = require('../header')
var axios = require('axios')
var utils =require('../utils')

page('/', utils.loadAuth, header, loading, loadPictures, function (ctx, next) {
  title('Pixelgram - Home')

  var main = document.getElementById('main-container')
  empty(main).appendChild(template(ctx.pictures))
})

function loading (ctx, next){
  // var el = document.createElement('div')
  // el.classList.add('loader')

  // document.getElementById('main-container').appendChild(el)
  // next()


  var container = document.createElement('div');
  var loadingEl = document.createElement('div');
  container.classList.add('loader-container');
  loadingEl.classList.add('loader');
  container.appendChild(loadingEl);
  var main = document.getElementById('main-container');
  empty(main).appendChild(container);
  next();
}

//funcion que carga las fotos
async function loadPictures(ctx, next) {

    await axios.get('/api/pictures')
    .then(function (res) {
      ctx.pictures = res.data
      next()
    })
    .catch(function (err) {
      if (err) {console.log(err);}
    })

}
