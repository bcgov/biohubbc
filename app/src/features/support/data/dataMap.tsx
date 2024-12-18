
import { SupportPageView } from '../constants/SupportPageView';
import general from './general';
import { DataMap } from './types';
import structure from './structure';
import foundation from './foundation';
import dataStandards from './dataStandards';
import animals from './animals';
import telemetry from './telemetry';
import observations from './observations';
import contact from './contact';

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
