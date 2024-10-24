import { z } from 'zod';
import { ProjectUser } from '../repositories/project-participation-repository';
import { SystemUser } from '../repositories/user-repository';

export interface IProjectAdvancedFilters {
  keyword?: string;
  itis_tsn?: number;
  itis_tsns?: number[];
  system_user_id?: number;
  project_name?: string;
}

export interface IGetProject {
  project: ProjectData;
  objectives: GetObjectivesData;
  participants: (ProjectUser & SystemUser)[];
  iucn: GetIUCNClassificationData;
}

export const ProjectData = z.object({
  project_id: z.number(),
  uuid: z.string().uuid(),
  project_name: z.string(),
  comments: z.string().nullable(),
  revision_count: z.number()
});

export type ProjectData = z.infer<typeof ProjectData>;

export const FindProjectsResponse = z.object({
  project_id: z.number(),
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
