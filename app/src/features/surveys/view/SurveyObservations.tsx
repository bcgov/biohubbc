import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';

interface IDWCValidateResponse {
  fileName: string;
  fileErrors: string[];
  headerErrors: string[];
  rowErrors: string[];
  isValid: boolean;
}

export interface ISurveyObservationProps {
  projectForViewData: IGetProjectForViewResponse;
  surveyForViewData: IGetSurveyForViewResponse;
}

/**
 * Survey observations content.
 *
 * @return {*}
 */
const SurveyObservations: React.FC<ISurveyObservationProps> = (props) => {
  const biohubApi = useBiohubApi();

  const [validationResponses, setValidationResponses] = useState<IDWCValidateResponse[]>();

  const getFileValidationErrors = (responses: IDWCValidateResponse[]) => {
    return responses.map((fileResponse) => {
      const fileErrors = beautifyDWCFileValidationErrors(fileResponse);

      const errorsList = fileErrors.map((message: string, index: number) => {
        return <Typography key={`${fileResponse.fileName}-${index}`}>{message}</Typography>;
      });

      return (
        <Box mb={1} key={fileResponse.fileName}>
          <Typography>{fileResponse.fileName}</Typography>
          {(errorsList?.length && errorsList) || 'File is valid.'}
        </Box>
      );
    });
  };

  const uploadOccurrenceFiles = (): IUploadHandler => {
    return (files, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadOccurrenceFiles(
        props.projectForViewData.id,
        props.surveyForViewData.survey_details.id,
        files,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  return (
    <>
      <Box mb={4}>
        <Typography variant="h2">Upload Occurrences</Typography>
      </Box>
      <Box mb={4}>
        <FileUpload onSuccess={setValidationResponses} uploadHandler={uploadOccurrenceFiles()} />
      </Box>
      {validationResponses && validationResponses?.length > 0 && (
        <>
          <Box mb={2}>
            <Typography variant="h3">Validation Status</Typography>
          </Box>
          {getFileValidationErrors(validationResponses)}
        </>
      )}
    </>
  );
};

export default SurveyObservations;

export const beautifyDWCFileValidationErrors = (response: IDWCValidateResponse): any[] => {
  const fileErrors = response.fileErrors;

  const headerErrors = response.headerErrors.map((headerError: any) => {
    return `Column ${headerError.col}: ${headerError.message}`;
  });

  const rowErrors = response.rowErrors.map((rowError: any) => {
    return `Row ${rowError.row}: ${rowError.message}`;
  });

  return [...fileErrors, ...headerErrors, ...rowErrors];
};
