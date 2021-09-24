import { COMPLETION_STATUS } from '../../constants/status';
import moment from 'moment';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('models/public/project');

/**
 * Pre-processes GET /projects/{id} public (published) project data
 *
 * @export
 * @class GetPublicProjectData
 */
export class GetPublicProjectData {
  project_name: string;
  project_type: string;
  project_activities: string[];
  start_date: string;
  end_date: string;
  comments: string;
  completion_status: string;
  publish_date: string;

  constructor(projectData?: any, activityData?: any[]) {
    defaultLog.debug({ label: 'GetPublicProjectData', message: 'params', projectData, activityData });

    this.project_name = projectData?.name || '';
    this.project_type = projectData?.type || '';
    this.project_activities = (activityData?.length && activityData.map((item) => item.name)) || [];
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
    this.comments = projectData?.comments || '';
    this.completion_status =
      (projectData &&
        projectData.end_date &&
        moment(projectData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
    this.publish_date = projectData?.publish_date || '';
  }
}

/**
 * Pre-processes GET /projects/{id} coordinator data for public (published) projects
 *
 * @export
 * @class GetPublicCoordinatorData
 */
export class GetPublicCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetPublicCoordinatorData', message: 'params', obj });

    const isCoordinatorDataPublic = obj?.coordinator_public;

    this.first_name = (isCoordinatorDataPublic && obj?.coordinator_first_name) || '';
    this.last_name = (isCoordinatorDataPublic && obj?.coordinator_last_name) || '';
    this.email_address = (isCoordinatorDataPublic && obj?.coordinator_email_address) || '';
    this.coordinator_agency = obj?.coordinator_agency_name || '';
    this.share_contact_details = obj?.coordinator_public ? 'true' : 'false';
  }
}

/**
 * Pre-processes GET public (published) project attachments data
 *
 * @export
 * @class GetPublicAttachmentsData
 */
export class GetPublicAttachmentsData {
  attachmentsList: any[];

  constructor(attachmentsData?: any) {
    defaultLog.debug({ label: 'GetPublicAttachmentsData', message: 'params', attachmentsData });

    this.attachmentsList =
      (attachmentsData?.length &&
        attachmentsData.map((item: any) => {
          return {
            id: item.id,
            fileName: item.file_name,
            lastModified: item.update_date || item.create_date,
            size: item.file_size,
            securityToken: item.is_secured
          };
        })) ||
      [];
  }
}
