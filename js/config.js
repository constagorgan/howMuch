define(function () {

  var config = {}
  
  // Server config
  config.server = {}
  config.server.url = 'http://192.168.0.104:8003'
  
  
  // Chat config
  config.chat = {}
  config.chat.enable = false;
  config.chat.url = 'http://192.168.0.104:8081'
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  return config;
})
