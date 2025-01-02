import { MarkdownTypeSupportNameEnum } from 'interfaces/useMarkdownApi.interface';
import { ReactNode } from 'react';
import { SupportPageView } from '../constants/SupportPageView';

interface IDataItem {
  label: string | ReactNode;
  description: ReactNode[];
  markdownType?: MarkdownTypeSupportNameEnum;
}

export type DataMap = Partial<Record<SupportPageView, IDataItem[]>>;

export const EnumMarkdownTypes: Partial<Record<SupportPageView, MarkdownTypeSupportNameEnum[]>> = {
  [SupportPageView.GENERAL]: [MarkdownTypeSupportNameEnum.SPI],
  [SupportPageView.STRUCTURE]: [MarkdownTypeSupportNameEnum.STRUCTURE],
  [SupportPageView.FOUNDATION]: [MarkdownTypeSupportNameEnum.FOUNDATION],
  [SupportPageView.DATA_STANDARDS]: [MarkdownTypeSupportNameEnum.ITIS],
  [SupportPageView.ANIMALS]: [
    MarkdownTypeSupportNameEnum.ANIMAL_ENTITY,
    MarkdownTypeSupportNameEnum.ANIMAL_EVENT,
    MarkdownTypeSupportNameEnum.ANIMAL_BULK
  ],
  [SupportPageView.TELEMETRY]: [
    MarkdownTypeSupportNameEnum.TELEMETRY_MANUAL,
    MarkdownTypeSupportNameEnum.TELEMETRY_AUTO
  ],
  [SupportPageView.OBSERVATIONS]: [MarkdownTypeSupportNameEnum.OBSERVATIONS]
};
export { MarkdownTypeSupportNameEnum, SupportPageView };
