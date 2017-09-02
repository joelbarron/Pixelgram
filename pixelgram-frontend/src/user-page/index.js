/**
 * Module dependencies
 */

import page from 'page';
import template from './template';
import title from 'title';
import empty from 'empty-element';
import header from '../header';
import utils from '../utils';
import axios from 'axios';

page('/:username', utils.loadAuth, loadUser, header, function (ctx, next) {
  var main = document.getElementById('main-container');
  title(`Pixelgram - ${ctx.user.username}`);
  empty(main).appendChild(template(ctx.user));
  $('.modal-trigger').leanModal();
});

page('/:username/:id', utils.loadAuth, loadUser, header, function (ctx, next) {
  var main = document.getElementById('main-container');
  title(`Pixelgram - ${ctx.user.username}`);
  empty(main).appendChild(template(ctx.user));

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
        page(`/${ctx.user.name || ctx.params.username}`)
     }
  }
);

$(`#modal${ctx.params.id}`).modal('open');


});


async function loadUser(ctx, next) {
  try {
    ctx.user = await axios.get(`/api/user/${ctx.params.username}`).then(res => res.data)

    console.log(ctx.user)
  } catch (err) {
    console.log(err)
  }
}
