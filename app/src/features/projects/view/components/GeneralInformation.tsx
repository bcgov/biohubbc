import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
import React, { useState } from 'react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useHistory } from 'react-router';
import { IProjectDetailsForm, ProjectDetailsFormYupSchema } from 'features/projects/components/ProjectDetailsForm';
import EditDialog from 'components/dialog/EditDialog';
import { EditGeneralInformationI18N } from 'constants/i18n';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
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

  const formattedProject = {
    ...project,
    start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, project.start_date),
    end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, project.end_date)
  };

  const history = useHistory();

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDialogEdit = (values: IProjectDetailsForm) => {
    // make put request from here using values and projectId
    setOpenEditDialog(false);
    history.push(`/projects/${id}/details`);
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
          initialValues: formattedProject,
          validationSchema: ProjectDetailsFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEdit}
      />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">General Information</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => setOpenEditDialog(true)}
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
              <Typography variant="subtitle1">{project.project_type_name}</Typography>
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
