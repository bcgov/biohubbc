var clamav=require('clamav.js');

clamav.version(443, 'clamav-af2668-dev.apps.silver.devops.gov.bc.ca', 1000, function(err, version) {
  if (err) {
    console.log('Version is not available['+err+']');
    console.log(err);
  }
  else {
    console.log('Version is ['+version+']');
  }
});
