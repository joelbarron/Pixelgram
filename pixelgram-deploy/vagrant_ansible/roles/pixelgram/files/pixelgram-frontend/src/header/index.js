var yo = require('yo-yo')
var translate = require('../translate')
var empty = require('empty-element')

var authCard = function (ctx) {
    var authentidated = yo `
    <div class="col s3 m5 push-s9 push-m1">
        <div class="row">
            <div class="col s3">
                <i class="fa fa-user-o" aria-hidden="true"></i>
            </div>
            <div class="col s9">
                <span class="flow-text" style="font-size:0.9rem;">${ctx.auth.name || ctx.auth.username}</span>
                <a href="/logout" rel="external" class="btn btn-large btn-flat">${translate.message('logout')}</a>
            </div>
        </div>
    </div>
    `

    var signin = yo `
    <div class="col s2 m2 push-s10 push-m3">
    <a href="/signin" rel="external" class="btn btn-large btn-flat" style="font-size:0.9rem;">
        ${translate.message('signin')}
    </a>
    `

    if (ctx.auth === false) {
        return signin
    }
    else {
        return authentidated
    }
}

var renderHeader = function(ctx) {
    return yo `
    <nav class="header">
        <div class="wrapper">
            <div class="container">
                <div class="row">
                    <div class="col s12 m6 offset-m1">
                    <a href="/" rel="external" class="brand-logo platzigram">Pixelgram</a>
                    </div>
                    ${authCard(ctx)}
                </div>
            </div>
        </div>
    </nav>
    `
}


module.exports = function header (ctx, next) {
    var container = document.getElementById('header-container')
    empty(container).appendChild(renderHeader(ctx))
    next()
}



// <ul id="drop-user" class="dropdown-content drop-user-options">
// <li><a href="/logout" rel="external">${translate.message('logout')}</a></li>
// </ul>

// dropdown-button btn-user-options" data-activates="drop-user