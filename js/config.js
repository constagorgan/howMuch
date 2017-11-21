define(function () {

  var config = {}
  
  // Client config
  config.client = {}
  config.client.isProduction = true;
  
  // Server config
  config.server = {}
  config.server.url = 'https://api.eventsnitch.com/index.php?uri='
  
  
  // Chat config
  config.chat = {}
  config.chat.enable = true;
  config.chat.url = 'https://www.eventsnitch.net'
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  return config;
})
