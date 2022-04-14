import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('models/public/project');

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
            fileType: item.file_type || 'Report',
            lastModified: item.update_date || item.create_date,
            size: item.file_size,
            securityToken: item.is_secured
          };
        })) ||
      [];
  }
}
