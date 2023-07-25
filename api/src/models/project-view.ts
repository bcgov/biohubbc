import { Feature } from 'geojson';
import { z } from 'zod';
import { ProjectMetadataPublish } from '../repositories/history-publish-repository';

export interface IGetProject {
  coordinator: GetCoordinatorData;
  project: ProjectData;
  objectives: GetObjectivesData;
  location: GetLocationData;
  iucn: GetIUCNClassificationData;
  funding: GetFundingData;
  partnerships: GetPartnershipsData;
}

export const ProjectData = z.object({
  project_id: z.number(),
  uuid: z.string(),
  project_name: z.string(),
  project_programs: z.array(z.number()),
  project_activities: z.array(z.number()),
  start_date: z.date(),
  end_date: z.date().nullable(),
  comments: z.string().nullable(),
  revision_count: z.number()
});

export type ProjectData = z.infer<typeof ProjectData>;

/**
 * Pre-processes GET /projects/{id} objectives data
 *
 * @export
 * @class GetObjectivesData
 */
export class GetObjectivesData {
  objectives: string;
  caveats: string;
  revision_count: number;

  constructor(objectivesData?: any) {
    this.objectives = objectivesData?.objectives || '';
    this.caveats = objectivesData?.caveats || '';
    this.revision_count = objectivesData?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /projects/{id} coordinator data
 *
 * @export
 * @class GetCoordinatorData
 */
export class GetCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  revision_count: number;

  constructor(coordinatorData?: any) {
    this.first_name = coordinatorData?.coordinator_first_name || '';
    this.last_name = coordinatorData?.coordinator_last_name || '';
    this.email_address = coordinatorData?.coordinator_email_address || '';
    this.coordinator_agency = coordinatorData?.coordinator_agency_name || '';
    this.share_contact_details = coordinatorData?.coordinator_public ? 'true' : 'false';
    this.revision_count = coordinatorData?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /projects/{id} location data
 *
 * @export
 * @class GetLocationData
 */
export class GetLocationData {
  location_description: string;
  geometry?: Feature[];
  revision_count: number;

  constructor(locationData?: any) {
    const locationDataItem = locationData?.length && locationData[0];

    this.location_description = locationDataItem?.location_description || '';
    this.geometry = (locationDataItem?.geometry?.length && locationDataItem.geometry) || [];
    this.revision_count = locationDataItem?.revision_count ?? null;
  }
}

interface IGetIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

/**
 * Pre-processes GET /projects/{id} IUCN classification data
 *
 * @export
 * @class GetIUCNClassificationData
 */
export class GetIUCNClassificationData {
  classificationDetails: IGetIUCN[];

  constructor(iucnClassificationData?: any[]) {
    this.classificationDetails =
      iucnClassificationData?.map((item: any) => {
        return {
          classification: item.classification,
          subClassification1: item.subclassification1,
          subClassification2: item.subclassification2
        };
      }) ?? [];
  }
}

interface IGetFundingSource {
  id: number;
  agency_id?: number;
  investment_action_category?: number;
  investment_action_category_name?: string;
  agency_name: string;
  funding_amount?: number;
  start_date: string;
  end_date: string;
  agency_project_id: string;
  first_nations_id?: number;
  first_nations_name?: string;
  revision_count: number;
}

export class GetFundingData {
  fundingSources: IGetFundingSource[];

  constructor(fundingData?: any[]) {
    this.fundingSources =
      fundingData?.map((item: any) => {
        return {
          id: item.id,
          agency_id: item.agency_id,
          investment_action_category: item.investment_action_category,
          investment_action_category_name: item.investment_action_category_name,
          agency_name: item.agency_name,
          funding_amount: item.funding_amount,
          start_date: item.start_date,
          end_date: item.end_date,
          agency_project_id: item.agency_project_id,
          revision_count: item.revision_count,
          first_nations_id: item.first_nations_id,
          first_nations_name: item.first_nations_name
        };
      }) ?? [];
  }
}

/**
 * Pre-processes GET /projects/{id} partnerships data
 *
 * @export
 * @class GetPartnershipsData
 */
export class GetPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(indigenous_partnerships?: any[], stakeholder_partnerships?: any[]) {
    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.id)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.partnership_name)) || [];
  }
}

export type ProjectSupplementaryData = {
  project_metadata_publish: ProjectMetadataPublish | null;
};

interface IGetAttachmentsSource {
  file_name: string;
  file_type: string;
  title: string;
  description: string;
  key: string;
  file_size: string;
}

/**
 * Pre-processes GET /projects/{id} attachments data
 *
 * @export
 * @class GetAttachmentsData
 */
export class GetAttachmentsData {
  attachmentDetails: IGetAttachmentsSource[];

  constructor(attachments?: any[]) {
    this.attachmentDetails =
      (attachments?.length &&
        attachments.map((item: any) => {
          return {
            file_name: item.file_name,
            file_type: item.file_type,
            title: item.title,
            description: item.description,
            key: item.key,
            file_size: item.file_size
          };
        })) ||
      [];
  }
}

interface IGetReportAttachmentsSource {
  file_name: string;
  title: string;
  year: string;
  description: string;
  key: string;
  file_size: string;
  authors?: { author: string }[];
}

/**
 * Pre-processes GET /projects/{id} report attachments data
 *
 * @export
 * @class GetReportAttachmentsData
 */
export class GetReportAttachmentsData {
  attachmentDetails: IGetReportAttachmentsSource[];

  constructor(attachments?: any[]) {
    this.attachmentDetails =
      (attachments?.length &&
        attachments.map((item: any) => {
          const attachmentItem = {
            file_name: item.file_name,
            title: item.title,
            year: item.year,
            description: item.description,
            key: item.key,
            file_size: item.file_size
          };

          if (item.authors?.length) {
            attachmentItem['authors'] = item.authors;
          }

          return attachmentItem;
        })) ||
      [];
  }
}
