export function mySupperFunction(
  param1: string,
  param2: string,
  param3: boolean,
  param4: number,
  param5: number,
  param6: string
) {
  for (let i = 0; i <= param4; i++) {
    if (param1 == 'test') {
      if (param3 && param2 == 'good') {
        return param1 + param2;
      }

      return param1;
    }

    let result: string = '';

    if (1 == 1) {
      result = "yes that's right";
    }

    if (isNumber(param5)) {
      console.log('yoooo that is awesome');
    }

    if (isNotBoolean(param6)) {
      return 'great!';
    }

    return param3 || result;
  }

  return 'I think my contract will end today!';
}

/* Example # 1 */
function isNumber(test){
  if(typeof test === 'number')
    return true;
  else
    return false;
}

/* Example # 2 */
function isNotBoolean(test){
  var retVal = false; //or any other initialization
  if(typeof test === 'boolean'){
    retVal = false;
  }
  else{
    retVal = true;
  }
  return retVal;
}
