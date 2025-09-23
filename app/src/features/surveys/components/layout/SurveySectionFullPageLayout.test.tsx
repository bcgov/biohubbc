import { AuthStateContext } from 'contexts/authStateContext';

import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { createMemoryHistory } from 'history';
import { DataLoader } from 'hooks/useDataLoader';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { render } from 'test-helpers/test-utils';
import { SurveySectionFullPageLayout } from './SurveySectionFullPageLayout';

const sidebar = <div>SIDEBAR</div>;
const main = <div>MAIN_CONTENT</div>;

const mockSurveyContext: ISurveyContext = {
  surveyDataLoader: {
    data: { surveyData: { survey_details: { survey_name: 'survey-name-1' } } },
    load: vi.fn()
  } as unknown as DataLoader<any, any, any>
} as unknown as ISurveyContext;

const authState = getMockAuthState({ base: SystemAdminAuthState });
const history = createMemoryHistory();

const _render = (_mockSurveyContext: any) =>
  render(
    <AuthStateContext.Provider value={authState}>
      <Router history={history}>
        <SurveyContext.Provider value={_mockSurveyContext}>
          <SurveySectionFullPageLayout sideBarComponent={sidebar} mainComponent={main} pageTitle={'fullpage-title'} />
        </SurveyContext.Provider>
      </Router>
    </AuthStateContext.Provider>
  );

it('should render the page naviagtion header', async () => {
  const { queryAllByText, queryByText } = _render(mockSurveyContext);
  expect(queryAllByText('fullpage-title')).not.toBeNull();
  expect(queryByText('survey-name-1')).toBeInTheDocument();
});

it('should render sidebar and main content', () => {
  const { getByText } = _render(mockSurveyContext);
  expect(getByText('SIDEBAR')).toBeInTheDocument();
  expect(getByText('MAIN_CONTENT')).toBeInTheDocument();
});

it('should render loading spinner when no survey data', () => {
  const { getByTestId, queryByText } = _render({
    surveyDataLoader: {
      data: undefined,
      load: vi.fn()
    } as unknown as DataLoader<any, any, any>
  });
  expect(getByTestId('fullpage-spinner')).toBeInTheDocument();
  expect(queryByText('SIDEBAR')).not.toBeInTheDocument();
  expect(queryByText('MAIN_CONTENT')).not.toBeInTheDocument();
});
