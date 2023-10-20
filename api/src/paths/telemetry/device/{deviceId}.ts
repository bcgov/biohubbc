import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { BctwService, IBctwUser } from '../../../services/bctw-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/telemetry/device/{deviceId}');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getDeviceDetails()
];

GET.apiDoc = {
  description: 'Get a list of metadata changes to a device from the exterior telemetry system.',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Device change history response',
      content: {
        'application/json': {
          schema: {
            type: 'object'
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getDeviceDetails(): RequestHandler {
  return async (req, res) => {
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const bctwService = new BctwService(user);
    const deviceId = Number(req.params.deviceId);
    try {
      const results = await bctwService.getDeviceDetails(deviceId);
      const deployments = await bctwService.getDeviceDeployments(deviceId);
      const keyXResult = await bctwService.getKeyXDetails([deviceId]);
      const keyXStatus = keyXResult?.[0]?.keyx?.idcollar === deviceId;
      const retObj = {
        device: results?.[0],
        keyXStatus: keyXStatus,
        deployments: deployments
      };
      return res.status(200).json(retObj);
    } catch (error) {
      defaultLog.error({ label: 'getDeviceDetails', message: 'error', error });
      throw error;
    }
  };
}
