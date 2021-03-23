import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import EditDialog from 'components/dialog/EditDialog';
import ReadMoreField from 'components/fields/ReadMoreField';
import { EditObjectivesI18N } from 'constants/i18n';
import ProjectObjectivesForm, {
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
    projectForViewData: { objectives, projectId }
  } = props;

  const history = useHistory();

  const openModalEdit = () => {
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
  };

  const handleDialogNo = () => {
    setOpenEditDialog(false);
  };

  const handleDialogEdit = (values: any) => {
    //make put request from here
    setOpenEditDialog(false);
    alert(JSON.stringify({values: values, id: projectId}));
    history.push(`/projects/${projectId}/details`);
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);

  return (
    <>
      <EditDialog
        dialogTitle={EditObjectivesI18N.editTitle}
        dialogText={EditObjectivesI18N.editText}
        open={openEditDialog}
        component={{
          element: <ProjectObjectivesForm />,
          initialValues: objectives,
          validationSchema: ProjectObjectivesFormYupSchema
        }}
        onClose={handleEditDialogClose}
        onCancel={handleDialogNo}
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
                onClick={openModalEdit}
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
