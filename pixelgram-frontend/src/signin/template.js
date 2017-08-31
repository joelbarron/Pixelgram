// TEMPLATE DE SIGNIN

var yo = require('yo-yo')
var landing = require('../landing')
var translate = require('../translate')


var signinForm = yo
`
<div class="col s12 m7">
  <div class="row">
    <div class="signup-box">
      <h1 class="platzigram">Platzigram</h1>
      <form class="signup-form">        
        <div class="section"><a href="" class="btn btn-fb hidden-on-small-only">${translate.message('signup.facebook')}</a><a href="" class="btn btn-fb hide-on-med-and-up">${translate.message('signup.text')}</a></div>
        <div class="divider"></div>
        <div class="section">
          <input type="text" name="username" value="" placeholder="${translate.message('username')}"/>
          <input type="password" name="password" value="" placeholder="${translate.message('password')}"/>
          <button type="submit" name="button" class="btn waves-effect waves-light btn-signup">${translate.message('signin')}</button>
        </div>
      </form>
    </div>
  </div>
<div class="row">
 <div class="login-box">${translate.message('signin.not-have-account')} <a href="/signup">${translate.message('signup.call-to-action')}</a></div>
</div>
`


module.exports = landing(signinForm)
