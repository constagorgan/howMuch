define(function () {

  var config = {}
  
  // Server config
  config.server = {}
  config.server.url = 'http://localhost:8003'
  
  
  // Chat config
  config.chat = {}
  config.chat.enable = true;
  config.chat.url = 'http://localhost:8081'
  
  
  /*
  ** external resources
  */
  
  // Iplocator config
  config.iplocator = {}
  config.iplocator.url = 'https://freegeoip.net/json/'
  
  // Location service config
  config.locationService = {}
  config.locationService.query = {}
  config.locationService.url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
  config.locationService.query.suggest = config.locationService.url + '/suggest'
  config.locationService.query.findAddress = config.locationService.url + '/findAddressCandidates'
  
  return config;
})