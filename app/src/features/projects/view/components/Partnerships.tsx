import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditPartnershipsI18N } from 'constants/i18n';
import {
  IProjectPartnershipsForm,
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships },
      id
    },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [partnershipsForUpdate, setPartnershipsForUpdate] = useState(ProjectPartnershipsFormInitialValues);

  const handleDialogEditOpen = async () => {
    let partnershipsResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.partnerships]);

      if (!response?.partnerships) {
        showErrorDialog({ open: true });
        return;
      }

      partnershipsResponseData = response.partnerships;
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setPartnershipsForUpdate(partnershipsResponseData);

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectPartnershipsForm) => {
    const projectData = { partnerships: values };

    try {
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditPartnershipsI18N.editErrorTitle,
    dialogText: EditPartnershipsI18N.editErrorText,
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

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={EditPartnershipsI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectPartnerships" codes={codes} />,
          initialValues: partnershipsForUpdate,
          validationSchema: ProjectPartnershipsFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />

      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">Partnerships</Typography>
          <Button
            className="editButtonSmall"
            onClick={() => handleDialogEditOpen()}
            title="Edit Partnerships"
            aria-label="Edit Partnerships"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            EDIT
          </Button>
        </Box>
      </Box>

      <dl className="ddInline">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Indigenous Partnerships
            </Typography>
            {indigenous_partnerships?.map((indigenousPartnership: string, index: number) => {
              return (
                <Typography component="dd" variant="body1" key={index}>
                  {indigenousPartnership}
                </Typography>
              );
            })}

            {!hasIndigenousPartnerships && (
              <Typography component="dd" variant="body1">
                No Indigenous Partnerships
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Stakeholder Partnerships
            </Typography>
            {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
              return (
                <Typography component="dd" variant="body1" key={index}>
                  {stakeholderPartnership}
                </Typography>
              );
            })}

            {!hasStakeholderPartnerships && (
              <Typography component="dd" variant="body1">
                No Stakeholder Partnerships
              </Typography>
            )}
          </Grid>
        </Grid>
      </dl>
    </>
  );
};

export default Partnerships;
