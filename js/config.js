define(function () {

  var config = {}
  
  // Server config
  config.server = {}
  config.server.url = 'http://192.168.0.101:8003'
  
  
  // Chat config
  config.chat = {}
  config.chat.enable = true;
  config.chat.url = 'http://192.168.0.101:8081'
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  return config;
})
