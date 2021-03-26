import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DATE_FORMAT } from 'constants/dateFormats';
import { EditGeneralInformationI18N } from 'constants/i18n';
import {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseDetails,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const GeneralInformation: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { project, id },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditGeneralInformationI18N.editErrorTitle,
    dialogText: EditGeneralInformationI18N.editErrorText,
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
  const [detailsDataForUpdate, setDetailsDataForUpdate] = useState<IGetProjectForUpdateResponseDetails>(null as any);
  const [detailsFormData, setDetailsFormData] = useState<IProjectDetailsForm>(ProjectDetailsFormInitialValues);

  const handleDialogEditOpen = async () => {
    let detailsResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.project]);

      if (!response?.project) {
        showErrorDialog({ open: true });
        return;
      }

      detailsResponseData = response.project;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setDetailsDataForUpdate(detailsResponseData);

    setDetailsFormData({
      project_name: detailsResponseData.project_name,
      project_type: detailsResponseData.project_type,
      project_activities: detailsResponseData.project_activities,
      climate_change_initiatives: detailsResponseData.climate_change_initiatives,
      start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, detailsResponseData.start_date),
      end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, detailsResponseData.end_date)
    } as any);

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectDetailsForm) => {
    const projectData = {
      project: { ...values, revision_count: detailsDataForUpdate.revision_count }
    };

    try {
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  const projectActivities =
    codes?.activity
      ?.filter((item) => project.project_activities.includes(item.id))
      ?.map((item) => item.name)
      .join(', ') || '';

  const projectClimateChangeInitiatives =
    codes?.climate_change_initiative
      ?.filter((item) => project.climate_change_initiatives.includes(item.id))
      ?.map((item) => item.name)
      ?.join(', ') || '';

  return (
    <>
      <EditDialog
        dialogTitle={EditGeneralInformationI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectDetails" codes={codes} />,
          initialValues: detailsFormData,
          validationSchema: ProjectDetailsFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">General Information</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => handleDialogEditOpen()}
              title="Edit General Information"
              aria-label="Edit General Information">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Project Name</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{project.project_name}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Type</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{project.project_type}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Timeline</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">
                {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, project.start_date, project.end_date)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Activities</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{projectActivities}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Climate Change Initiatives</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{projectClimateChangeInitiatives}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default GeneralInformation;
