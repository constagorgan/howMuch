define(function () {

  var config = {}
  
  // Server config
  config.server = {}
  config.server.url = 'https://api.eventsnitch.com/index.php?uri='
  
  
  // Chat config
  config.chat = {}
  config.chat.enable = false;
  config.chat.url = 'https://www.eventsnitch.net'
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  return config;
})
