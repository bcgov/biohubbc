import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FileUpload from 'components/attachments/FileUpload';
import React from 'react';
import { useParams } from 'react-router';

/**
 * Survey observations content.
 *
 * @return {*}
 */
const SurveyObservations = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];

  return (
    <>
      <Box mb={4}>
        <Typography variant="h2">Upload</Typography>
      </Box>
      <Paper>
        <FileUpload projectId={projectId} surveyId={surveyId} />
      </Paper>
    </>
  );
};

export default SurveyObservations;
