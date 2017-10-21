var page = require('page')
var title = require('title')
var empty = require('empty-element')
var template = require('./template')
var header = require('../header')
var axios = require('axios')
var utils =require('../utils')

page('/:username', utils.loadAuth, header, loadUser, function (ctx, next) {
    var main = document.getElementById('main-container')
    title(`Pixelgram - ${ctx.params.username}`)
    empty(main).appendChild(template(ctx.user))
})


page('/:username/:id', utils.loadAuth, header, loadUser, function (ctx, next) {
    var main =  document.getElementById('main-container')
    title(`Pixelgram - ${ctx.params.username}`)
    empty(main).appendChild(template(ctx.user))

    $('.modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.

        },
        complete: function() { // Callback for Modal close
            page(`/${ctx.params.username}`)
         }
      }
    );

    $(`#modal${ctx.params.id}`).modal('open');

})


async function loadUser(ctx, next) {

  await axios.get(`/api/user/${ctx.params.username}`)
  .then(function (res) {
    ctx.user = res.data
    next()
  })
  .catch(function (err) {
    if (err) {console.log(err);}
  })
}
