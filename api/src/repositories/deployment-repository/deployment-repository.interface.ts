import { z } from 'zod';
import { CritterRecord } from '../../database-models/critter';
import { DeploymentRecord } from '../../database-models/deployment';
import { DeviceRecord } from '../../database-models/device';

export const CreateDeployment = DeploymentRecord.omit({
  deployment2_id: true
});

export type CreateDeployment = z.infer<typeof CreateDeployment>;

export const ExtendedDeploymentRecord = DeploymentRecord.merge(
  DeviceRecord.pick({
    device_make_id: true,
    model: true
  }).merge(
    CritterRecord.pick({
      critterbase_critter_id: true
    })
  )
);

export type ExtendedDeploymentRecord = z.infer<typeof ExtendedDeploymentRecord>;

export const UpdateDeployment = DeploymentRecord.omit({
  deployment2_id: true,
  survey_id: true
});

export type UpdateDeployment = z.infer<typeof UpdateDeployment>;
