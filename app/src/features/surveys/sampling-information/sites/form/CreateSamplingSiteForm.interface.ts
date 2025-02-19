import { IPostSiteBlockAssignment, IPostSurveyBlock } from '../create/CreateSamplingSitePage.interface';

export interface BlockForm {
  blocks: IPostSurveyBlock[];
  site_block_assignments: IPostSiteBlockAssignment[];
}
