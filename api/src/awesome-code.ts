import { RequestHandler } from "express";
import { Operation } from "express-openapi";
import { HTTP400 } from "./errors/CustomError";
import { getLogger } from "./utils/logger";

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/list');

export const GET: Operation = [getMediaList()];

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

function getFileListFromS3(s: string) {
  return { Contents: [ { Key: s, LastModified: '2222' } ] };
}

function getMediaList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get artifact list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const ContentsList = await getFileListFromS3(req.params.projectId + '/');

    defaultLog.debug({ label: 'getFileListFromS3:', message: 'Content', ContentsList });

    const fileList: any[] = [];

    if (!ContentsList) {
      throw new HTTP400('Failed to get the content list');
    }

    const contents = ContentsList.Contents;

    contents?.forEach(function (content) {
      const file = {
        fileName: content.Key,
        lastModified: content.LastModified
      };

      fileList.push(file);
    });

    defaultLog.debug({ label: 'getMediaList', message: 'fileList', fileList });

    return res.status(200).json(fileList);
  };
}
