var clamav=require('clamav.js');

clamav.createScanner(443, 'clamav-af2668-dev.apps.silver.devops.gov.bc.ca').scan('sample_files'
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
