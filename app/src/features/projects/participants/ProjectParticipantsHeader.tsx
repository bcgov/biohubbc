import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import AddProjectParticipantsForm, {
  AddProjectParticipantsFormInitialValues,
  AddProjectParticipantsFormYupSchema,
  IAddProjectParticipantsForm
} from './AddProjectParticipantsForm';

export interface IProjectParticipantsHeaderProps {
  projectWithDetails: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Survey header for a single-survey view.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectParticipantsHeader: React.FC<IProjectParticipantsHeaderProps> = (props) => {
  const history = useHistory();
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useRestorationTrackerApi();

  const [openAddParticipantsDialog, setOpenAddParticipantsDialog] = useState(false);

  const projectId = urlParams['id'];

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
  };

  const openErrorDialog = (errorDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      ...errorDialogProps,
      open: true
    });
  };

  const handleAddProjectParticipantsSave = async (values: IAddProjectParticipantsForm) => {
    try {
      const response = await restorationTrackerApi.project.addProjectParticipants(projectId, values.participants);

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
          dialogText: ProjectParticipantsI18N.addParticipantsErrorText
        });
        return;
      }

      props.refresh();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
        dialogText: ProjectParticipantsI18N.addParticipantsErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  return (
    <>
      <Container maxWidth="xl">
        <Box py={3}>
          <Breadcrumbs>
            <Link color="primary" onClick={() => history.push('/admin/projects')} aria-current="page">
              <Typography variant="body2">Projects</Typography>
            </Link>
            <Link
              color="primary"
              onClick={() => history.push(`/admin/projects/${props.projectWithDetails.id}`)}
              aria-current="page">
              <Typography variant="body2">{props.projectWithDetails.project.project_name}</Typography>
            </Link>
            <Typography variant="body2">Project Team</Typography>
          </Breadcrumbs>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={5}>
          <Typography variant="h1">Project Team</Typography>
          <Box ml={4}>
            <Button
              color="primary"
              variant="contained"
              data-testid="invite-project-users-button"
              aria-label={'Add Team Members'}
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => setOpenAddParticipantsDialog(true)}>
              <strong>Add Team Members</strong>
            </Button>
          </Box>
        </Box>
      </Container>

      <EditDialog
        dialogTitle={'Add Team Members'}
        open={openAddParticipantsDialog}
        dialogSaveButtonLabel={'Add'}
        component={{
          element: (
            <AddProjectParticipantsForm
              project_roles={
                props.codes?.project_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: AddProjectParticipantsFormInitialValues,
          validationSchema: AddProjectParticipantsFormYupSchema
        }}
        onCancel={() => setOpenAddParticipantsDialog(false)}
        onSave={(values) => {
          handleAddProjectParticipantsSave(values);
          setOpenAddParticipantsDialog(false);
          dialogContext.setSnackbar({
            open: true,
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {values.participants.length} team {values.participants.length > 1 ? 'members' : 'member'} added.
              </Typography>
            )
          });
        }}
      />
    </>
  );
};

export default ProjectParticipantsHeader;
