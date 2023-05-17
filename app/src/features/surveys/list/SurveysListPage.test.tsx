import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForListResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { surveyObject } from 'test-helpers/survey-helpers';
import SurveysListPage from './SurveysListPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  survey: {
    getSurveysList: jest.fn()
  }
};

describe('SurveysListPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.survey.getSurveysList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with an empty list of surveys', async () => {
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

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    mockUseApi.survey.getSurveysList.mockResolvedValue([]);

    const { getByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <CodesContext.Provider value={mockCodesContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveysListPage />
            </ProjectContext.Provider>
          </CodesContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('No Surveys')).toBeInTheDocument();
    });
  });

  it('renders correctly with a populated list of surveys', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const surveysList: IGetSurveyForListResponse[] = [
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
        surveySupplementaryData: {
          has_unpublished_content: false
        }
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
        surveySupplementaryData: {
          has_unpublished_content: false
        }
      }
    ];

    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: surveysList } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { getByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <CodesContext.Provider value={mockCodesContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveysListPage />
            </ProjectContext.Provider>
          </CodesContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('Moose Survey 1')).toBeInTheDocument();
      expect(getByText('Moose Survey 2')).toBeInTheDocument();
    });
  });
});
