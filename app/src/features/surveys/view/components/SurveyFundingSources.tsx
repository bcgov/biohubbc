import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
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
    <>
      <List disablePadding>
        {funding_sources.length > 0 ? (
          <>
            {funding_sources.map((surveyFundingSource) => (
              <ListItem disableGutters divider key={surveyFundingSource.funding_source_id}>
                <Box flex="1 1 auto">
                  <Box>
                    <Typography>
                      {surveyFundingSource.funding_source_name}
                      <Typography component="span">
                        &nbsp;&ndash; {getFormattedAmount(surveyFundingSource.amount)}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </>
        ) : (
          <ListItem disableGutters>
            <Typography>No Funding Sources</Typography>
          </ListItem>
        )}
      </List>
    </>
  );
};

export default SurveyFundingSources;
