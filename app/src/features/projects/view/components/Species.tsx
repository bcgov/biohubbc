import {
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import clsx from 'clsx';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import {
  IProjectSpeciesForm,
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import { EditDialog } from 'components/dialog/EditDialog';
import { ErrorDialog } from 'components/dialog/ErrorDialog';
import { EditSpeciesI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useBiohubApi } from 'hooks/useBioHubApi';

const useStyles = makeStyles({
  tableCellBorderBottom: {
    borderBottom: 'none'
  },
  tableHeading: {
    fontWeight: 'bold',
    borderBottom: 'none'
  }
});
export interface ISpeciesProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Species content for a project.
 *
 * @return {*}
 */
const Species: React.FC<ISpeciesProps> = (props) => {
  const {
    projectForViewData: {
      species: { focal_species, ancillary_species },
      id
    },
    codes
  } = props;

  const history = useHistory();
  const biohubApi = useBiohubApi();

  const classes = useStyles();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [speciesForUpdate, setSpeciesForUpdate] = useState(ProjectSpeciesFormInitialValues);

  const handleDialogEditOpen = async () => {
    const { species } = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.species]);

    if (!species) {
      setOpenErrorDialog(true);
      return;
    }

    setSpeciesForUpdate(species);
    setOpenEditDialog(true);
  };
  const handleDialogEditSave = (values: IProjectSpeciesForm) => {
    // make put request from here using values and projectId
    setOpenEditDialog(false);
    history.push(`/projects/${id}/details`);
  };
  return (
    <>
      <EditDialog
        dialogTitle={EditSpeciesI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectSpecies" codes={codes} />,
          initialValues: speciesForUpdate,
          validationSchema: ProjectSpeciesFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />

      <ErrorDialog
        dialogTitle="Failed to Fetch Edit Data"
        dialogText="Could not retrieve data for editing purposes, please try again later."
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        onOk={() => setOpenErrorDialog(false)}
      />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Species</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => handleDialogEditOpen()} title="Edit Species" aria-label="Edit Species">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid container item xs={12}>
            <TableContainer>
              <Table aria-label="focal-species-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Focal Species</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {focal_species?.map((focalSpecies: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(index === focal_species.length - 1 && classes.tableCellBorderBottom)}>
                          {focalSpecies}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid container item xs={12}>
            <TableContainer>
              <Table aria-label="ancillary-species-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Ancillary Species</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ancillary_species?.map((ancillarySpecies: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(index === ancillary_species.length - 1 && classes.tableCellBorderBottom)}>
                          {ancillarySpecies}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Species;
