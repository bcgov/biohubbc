import { Operation } from 'express-openapi';
// import { SYSTEM_ROLE } from '../../constants/roles';
// import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { Request, RequestHandler, Response } from 'express';
import { critterbase } from '../../routers/constants';
import { AxiosRequestConfig } from 'axios';

const setHeaders = (config: AxiosRequestConfig, req: Request, headers: string[]) => {
  headers.forEach((head) => {
    if (req.headers?.[head]) {
      config.headers[head] = req.headers[head];
    }
  });
  return config;
};

const getCb = (): RequestHandler => {
  return async (req: Request, res: Response) => {
    try {
      const { data } = await critterbase.get(req.url);
      return res.send(data);
    } catch (e) {
      console.log(JSON.stringify(e));
      return res.status(500).send(JSON.stringify(e));
    }
  };
};

const postCb = (): RequestHandler => {
  return async (req: Request, res: Response) => {
    try {
      critterbase.interceptors.request.use((config) =>
        setHeaders(config, req, ['keycloak-uuid', 'user-id', 'api-key'])
      );
      const modifiedUrl = String(req.url).replace('/api/critterbase/', '');
      const { data } = await critterbase.post(modifiedUrl, req.body);
      return res.send(data);
    } catch (e) {
      console.log(JSON.stringify(e));
      return res.status(500).send(JSON.stringify(e));
    }
  }
}

export const GET: Operation = [
  // authorizeRequestHandler(() => { 
  //   return {
  //     and: [
  //       {
  //         validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR],
  //         discriminator: 'SystemRole'
  //       }
  //     ]
  //   };
  // }),
  getCb()
]




export const POST: Operation = [
  // authorizeRequestHandler(() => {
  //   return {
  //     and: [
  //       {
  //         validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR],
  //         discriminator: 'SystemRole'
  //       }
  //     ]
  //   };
  // }),
  postCb()
];

POST.apiDoc = {
  description: 'Forward a GET request to Critterbase',
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Whateva',
    content: {
      'application/json' : {
        schema: {
          type: 'object',
          required: ['keycloak_uuid', 'system_user_id', 'system_name'],
          properties: {
            keycloak_uuid: {
              title: 'Keycloak',
              type: 'string'
            },
            system_user_id: {
              title: 'system_user_id',
              type: 'string'
            },
            system_name: {
              title: 'system_name',
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Response object',
      content: {
        'application/json':{
          schema: {
            type: 'object'
          }
        }
      }
    }
  }
};
