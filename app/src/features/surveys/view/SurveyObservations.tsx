import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState, useEffect } from 'react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useParams } from 'react-router';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/attachments/FileUpload';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';

const SurveyObservations = () => {
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const { projectForViewData, surveyForViewData } = props;

  const [surveyType, setSurveyType] = useState<string>('');
  const [observations, setObservations] = useState<IGetBlocksListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const getObservations = async () => {
      const observationsResponse = await biohubApi.observation.getObservationsList(
        projectForViewData.id,
        surveyForViewData.survey_details.id
      );

      if (!observationsResponse || !observationsResponse.blocks) {
        return;
      }

      if (observationsResponse.blocks) {
        setSurveyType('Block');
      }

      setIsLoading(false);
      setObservations(observationsResponse.blocks);
    };

    if (isLoading) {
      getObservations();
    }
  }, [biohubApi, isLoading, projectForViewData.id, surveyForViewData.survey_details.id]);

  const addNewObservation = () => {
    if (surveyType === 'Block') {
      history.push(
        `/projects/${projectForViewData.id}/surveys/${surveyForViewData.survey_details.id}/observations/create`
      );
    }
  };

  const addNewTemplateObservation = () => {
    history.push(
      `/projects/${projectForViewData.id}/surveys/${surveyForViewData.survey_details.id}/observations/template`
    );
  };

  const editObservation = async (observationId: number) => {
    if (surveyType === 'Block') {
      history.push(
        `/projects/${projectForViewData.id}/surveys/${surveyForViewData.survey_details.id}/observations/${observationId}/block`
      );
    }
  };

  return (
    <>
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2" data-testid="observations-heading">
          Observations
        </Typography>
        <Box>
          <Box display="flex" justifyContent="space-between">
            <Box mr={1}>
              <Button variant="contained" color="primary" onClick={addNewObservation}>
                {`New ${surveyType} Survey`}
              </Button>
            </Box>
            <Box mr={1}>
              <Button variant="contained" color="primary" onClick={addNewTemplateObservation}>
                New Template Survey
              </Button>
            </Box>
            <Button variant="contained" color="primary">
              Add Incidental
            </Button>
          </Box>
        </Box>
      </Box>
      <Box mt={2}>
        <ObservationSubmissionCSV submissionId={1} />
      </Box>
      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={() => setOpenImportObservations(false)}>
        <FileUpload uploadHandler={importObservations()} />
      </ComponentDialog>
    </>
  );
};

export default SurveyObservations;
