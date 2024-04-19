import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { PROJECT_ROLE } from '../constants/roles';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-create');

/**
 * Processes all POST /project request data.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  project: PostProjectData;
  objectives: PostObjectivesData;
  iucn: PostIUCNData;
  participants: PostParticipantData[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.objectives = (obj?.project && new PostObjectivesData(obj.objectives)) || null;
    this.iucn = (obj?.iucn && new PostIUCNData(obj.iucn)) || null;
    this.participants = obj?.participants || [];
  }
}

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostProjectData
 */
export class PostProjectData {
  name: string;
  project_programs: number[];
  start_date: string;
  end_date: string;
  comments: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.project_programs = obj?.project_programs || [];
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.comments = obj?.comments || null;
  }
}

/**
 * Processes POST /project objectives data
 *
 * @export
 * @class PostObjectivesData
 */
export class PostObjectivesData {
  objectives: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
  }
}

export interface IPostIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

/**
 * Processes POST /project IUCN data
 *
 * @export
 * @class PostIUCNData
 */
export class PostIUCNData {
  classificationDetails: IPostIUCN[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostIUCNData', message: 'params', obj });

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

export class PostParticipantsData {
  systemUserId: number;
  userIdentifier: string;
  identitySource: SYSTEM_IDENTITY_SOURCE;
  displayName: string;
  email: string;
  roleId: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostParticipantsData', message: 'params', obj });

    this.systemUserId = obj?.systemUserId || null;
    this.userIdentifier = obj?.userIdentifier || null;
    this.identitySource = obj?.identitySource || null;
    this.displayName = obj?.displayName || null;
    this.email = obj?.email || null;
    this.roleId = obj?.roleId || null;
  }
}

export interface PostParticipantData {
  project_participation_id?: number;
  system_user_id: number;
  project_role_names: PROJECT_ROLE[];
}
