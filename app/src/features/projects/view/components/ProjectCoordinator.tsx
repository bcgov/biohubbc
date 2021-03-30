import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditCoordinatorI18N } from 'constants/i18n';
import {
  IProjectCoordinatorForm,
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseCoordinator,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IProjectCoordinatorProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project coordinator content for a project.
 *
 * @return {*}
 */
const ProjectCoordinator: React.FC<IProjectCoordinatorProps> = (props) => {
  const {
    projectForViewData: { coordinator, id },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditCoordinatorI18N.editErrorTitle,
    dialogText: EditCoordinatorI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [coordinatorDataForUpdate, setCoordinatorDataForUpdate] = useState<IGetProjectForUpdateResponseCoordinator>(
    null as any
  );
  const [coordinatorFormData, setCoordinatorFormData] = useState<IProjectCoordinatorForm>(
    ProjectCoordinatorInitialValues
  );

  const handleDialogEditOpen = async () => {
    let coordinatorResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.coordinator]);

      if (!response?.coordinator) {
        showErrorDialog({ open: true });
        return;
      }

      coordinatorResponseData = response.coordinator;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setCoordinatorDataForUpdate(coordinatorResponseData);

    setCoordinatorFormData({
      first_name: coordinatorResponseData.first_name,
      last_name: coordinatorResponseData.last_name,
      email_address: coordinatorResponseData.email_address,
      coordinator_agency: coordinatorResponseData.coordinator_agency,
      share_contact_details: coordinatorResponseData.share_contact_details
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectCoordinatorForm) => {
    const projectData = {
      coordinator: { ...values, revision_count: coordinatorDataForUpdate.revision_count }
    };

    try {
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditCoordinatorI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectCoordinator" codes={codes} />,
          initialValues: coordinatorFormData,
          validationSchema: ProjectCoordinatorYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Project Coordinator</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => handleDialogEditOpen()}
              title="Edit Project Coordinator Information"
              aria-label="Edit Project Coordinator Information">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Name</Typography>
            </Box>
            <Box>
              <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                {coordinator.first_name} {coordinator.last_name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Email Address</Typography>
            </Box>
            <Box>
              <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                {coordinator.email_address}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Agency</Typography>
            </Box>
            <Box>
              <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                {coordinator.coordinator_agency}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectCoordinator;
