import { z } from 'zod';
import { ProjectUser } from '../repositories/project-participation-repository';
import { SystemUserWithRoles } from './system-user-view';

export interface IProjectAdvancedFilters {
  /**
   * Filter results by keyword.
   *
   * @type {string}
   * @memberof IProjectAdvancedFilters
   */
  keyword?: string;
  /**
   * Filter results by ITIS TSN.
   *
   * @type {number}
   * @memberof IProjectAdvancedFilters
   */
  itis_tsn?: number;
  /**
   * Filter results by ITIS TSNs
   *
   * @type {number[]}
   * @memberof IProjectAdvancedFilters
   */
  itis_tsns?: number[];
  /**
   * Filter results by system user id.
   *
   * Note: This is not the id of the uexport interface IPeriodAdvancedFilters {
  survey_id?: number;
  sample_site_id?: number;
  method_technique_id?: number;
  system_user_id?: number;
}
ser making the request.
   *
   * @type {number}
   * @memberof IProjectAdvancedFilters
   */
  system_user_id?: number;
  /**
   * Filter results by project name.
   *
   * @type {string}
   * @memberof IProjectAdvancedFilters
   */
  project_name?: string;
}

export interface IGetProject {
  project: ProjectData;
  objectives: GetObjectivesData;
  participants: (ProjectUser & SystemUserWithRoles)[];
  iucn: GetIUCNClassificationData;
}

export const ProjectData = z.object({
  uuid: z.string().uuid(),
  project_name: z.string(),
  comments: z.string().nullable(),
  revision_count: z.number()
});

export type ProjectData = z.infer<typeof ProjectData>;

export const FindProjectsResponse = z.object({
  name: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  regions: z.array(z.string()),
  focal_species: z.array(z.number()),
  types: z.array(z.number()),
  members: z.array(z.object({ system_user_id: z.number(), display_name: z.string() }))
});

export type FindProjectsResponse = z.infer<typeof FindProjectsResponse>;

/**
 * Pre-processes GET /projects/{id} objectives data
 *
 * @export
 * @class GetObjectivesData
 */
export class GetObjectivesData {
  objectives: string;
  revision_count: number;

  constructor(objectivesData?: any) {
    this.objectives = objectivesData?.objectives || '';
    this.revision_count = objectivesData?.revision_count ?? null;
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
            file_size: item.file_size,
            authors: undefined
          };

          if (item.authors?.length) {
            attachmentItem['authors'] = item.authors;
          }

          return attachmentItem;
        })) ||
      [];
  }
}
