var clamav=require('clamav.js');

clamav.version(3310, '127.0.0.1', 1000, function(err, version) {
  if (err) {
    console.log('Version is not available['+err+']');
  }
  else {
    console.log('Version is ['+version+']');
  }
});