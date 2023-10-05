import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyParticipants = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData) {
    return <></>;
  }

  const {
    surveyData: { participants }
  } = surveyForViewData;

  return (
    <List disablePadding
      sx={{
        '& li:first-of-type': {
          paddingTop: 0
        },
        '& .MuiListItemText-root': {
          margin: 0
        }
      }}
    >
      {participants.length > 0 ? (
        <>
          {participants.map((surveyParticipants) => (
            <ListItem disableGutters key={surveyParticipants.system_user_id}>
              <ListItemText
                primary={surveyParticipants.display_name}
                secondary={surveyParticipants.survey_job_name}
              >
              </ListItemText>
            </ListItem>
          ))}
        </>
      ) : (
        <ListItem disableGutters>
          <ListItemText primary="No particpants"></ListItemText>
        </ListItem>
      )}

    </List>
  );
};

export default SurveyParticipants;
