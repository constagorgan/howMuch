define(function () {

  var config = {}
  
  // Client config
  config.client = {}
  config.client.isProduction = false;
  
  // Server config
  config.server = {}
  config.server.url = 'http://localhost:8003/index.php?uri=';
  
  // Chat config
  config.chat = {}
  config.chat.enable = false;
  config.chat.url = 'http://localhost:8080';
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  return config;
})
