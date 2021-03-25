var clamav=require('clamav.js');

clamav.createScanner(3310, '127.0.0.1').scan('sample_files'
    , function(err, object, malicious) {
  if (err) {
    console.log(object+': '+err);
  }
  else if (malicious) {
    console.log(object+': '+malicious+' FOUND');
  }
  else {
    console.log(object+': OK');
  }
});