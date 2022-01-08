import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditCoordinatorI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectCoordinatorForm,
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseCoordinator,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
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

  const restorationTrackerApi = useRestorationTrackerApi();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditCoordinatorI18N.editErrorTitle,
    dialogText: EditCoordinatorI18N.editErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
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
      const response = await restorationTrackerApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.coordinator]);

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
      await restorationTrackerApi.project.updateProject(id, projectData);
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
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <Box>
        <H3ButtonToolbar
          label="Project Contact"
          buttonLabel="Edit"
          buttonTitle="Edit Project Contact Information"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography component="dd" variant="body1">
                {coordinator.first_name} {coordinator.last_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Email Address
              </Typography>
              <Typography component="dd" variant="body1">
                {coordinator.email_address}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Agency
              </Typography>
              <Typography component="dd" variant="body1">
                {coordinator.coordinator_agency}
              </Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default ProjectCoordinator;
