import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FileUpload from 'components/attachments/FileUpload';
import React, { useState } from 'react';

/**
 * Survey observations content.
 *
 * @return {*}
 */
const SurveyObservations = () => {
  const [validationStatus, setValidationStatus] = useState<string[]>([]);

  return (
    <>
      <Box mb={4}>
        <Typography variant="h2">Validate File</Typography>
      </Box>
      <Box mb={2}>
        <FileUpload setValidationStatus={setValidationStatus} />
      </Box>
      {validationStatus.length > 0 && (
        <>
          <Box mb={2}>
            <Typography variant="h3">Validation Status</Typography>
          </Box>
          {validationStatus.map((message: string, index: number) => (
            <Typography key={index}>{message}</Typography>
          ))}
        </>
      )}
    </>
  );
};

export default SurveyObservations;
