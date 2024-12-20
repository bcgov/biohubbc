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

// export const SUPPORT_VIEW_KEY = 'support_view';

export type SupportPageParams = {
  support_view?: SupportPageView;
};

export enum MarkdownTypeSupportNameEnum {
  GENERAL = 'GENERAL',
  STRUCTURE = 'STRUCTURE',
  FOUNDATION = 'FOUNDATION',
  DATA_STANDARDS = 'DATA_STANDARDS',
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
