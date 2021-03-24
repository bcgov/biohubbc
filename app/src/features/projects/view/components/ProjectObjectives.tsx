import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import EditDialog from 'components/dialog/EditDialog';
import ReadMoreField from 'components/fields/ReadMoreField';
import { EditObjectivesI18N } from 'constants/i18n';
import ProjectObjectivesForm, {
  IProjectObjectivesForm,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { useHistory } from 'react-router';

export interface IProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { objectives, id }
  } = props;

  const history = useHistory();

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDialogEdit = (values: IProjectObjectivesForm) => {
    // make put request from here using values and projectId
    setOpenEditDialog(false);
    //history.push(`/projects/${id}/details`);
    console.log(id + ' ' + history.location.pathname);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditObjectivesI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectObjectivesForm />,
          initialValues: objectives,
          validationSchema: ProjectObjectivesFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEdit}
      />
      <Box m={3}>
        <Grid container spacing={3}>
          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3">Project Objectives</Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => setOpenEditDialog(true)}
                title="Edit Objectives Information"
                aria-label="Edit Objectives Information">
                <Typography variant="caption">
                  <Edit fontSize="inherit" /> EDIT
                </Typography>
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            <Grid item xs={12}>
              <ReadMoreField text={objectives.objectives} maxCharLength={850} />
            </Grid>
          </Grid>

          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
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
