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
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import {
  IProjectPartnershipsForm,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import EditDialog from 'components/dialog/EditDialog';
import { EditPartnershipsI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

const useStyles = makeStyles({
  tableCellBorderBottom: {
    borderBottom: 'none'
  },
  tableHeading: {
    fontWeight: 'bold',
    borderBottom: 'none'
  }
});

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: { partnerships, id },
    codes
  } = props;

  const classes = useStyles();

  const history = useHistory();

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDialogEdit = (values: IProjectPartnershipsForm) => {
    // make put request from here using values and projectId
    setOpenEditDialog(false);
    history.push(`/projects/${id}/details`);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditPartnershipsI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectPartnerships" codes={codes} />,
          initialValues: partnerships,
          validationSchema: ProjectPartnershipsFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEdit}
      />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Partnerships</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => setOpenEditDialog(true)}
              title="Edit Partnerships"
              aria-label="Edit Partnerships">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12}>
            <TableContainer>
              <Table aria-label="indigenous-partnerships-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Indigenous Partnerships</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerships.indigenous_partnership_strings?.map((indigenousPartnership: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(
                            index === partnerships.indigenous_partnership_strings.length - 1 &&
                              classes.tableCellBorderBottom
                          )}>
                          {indigenousPartnership}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table aria-label="stakeholder-partnerships-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Stakeholder Partnerships</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerships.stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(
                            index === partnerships.stakeholder_partnerships.length - 1 && classes.tableCellBorderBottom
                          )}>
                          {stakeholderPartnership}
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

export default Partnerships;
