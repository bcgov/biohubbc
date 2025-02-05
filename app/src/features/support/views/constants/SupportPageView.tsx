
export enum SupportPageView {
  GENERAL = 'GENERAL',
  STRUCTURE = 'STRUCTURE',
  FOUNDATION = 'FOUNDATION',
  DATA_STANDARDS = 'DATA_STANDARDS',
  ANIMALS = 'ANIMALS',
  TELEMETRY = 'TELEMETRY',
  OBSERVATIONS = 'OBSERVATIONS',
  CONTACT = 'CONTACT',
  PROJECTS = 'PROJECTS',
  SURVEYS = 'SURVEYS',
  SAMPLING = 'SAMPLING',
  DATA = 'DATA',
  PROJECT_TEAM = 'PROJECT_TEAM',
  FILES = 'FILES',
  METADATA = 'METADATA',
  HABITAT = 'HABITAT'
}

export interface ISupportPageView {
  label: string;
  value: SupportPageView;
  icon: string;
  children: ISupportPageView[];
}

export type SupportPageParams = {
  v: SupportPageView;
};

export enum MarkdownTypeSupportNameEnum {
  SPI = 'SPI',
  PROJECT_ROLES = 'PROJECT_ROLES',
  PROJECT_COMPONENTS = 'PROJECT COMPONENTS',
  SURVEY_METADATA = 'SURVEY METADATA',
  SURVEY_ATTACHMENTS = 'SURVEY ATTACHMENTS',
  BLOCKS = 'BLOCKS',
  STRATA = 'STRATA',
  TECHNIQUES = 'TECHNIQUES',
  SAMPLING_SITES = 'SAMPLING_SITES',
  ITIS = 'ITIS',
  ANIMAL_ENTITY = 'ANIMAL_ENTITY',
  ANIMAL_EVENT = 'ANIMAL_EVENT',
  ANIMAL_BULK = 'ANIMAL_BULK',
  TELEMETRY_MANUAL = 'TELEMETRY_MANUAL',
  TELEMETRY_AUTO = 'TELEMETRY_AUTO',
  OBSERVATIONS = 'OBSERVATIONS'
}

export interface IDataItem {
  label: string | React.ReactNode;
  description: React.ReactNode[];
  markdownType?: MarkdownTypeSupportNameEnum;
}
