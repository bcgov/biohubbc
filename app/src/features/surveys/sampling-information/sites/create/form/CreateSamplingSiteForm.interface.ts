import { IPostSurveyStratum } from 'interfaces/useSurveyApi.interface';
import { IPostSiteBlockAssignment, IPostSiteStratumAssignment, IPostSurveyBlock } from '../CreateSamplingSitePage.interface';

export interface BlockForm {
  blocks: IPostSurveyBlock[];
  site_block_assignments: IPostSiteBlockAssignment[];
}

export interface StratumForm {
  stratums: IPostSurveyStratum[];
  site_stratum_assignments: IPostSiteStratumAssignment[];
}