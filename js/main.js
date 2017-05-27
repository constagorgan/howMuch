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
        'jquery-validation'
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
    "recaptcha": "//www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
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

  alert(err.message);
};

function render(id) {
  recaptchaClientId = grecaptcha.render(id, {
    'sitekey': '6LdIPiEUAAAAADpCLXZq58cHe1N62KTMBUq4gXea',
    'theme': 'light'
  });
};
window.renderRecaptcha = render;


var onloadCallback = function() {
  if (!document.getElementById('g-recaptcha')) {
    return;
  }
  window.renderRecaptcha('g-recaptcha');
};

