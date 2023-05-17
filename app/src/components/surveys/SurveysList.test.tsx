import { cleanup, render } from 'test-helpers/test-utils';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { createMemoryHistory } from 'history';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse, SurveySupplementaryData } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { surveyObject } from 'test-helpers/survey-helpers';
import SurveysList from './SurveysList';

const history = createMemoryHistory();

describe('SurveysList', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with surveys', () => {
    const surveysList: IGetSurveyForViewResponse[] = [
      {
        surveyData: {
          ...surveyObject,
          survey_details: {
            ...surveyObject.survey_details,
            survey_name: 'Moose Survey 1',
            start_date: '2021-04-09 11:53:53',
            end_date: '2021-05-09 11:53:53'
          },
          species: {
            focal_species: [1],
            focal_species_names: ['species 1'],
            ancillary_species: [2],
            ancillary_species_names: ['species 2']
          }
        },
        surveySupplementaryData: ({
          survey_metadata_publish: null
        } as unknown) as SurveySupplementaryData
      },
      {
        surveyData: {
          ...surveyObject,
          survey_details: {
            ...surveyObject.survey_details,
            survey_name: 'Moose Survey 2',
            start_date: '2021-04-09 11:53:53',
            end_date: '2021-06-10 11:53:53'
          },
          species: {
            focal_species: [3],
            focal_species_names: ['species 3'],
            ancillary_species: [4],
            ancillary_species_names: ['species 4']
          }
        },
        surveySupplementaryData: ({
          survey_metadata_publish: null
        } as unknown) as SurveySupplementaryData
      }
    ];

    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: surveysList } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { getByText, queryByText } = render(
      <Router history={history}>
        <CodesContext.Provider value={mockCodesContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveysList />
          </ProjectContext.Provider>
        </CodesContext.Provider>
      </Router>
    );

    expect(queryByText('No Surveys')).toBeNull();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
    expect(getByText('Moose Survey 2')).toBeInTheDocument();
  });

  it('renders correctly with no surveys', () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: [] } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { getByText } = render(
      <Router history={history}>
        <CodesContext.Provider value={mockCodesContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveysList />
          </ProjectContext.Provider>
        </CodesContext.Provider>
      </Router>
    );

    expect(getByText('No Surveys')).toBeInTheDocument();
  });
});
