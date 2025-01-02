import { SupportPageView } from '../constants/SupportPageView';
import animals from './animals';
import contact from './contact';
import dataStandards from './dataStandards';
import foundation from './foundation';
import general from './general';
import observations from './observations';
import structure from './structure';
import telemetry from './telemetry';
import { DataMap } from './types';

export const dataMap: DataMap = {
  [SupportPageView.GENERAL]: general,
  [SupportPageView.STRUCTURE]: structure,
  [SupportPageView.FOUNDATION]: foundation,
  [SupportPageView.DATA_STANDARDS]: dataStandards,
  [SupportPageView.ANIMALS]: animals,
  [SupportPageView.TELEMETRY]: telemetry,
  [SupportPageView.OBSERVATIONS]: observations,
  [SupportPageView.CONTACT]: contact
};
