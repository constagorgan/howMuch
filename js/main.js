/*global requirejs, alert */
requirejs.config({
  waitSeconds: 60,
  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery',
        'moment',
        'countdown',
        'hammerjs',
        'jquery-hammerjs',
        'jquery-validation',
        'photoswipe',
        'photoswipeUi'
      ],
      exports: "Backbone"
    },
    underscore: {
      exports: "_"
    },
    bootstrap: {
      deps: [
        "jquery"
      ]
    },
    'bootstrap-datepicker': {
      deps: [
        "bootstrap"
      ]
    },
    'bootstrap-datetimepicker':{
      deps: [
        "bootstrap"
      ]
    },
    "responsive-img": {
      deps: [
        "jquery"
      ]
    }
  },
  paths: {
    backbone: "../bower_components/backbone/backbone",
    underscore: "../bower_components/underscore/underscore",
    bootstrap: "../bower_components/bootstrap/dist/js/bootstrap",
    jquery: "../bower_components/jquery/dist/jquery",
    "jquery-validation": "../bower_components/jquery-validation/dist/jquery.validate.min",
    propertyParser: "../bower_components/requirejs-plugins/src/propertyParser",
    "Markdown.Converter": "../bower_components/requirejs-plugins/lib/Markdown.Converter",
    text: "../bower_components/requirejs-plugins/lib/text",
    "responsive-img": "../bower_components/responsive-img.js/responsive-img",
    "requirejs-text": "../bower_components/requirejs-text/text",
    "moment": "../bower_components/moment/moment",
    "countdown": "../bower_components/countdownjs/countdown",
    "hammerjs": "../bower_components/hammerjs/hammer",
    "jquery-hammerjs": "../bower_components/jquery-hammerjs/jquery.hammer",
    "bootstrap-datepicker": "../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min",
    "bootstrap-datetimepicker": "../bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min",
    "recaptcha": "//www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit",
    "canvasCube": "scripts/canvasCube",
    "photoswipe": "../bower_components/photoswipe/dist/photoswipe.min",
    "photoswipeUi": "../bower_components/photoswipe/dist/photoswipe-ui-default.min"
  },
  packages: [{
    name: 'jquery-ui-autocomplete',
    location: '../bower_components/jquery-ui/ui',
    main: '/widgets/autocomplete' 
  }],
});

requirejs(["app"], function (App) {
  "use strict";
  App.init();
});

requirejs.onError = function (err) {
  "use strict";
  window.onerror(err.message, window.location.href, 0, 0, err);
  console.error(err);
};

function renderSignIn(id) {
  recaptchaSignInClientId = grecaptcha.render(id, {
    'sitekey': '6Leo-CsUAAAAAKvAFMcmOK1wPYO3cjNeJK8O922G',
    'theme': 'light'
  })
}
function renderCreateEvent(id) {
  recaptchaCreateEventClientId = grecaptcha.render(id, {
    'sitekey': '6Leo-CsUAAAAAKvAFMcmOK1wPYO3cjNeJK8O922G',
    'theme': 'light'
  })
}
function renderEditUser(id) {
  recaptchaEditUserClientId = grecaptcha.render(id, {
    'sitekey': '6Leo-CsUAAAAAKvAFMcmOK1wPYO3cjNeJK8O922G',
    'theme': 'light'
  })
}
window.renderSignInRecaptcha = renderSignIn;
window.renderCreateEventRecaptcha = renderCreateEvent;
window.renderEditUserRecaptcha = renderEditUser;

var onloadCallback = function() {
  if (!document.getElementById('g-recaptcha') || !document.getElementById('g-recaptcha-create')) {
    return;
  }
  window.renderSignIn('g-recaptcha')
  window.renderCreateEventRecaptcha('g-recaptcha-create')
  window.renderEditUser('g-recaptcha-edit-user')
}

if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}