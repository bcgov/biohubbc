import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { IBctwUser } from '../../../models/bctw';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../services/bctw-service/bctw-deployment-service';
import { BctwDeviceService } from '../../../services/bctw-service/bctw-device-service';
import { BctwKeyxService } from '../../../services/bctw-service/bctw-keyx-service';
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

    const bctwDeviceService = new BctwDeviceService(user);
    const bctwKeyxService = new BctwKeyxService(user);
    const bctwDeploymentService = new BctwDeploymentService(user);

    const deviceId = Number(req.params.deviceId);

    const deviceMake = String(req.query.make);

    try {
      const results = await bctwDeviceService.getDeviceDetails(deviceId, deviceMake);

      const deployments = await bctwDeploymentService.getDeploymentsByDeviceId(deviceId, deviceMake);

      const keyXResult = await bctwKeyxService.getKeyXDetails([deviceId]);

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
