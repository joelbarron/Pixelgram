var page = require('page')
var header = require('../header')
var title = require('title')
var empty = require('empty-element')
var template = require('./template')

page('/:username', header, loadUser, function (ctx, next) {
    var main =  document.getElementById('main-container')
    title(`Pixelgram - ${ctx.params.username}`)
    empty(main).appendChild(template(ctx.user))
})


page('/:username/:id', header, loadUser, function (ctx, next) {
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
    try{
        ctx.user = await fetch(`/api/user/${ctx.params.username}`).then(res => res.json())
        next()
    }catch (err) {
        console.log(err)
    }

}