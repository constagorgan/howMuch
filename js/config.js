define(function () {

  var config = {}
  
  //server config
  config.server = {}
  config.server.url = 'http://localhost:8003'
  
  
  //chat config
  config.chat = {}
  config.chat.enable = false;
  config.chat.url = 'http://localhost:8081'
  
  
  //external resources
  config.iplocator = {}
  config.iplocator.url = "http://freegeoip.net/json/"
  
  return config;
})