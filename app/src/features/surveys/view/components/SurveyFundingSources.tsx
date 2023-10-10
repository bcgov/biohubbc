import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { getFormattedAmount } from 'utils/Utils';

/**
 * Funding source content for a survey.
 *
 * @return {*}
 */
const SurveyFundingSources = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData) {
    return <></>;
  }

  const {
    surveyData: { funding_sources }
  } = surveyForViewData;

  return (
    <Box component="dl">
      {funding_sources.length > 0 ? (
        <>
          {funding_sources.map((surveyFundingSource) => (
            <Box className="row" key={surveyFundingSource.funding_source_id}>
              <Typography component="dt">
              {surveyFundingSource.funding_source_name}
              </Typography>
              <Typography component="dd"
                sx={{
                  display: 'inline-block',
                  width: 'auto'
                }}
              >
                {getFormattedAmount(surveyFundingSource.amount)}
              </Typography>
            </Box>
          ))}
        </>
      ) : (
        <Box>
          <Typography>No Funding Sources</Typography>
        </Box>
      )}

    </Box>
  );
};

export default SurveyFundingSources;
