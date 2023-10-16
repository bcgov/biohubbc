import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Proprietary data content for a survey.
 *
 * @return {*}
 */
const SurveyProprietaryData = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData) {
    return <></>;
  }

  const {
    surveyData: { proprietor }
  } = surveyForViewData;

  return (
    <>
      {!proprietor && (
        <Box className="row">
          <Typography color="textSecondary" data-testid="survey_not_proprietary">
            The data captured in this survey is not proprietary.
          </Typography>
        </Box>
      )}
      {proprietor && (
        <Box component="dl">
          <Box className="row">
            <Typography component="dt">Proprietor Name</Typography>
            <Typography component="dd" data-testid="survey_proprietor_name">
              {proprietor.proprietor_name}
            </Typography>
          </Box>
          <Box className="row">
            <Typography component="dt">Data Category</Typography>
            <Typography component="dd" data-testid="survey_proprietor_type_name">
              {proprietor.proprietor_type_name}
            </Typography>
          </Box>
          <Box className="row">
            <Typography component="dt">Category Rationale</Typography>
            <Typography data-testid="survey_category_rationale">{proprietor.category_rationale}</Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SurveyProprietaryData;
