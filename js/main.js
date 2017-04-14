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
    "jquery-ui": "../bower_components/jquery-ui/jquery-ui",
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
    "bootstrap-datepicker": "../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min"
  },
  packages: [

  ]
});

requirejs(["app"], function (App) {
  "use strict";

  App.init();
});

requirejs.onError = function (err) {
  "use strict";

  alert(err.message);
};
