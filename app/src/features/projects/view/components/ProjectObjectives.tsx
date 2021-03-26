import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ReadMoreField from 'components/fields/ReadMoreField';
import { EditObjectivesI18N } from 'constants/i18n';
import {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseObjectives,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { objectives, id },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditObjectivesI18N.editErrorTitle,
    dialogText: EditObjectivesI18N.editErrorText,
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

  const [objectivesDataForUpdate, setObjectivesDataForUpdate] = useState<IGetProjectForUpdateResponseObjectives>(
    null as any
  );
  const [objectivesFormData, setObjectivesFormData] = useState<IProjectObjectivesForm>(ProjectObjectivesFormInitialValues);

  const handleDialogEditOpen = async () => {
    let objectivesResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.objectives]);

      if (!response?.objectives) {
        showErrorDialog({ open: true });
        return;
      }

      objectivesResponseData = response.objectives;
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setObjectivesDataForUpdate(objectivesResponseData);

    setObjectivesFormData({
      objectives: objectivesResponseData.objectives,
      caveats: objectivesResponseData.caveats
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectObjectivesForm) => {
    const projectData = {
      objectives: { ...values, revision_count: objectivesDataForUpdate.revision_count }
    };

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

  return (
    <>
      <EditDialog
        dialogTitle={EditObjectivesI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectObjectives" codes={codes} />,
          initialValues: objectivesFormData,
          validationSchema: ProjectObjectivesFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Box m={3}>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Project Objectives</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => handleDialogEditOpen()}
              title="Edit Objectives Information"
              aria-label="Edit Objectives Information">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <ReadMoreField text={objectives.objectives} maxCharLength={850} />
          </Grid>
        </Grid>

        <Grid container item spacing={3} xs={12} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Project Caveats</Typography>
          </Grid>
        </Grid>
        <Grid container item spacing={2} xs={12}>
          <Grid item xs={12}>
            <ReadMoreField text={objectives.caveats} maxCharLength={850} />
          </Grid>
        </Grid>
      </Grid>
      </Box>
    </>
  );
};

export default ProjectObjectives;
