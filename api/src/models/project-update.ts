import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-update');

export class PutProjectData {
  name: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutObjectivesData {
  objectives: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
    this.revision_count = obj?.revision_count ?? null;
  }
}
export interface IPutIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export class PutIUCNData {
  classificationDetails: IPutIUCN[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutIUCNData', message: 'params', obj });

    this.classificationDetails =
      (obj?.classificationDetails?.length &&
        obj.classificationDetails.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subClassification1,
            subClassification2: item.subClassification2
          };
        })) ||
      [];
  }
}
