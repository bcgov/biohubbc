import { IPostSiteBlockAssignment, IPostSurveyBlock } from '../CreateSamplingSitePage.interface';

export interface BlockForm {
  blocks: IPostSurveyBlock[];
  site_block_assignments: IPostSiteBlockAssignment[];
}
