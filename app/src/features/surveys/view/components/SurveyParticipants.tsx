import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
    <>
      {participants.length > 0 ? (
        <Box component="dl">
          {participants.map((surveyParticipants) => (
            <Box className="row" key={surveyParticipants.system_user_id}>
              <Typography component="dt">{surveyParticipants.display_name}</Typography>
              <Typography component="dd">{surveyParticipants.survey_job_name}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Box className="row">No participants</Box>
      )}
    </>
  );
};

export default SurveyParticipants;
