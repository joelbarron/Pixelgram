// template
var yo = require('yo-yo')
var translate = require('../translate')


module.exports = function (pic) {

var el;

  function render (picture) {
    return yo
    `
    <div class="card">
      <div class="card-image">
        <img class="activator" src="${picture.src}" ondblclick=${like.bind(null, null, true)}/">
        <i class="fa fa-heart like-heart ${picture.likedHeart ? 'liked' : ''}"></i>
      </div>
      <div class="card-content">
        <a class="card-title" href="/${picture.user.username}" rel="external">
          <img src="${picture.user.avatar}" class="avatar" />
          <span class="username">${picture.user.name || picture.user.username}</span>
        </a>
        <small class="right time">${translate.date.format(new Date(picture.createdAt).getTime())}</small>
        <p class="${picture.liked ? 'liked' : 'unliked'}">
          <a class="left" href="#" onclick=${like.bind(null, true, null)}><i class="fa fa-heart-o" aria-hidden="true"></i></a>
          <a class="left" href="#" onclick=${like.bind(null, false, null)}><i class="fa fa-heart" aria-hidden="true"></i></a>
          <span class="left likes">${translate.message('likes', { likes: picture.likes || 0})}</span>
        </p>
      </div>
    </div>
    `
  }


  function like (liked, dblclick) {

    //verificar si es de doble click
    if(dblclick) {
      pic.likedHeart = pic.liked = !pic.liked
      liked = pic.liked
    }
    else {
      pic.liked = liked
    }

    //determinar la cantidad de likes
    pic.likes += liked ? 1 : -1

    // funcion para renderizar
    function doRender() {
      var newEl = render(pic)
      yo.update(el, newEl)
    }

    //renderizar
    doRender()

    setTimeout(function () {
      //quitar corazon
      pic.likedHeart = false
      //renderizar otra vez
      doRender()
    }, 1500)

    return false
  }


  el = render(pic)
  return el
}
