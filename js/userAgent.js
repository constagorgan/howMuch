/*global define, console, alert */
/*jslint nomen: true */
define([], function () {
  "use strict";

  /**
   * Determine the mobile operating system.
   * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
   *
   * @returns {String}
   */
  function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }

    return "unknown";
  }
  
  function getIOSSafari(){
    var ua = navigator.userAgent
    var webkit = !!ua.match(/WebKit/i)
    var iOSSafari = webkit && !ua.match(/CriOS/i)

    return iOSSafari
  }

  var userAgentFunctions = {
    getMobileOperatingSystem: getMobileOperatingSystem,
    getIOSSafari: getIOSSafari
  }

  return userAgentFunctions;
});
