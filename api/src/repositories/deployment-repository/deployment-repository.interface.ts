import { DeploymentRecord } from '../../database-models/deployment';

export type CreateDeployment = Omit<DeploymentRecord, 'deployment2_id'>;

export type UpdateDeployment = DeploymentRecord;
