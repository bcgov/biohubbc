import { cleanup, render } from 'test-helpers/test-utils';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import IUCNClassification from './IUCNClassification';
import { getSurveyForListResponse } from 'test-helpers/survey-helpers';

describe('IUCNClassification', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no classification details', () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          ...getProjectForViewResponse,
          projectData: {
            ...getProjectForViewResponse.projectData,
            iucn: {
              classificationDetails: []
            }
          }
        }
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <IUCNClassification />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with classification details', () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <IUCNClassification />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
