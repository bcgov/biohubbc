var clamav=require('clamav.js');

clamav.ping(443, 'clamav-af2668-dev.apps.silver.devops.gov.bc.ca', 1000, function(err) {
  if (err) {
    console.log('127.0.0.1:3310 is not available['+err+']');
  }
  else {
    console.log('127.0.0.1:3310 is alive');
  }
});
