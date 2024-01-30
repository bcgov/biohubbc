import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AddProjectParticipantsForm, {
  AddProjectParticipantsFormInitialValues,
  AddProjectParticipantsFormYupSchema,
  IAddProjectParticipantsForm
} from './AddProjectParticipantsForm';

export interface IProjectParticipantsHeaderProps {
  refresh: () => void;
}

/**
 * Project participants page header.
 *
 * @param {IProjectParticipantsHeaderProps} props
 * @return {*}
 */
const ProjectParticipantsHeader = (props: IProjectParticipantsHeaderProps) => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  const projectWithDetails = projectContext.projectDataLoader.data;

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);

  const codes = codesContext.codesDataLoader.data;

  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const [openAddParticipantsDialog, setOpenAddParticipantsDialog] = useState(false);

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
      //TODO: update to follow new api changes
      const response = await biohubApi.projectParticipants.addProjectParticipants(
        projectContext.projectId,
        values.participants
      );

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
      <PageHeader
        title="Manage Project Team"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectContext.projectId}`}>
              {projectWithDetails?.projectData.project.project_name}
            </Link>
            <Typography component="span" variant="inherit" color="textSecondary" aria-current="page">
              Manage Project Team
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Button
            color="primary"
            variant="contained"
            data-testid="invite-project-users-button"
            aria-label={'Add Team Members'}
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => setOpenAddParticipantsDialog(true)}>
            Add Team Members
          </Button>
        }
      />

      <EditDialog
        dialogTitle={'Add Team Members'}
        open={openAddParticipantsDialog}
        dialogSaveButtonLabel={'Add'}
        component={{
          element: (
            <AddProjectParticipantsForm
              project_roles={
                codes.project_roles?.map((item) => {
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
