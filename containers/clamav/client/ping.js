var clamav=require('clamav.js');

clamav.ping(3310, '127.0.0.1', 1000, function(err) {
  if (err) {
    console.log('127.0.0.1:3310 is not available['+err+']');
  }
  else {
    console.log('127.0.0.1:3310 is alive');
  }
});