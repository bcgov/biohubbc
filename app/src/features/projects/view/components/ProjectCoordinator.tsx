import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React, { useState } from 'react';
import EditDialog from 'components/dialog/EditDialog';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import ProjectCoordinatorForm, {
  IProjectCoordinatorForm,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { useHistory } from 'react-router';
import { EditCoordinatorI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Project coordinator content for a project.
 *
 * @return {*}
 */
const ProjectCoordinator: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { coordinator, id },
    codes
  } = props;

  const history = useHistory();

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDialogEdit = (values: IProjectCoordinatorForm) => {
    // make put request from here using values and projectId
    setOpenEditDialog(false);
    history.push(`/projects/${id}/details`);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditCoordinatorI18N.editTitle}
        open={openEditDialog}
        component={{
          element: (
            <ProjectCoordinatorForm
              coordinator_agency={
                codes?.coordinator_agency?.map((item: any) => {
                  return item.name;
                }) || []
              }
            />
          ),
          initialValues: coordinator,
          validationSchema: ProjectCoordinatorYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEdit}
      />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Project Coordinator</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => setOpenEditDialog(true)}
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
