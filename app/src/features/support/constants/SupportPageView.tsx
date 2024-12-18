export enum SupportPageView {
  GENERAL = 'GENERAL',
  STRUCTURE = 'STRUCTURE',
  FOUNDATION = 'FOUNDATION',
  DATA_STANDARDS = 'DATA_STANDARDS',
  ANIMALS = 'ANIMALS',
  TELEMETRY = 'TELEMETRY',
  OBSERVATIONS = 'OBSERVATIONS',
  CONTACT = 'CONTACT'
}

export interface ISupportPageView {
  label: string;
  value: SupportPageView;
  icon: string;
}

export enum MarkdownTypeSupportNameEnum {
  GENERAL = 'GENERAL',
  STRUCTURE = 'STRUCTURE',
  FOUNDATION = 'FOUNDATION',
  DATA_STANDARDS = 'DATA_STANDARDS',
  ANIMAL_ENTITY = 'ANIMAL_ENTITY',
  ANIMAL_EVENT = 'ANIMAL_EVENT',
  ANIMAL_BULK = 'ANIMAL_BULK',
  TELEMETRY = 'TELEMETRY',
  OBSERVATIONS = 'OBSERVATIONS'
}

export interface IDataItem {
  label: string | React.ReactNode;
  description: React.ReactNode[];
  markdownType?: MarkdownTypeSupportNameEnum;
}
