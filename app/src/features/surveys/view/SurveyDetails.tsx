import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SurveyGeneralInformation from 'features/surveys/view/components/SurveyGeneralInformation';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import SurveyPurposeAndMethodology from './components/SurveyPurposeAndMethodology';

export interface ISurveyDetailsProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails: React.FC<ISurveyDetailsProps> = (props) => {
  const { surveyForViewData, codes, refresh, projectForViewData } = props;

  return (
    <>
      <Box component={Paper} p={3}>
        <Typography variant="h2">Survey Details</Typography>
        <Box component="section" mt={1}>
          <SurveyGeneralInformation
            projectForViewData={projectForViewData}
            surveyForViewData={surveyForViewData}
            codes={codes}
            refresh={refresh}
          />
        </Box>

        <Box component="section" mt={1}>
          <SurveyPurposeAndMethodology
            projectForViewData={projectForViewData}
            surveyForViewData={surveyForViewData}
            codes={codes}
            refresh={refresh}
          />
        </Box>
        <Box component="section" mt={1}>
          <SurveyProprietaryData
            projectForViewData={projectForViewData}
            surveyForViewData={surveyForViewData}
            codes={codes}
            refresh={refresh}
          />
        </Box>
      </Box>
    </>
  );
};

export default SurveyDetails;
