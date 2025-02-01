export interface IGetMarkdownResponse {
  markdown: {
    markdown_id: number;
    markdown_type_id: number;
    data: string;
    participated: boolean;
  };
}
export interface IMarkdownFilterObject {
  typeName: string;
}

export interface MarkdownScoreObject {
  markdownId: number;
  score: number;
}

export enum MarkdownTypeNameEnum {
  PROJECTS_AND_SURVEYS = 'Projects and Surveys',
  SUMMARY_DATA = 'Summary Data',
  SAMPLING_INFORMATION = 'Sampling Information',
  SURVEY_DATA = 'Survey Data',
  PROJECT_DETAILS = 'Project Details',
  SURVEYS = 'Surveys',
  SURVEY_PAGE = 'Survey Page',
  TECHNIQUES = 'Techniques',
  SAMPLING_SITES = 'Sampling Sites',
  SAMPLING_PERIODS = 'Sampling Periods',
  SURVEY_METADATA = 'Survey Metadata',
  OBSERVATIONS = 'Observations'
}

export enum MarkdownTypeSupportNameEnum {
  SPI = 'SPI Data',
  PROJECT_ROLES = 'Role Based Security',
  PROJECT_COMPONENTS = 'Project Components',
  SURVEY_METADATA = 'Survey Metadata Support',
  SURVEY_ATTACHMENTS = 'Survey Attachments',
  BLOCKS = 'Support Blocks',
  STRATA = 'Support Strata',
  TECHNIQUES = 'Support Techniques',
  SAMPLING_SITES = 'Support Sites',
  ITIS = 'ITIS Standards',
  ANIMAL_ENTITY = 'Animal Entity',
  ANIMAL_EVENT = 'Animal Event',
  ANIMAL_BULK = 'Animal Bulk Upload',
  TELEMETRY_MANUAL = 'Telemetry Manual Upload',
  TELEMETRY_AUTO = 'Telemetry Automated',
  OBSERVATIONS = 'Observation Data Load'
}
