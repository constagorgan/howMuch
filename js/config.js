define(function () {

  var config = {}
  
  // Server config
  config.server = {}
  config.server.url = 'https://eventsnitch.com:8003'
  
  
  // Chat config
  config.chat = {}
  config.chat.enable = false;
  config.chat.url = 'https://eventsnitch.com:8081'
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  return config;
})
