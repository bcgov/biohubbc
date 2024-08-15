import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Purpose and Methodology data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  // Codes data must be loaded by the parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Survey data must be loaded by the parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const surveyData = surveyContext.surveyDataLoader.data.surveyData;

  return (
    <Box component="dl">
      <Box className="row">
        <Typography component="dt">Ecological Variables</Typography>
        <Typography component="dd">
          {surveyData.purpose_and_methodology.intended_outcome_ids?.map((intended_outcome_id: number) => {
            return (
              <Typography
                component="span"
                key={intended_outcome_id}
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  mr: 1.25,
                  '&::after': {
                    content: "','",
                    position: 'absolute',
                    top: 0
                  },
                  '&:last-child::after': {
                    display: 'none'
                  }
                }}
                data-testid="intended_outcome_codes">
                {codes?.intended_outcomes?.find((item: any) => item.id === intended_outcome_id)?.name}
              </Typography>
            );
          })}
        </Typography>
      </Box>
      {surveyData.purpose_and_methodology.additional_details && (
        <>
          <Box className="row">
            <Typography component="dt">Additional Details</Typography>
            <Typography component="dd" variant="body1" data-testid="survey_additional_details">
              {surveyData.purpose_and_methodology.additional_details}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SurveyPurposeAndMethodologyData;
