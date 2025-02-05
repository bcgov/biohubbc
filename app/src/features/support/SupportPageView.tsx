import {
  mdiAccountSupervisor,
  mdiAutoFix,
  mdiCheckDecagram,
  mdiDatabaseCog,
  mdiEye,
  mdiFileOutline,
  mdiFolder,
  mdiHome,
  mdiInformationOutline,
  mdiListBoxOutline,
  mdiPaw,
  mdiPineTree,
  mdiWifiMarker
} from '@mdi/js';
import { ReactNode } from 'react';
import { SupportOverview } from './views/content/overview/SupportOverview';
import { SupportProjects } from './views/content/projects/SupportProjects';
import { SupportAnimals } from './views/content/projects/surveys/data/animals/SupportAnimals';
import { SupportHabitat } from './views/content/projects/surveys/data/habitat/SupportHabitat';
import { SupportObservations } from './views/content/projects/surveys/data/observations/SupportObservations';
import { SupportData } from './views/content/projects/surveys/data/SupportData';
import { SupportTelemetry } from './views/content/projects/surveys/data/telemetry/SupportTelemetry';
import { SupportFiles } from './views/content/projects/surveys/files/SupportFiles';
import { SupportMetadata } from './views/content/projects/surveys/metadata/SupportMetadata';
import { SupportSampling } from './views/content/projects/surveys/sampling/SupportSampling';
import { SupportSurveys } from './views/content/projects/surveys/SupportSurveys';
import { SupportTeam } from './views/content/projects/team/SupportTeam';
import { SupportStandards } from './views/content/standards/SupportStandards';

export enum SupportPageView {
  overview = 'overview',
  standards = 'standards',
  animals = 'animals',
  telemetry = 'telemetry',
  observations = 'observations',
  projects = 'projects',
  surveys = 'surveys',
  sampling = 'sampling',
  data = 'data',
  files = 'files',
  metadata = 'metadata',
  habitat = 'habitat',
  team = 'team'
}

export interface ISupportPageView {
  label: string;
  value: SupportPageView;
  icon: string;
  order: number;
  children: ISupportPageView[];
}

export type SupportPageParams = {
  v: SupportPageView;
};

export const SupportPageViews: ISupportPageView[] = [
  {
    label: 'Overview',
    value: SupportPageView.overview,
    icon: mdiHome,
    order: 1,
    children: []
  },
  {
    label: 'Projects',
    value: SupportPageView.projects,
    icon: mdiFolder,
    order: 2,
    children: [
      {
        label: 'Team',
        value: SupportPageView.team,
        icon: mdiAccountSupervisor,
        order: 3,
        children: []
      },
      {
        label: 'Surveys',
        value: SupportPageView.surveys,
        icon: mdiListBoxOutline,
        order: 4,
        children: [
          {
            label: 'Sampling',
            value: SupportPageView.sampling,
            icon: mdiAutoFix,
            order: 5,
            children: []
          },
          {
            label: 'Data',
            value: SupportPageView.data,
            icon: mdiDatabaseCog,
            order: 6,
            children: [
              {
                label: 'Observations',
                value: SupportPageView.observations,
                icon: mdiEye,
                order: 7,
                children: []
              },
              {
                label: 'Animals',
                value: SupportPageView.animals,
                icon: mdiPaw,
                order: 9,
                children: []
              },
              {
                label: 'Telemetry',
                value: SupportPageView.telemetry,
                icon: mdiWifiMarker,
                order: 8,
                children: []
              },
              {
                label: 'Habitat Features',
                value: SupportPageView.habitat,
                icon: mdiPineTree,
                order: 10,
                children: []
              }
            ]
          },
          {
            label: 'Files',
            value: SupportPageView.files,
            icon: mdiFileOutline,
            order: 10,
            children: []
          },
          {
            label: 'Metadata',
            value: SupportPageView.metadata,
            icon: mdiInformationOutline,
            order: 10,
            children: []
          }
        ]
      }
    ]
  },
  {
    label: 'Standards',
    value: SupportPageView.standards,
    icon: mdiCheckDecagram,
    order: 9,
    children: []
  }
];

export const SupportPageViewMap: Partial<Record<SupportPageView, ReactNode>> = {
  [SupportPageView.overview]: <SupportOverview />,
  [SupportPageView.projects]: <SupportProjects />,
  [SupportPageView.team]: <SupportTeam />,
  [SupportPageView.surveys]: <SupportSurveys />,
  [SupportPageView.sampling]: <SupportSampling />,
  [SupportPageView.observations]: <SupportObservations />,
  [SupportPageView.telemetry]: <SupportTelemetry />,
  [SupportPageView.data]: <SupportData />,
  [SupportPageView.files]: <SupportFiles />,
  [SupportPageView.metadata]: <SupportMetadata />,
  [SupportPageView.habitat]: <SupportHabitat />,
  [SupportPageView.animals]: <SupportAnimals />,
  [SupportPageView.standards]: <SupportStandards />
};
