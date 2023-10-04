import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
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
    <List disablePadding
      sx={{
        '& li:first-child': {
          paddingTop: 0
        },
        '& .MuiListItemText-root': {
          margin: 0
        }
      }}
    >
      {funding_sources.length > 0 ? (
        <>
          {funding_sources.map((surveyFundingSource) => (
            <ListItem disableGutters divider key={surveyFundingSource.funding_source_id}>
              <ListItemText
                primary={surveyFundingSource.funding_source_name}
                secondary={getFormattedAmount(surveyFundingSource.amount)}
              >
              </ListItemText>
            </ListItem>
          ))}
        </>
      ) : (
        <ListItem disableGutters>
          <Typography>No Funding Sources</Typography>
        </ListItem>
      )}
    </List>
  );
};

export default SurveyFundingSources;
