var fs=require('fs');
var clamav=require('clamav.js');

var stream = fs.createReadStream('scandirectory.js');
clamav.createScanner(3310, '127.0.0.1').scan(stream
    , function(err, object, malicious) {
  if (err) {
    console.log(object.path+': '+err);
  }
  else if (malicious) {
    console.log(object.path+': '+malicious+' FOUND');
  }
  else {
    console.log(object.path+': OK');
  }
});