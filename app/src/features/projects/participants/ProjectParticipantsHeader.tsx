import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import AddProjectParticipantsForm, {
  AddProjectParticipantsFormInitialValues,
  AddProjectParticipantsFormYupSchema
} from './AddProjectParticipantsForm';

const useStyles = makeStyles((theme: Theme) => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  spacingRight: {
    paddingRight: '1rem'
  }
}));

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
  const classes = useStyles();
  const history = useHistory();
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

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

  const handleAddProjectParticipantsSave = async (values: any) => {
    try {
      const response = await biohubApi.project.addProjectParticipants(projectId, values.participants);

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
      <Paper square={true}>
        <Container maxWidth="xl">
          <Box py={3}>
            <Breadcrumbs>
              <Link
                color="primary"
                onClick={() => history.push('/admin/projects')}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">Projects</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/admin/projects/${props.projectWithDetails.id}`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{props.projectWithDetails.project.project_name}</Typography>
              </Link>
              <Typography variant="body2">Project Team</Typography>
            </Breadcrumbs>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Box pb={4}>
              <Box mb={1.5} display="flex">
                <Button
                  color="primary"
                  variant="text"
                  startIcon={<Icon path={mdiArrowLeft} size={1} />}
                  onClick={() => history.goBack()}
                />
                <Typography className={classes.spacingRight} variant="h1">
                  Project Team
                </Typography>
              </Box>
            </Box>
            <Box ml={4} mb={4}>
              <Button
                variant="outlined"
                disableElevation
                data-testid="invite-project-users-button"
                aria-label={'Invite People'}
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => setOpenAddParticipantsDialog(true)}>
                Add Project Participants
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <EditDialog
        dialogTitle={'Add Project Participants'}
        open={openAddParticipantsDialog}
        component={{
          element: (
            <AddProjectParticipantsForm
              project_roles={
                props.codes?.project_roles?.map((item) => {
                  return { value: item.name, label: item.name };
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
        }}
      />
    </>
  );
};

export default ProjectParticipantsHeader;
