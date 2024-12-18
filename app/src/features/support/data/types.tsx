import { SupportPageView } from '../constants/SupportPageView';
import { MarkdownTypeSupportNameEnum } from 'interfaces/useMarkdownApi.interface';
import { ReactNode } from 'react';

interface IDataItem {
  label: string | ReactNode;
  description: ReactNode[];
  markdownType?: MarkdownTypeSupportNameEnum;
}

export type DataMap = Partial<Record<SupportPageView, IDataItem[]>>;

export const EnumMarkdownTypes: Partial<Record<SupportPageView, MarkdownTypeSupportNameEnum[]>> = {
  [SupportPageView.GENERAL]: [MarkdownTypeSupportNameEnum.GENERAL],
  [SupportPageView.STRUCTURE]: [MarkdownTypeSupportNameEnum.STRUCTURE],
  [SupportPageView.FOUNDATION]: [MarkdownTypeSupportNameEnum.FOUNDATION],
  [SupportPageView.DATA_STANDARDS]: [MarkdownTypeSupportNameEnum.DATA_STANDARDS],
  [SupportPageView.ANIMALS]: [
    MarkdownTypeSupportNameEnum.ANIMAL_ENTITY,
    MarkdownTypeSupportNameEnum.ANIMAL_EVENT,
    MarkdownTypeSupportNameEnum.ANIMAL_BULK
  ],
  [SupportPageView.TELEMETRY]: [MarkdownTypeSupportNameEnum.TELEMETRY],
  [SupportPageView.OBSERVATIONS]: [MarkdownTypeSupportNameEnum.OBSERVATIONS]
};
