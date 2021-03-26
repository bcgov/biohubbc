import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Grid,
  Typography,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useHistory } from 'react-router';
import { IProjectIUCNForm, ProjectIUCNFormInitialValues, ProjectIUCNFormYupSchema, ProjectIUCNFormArrayItemInitialValues } from 'features/projects/components/ProjectIUCNForm';
import EditDialog from 'components/dialog/EditDialog';
import { EditIUCNI18N } from 'constants/i18n';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { ErrorDialog } from 'components/dialog/ErrorDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  },
  tableCellBorderBottom: {
    borderBottom: 'none'
  },
  heading: {
    fontWeight: 'bold'
  },
  addButton: {
    border: '2px solid'
  }
});

export interface IIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectForViewData: { iucn, id },
    codes
  } = props;

  const classes = useStyles();
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [iucnForUpdate, setIucnForUpdate] = useState(ProjectIUCNFormInitialValues);

  const handleDialogEditOpen = async () => {
    const { iucn } = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.iucn]);

    if (!iucn) {
      setOpenErrorDialog(true);
      return;
    }

    setIucnForUpdate(iucn);
    setOpenEditDialog(true);
  };

  const handleDialogEdit = (values: IProjectIUCNForm) => {
    // make post request from here using values and projectId
    setOpenEditDialog(false);
    history.push(`/projects/${id}/details`);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditIUCNI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectIUCN" codes={codes} />,
          initialValues: iucnForUpdate?.classificationDetails?.length ? iucnForUpdate : { classificationDetails: [ProjectIUCNFormArrayItemInitialValues] },
          validationSchema: ProjectIUCNFormYupSchema
        }}
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEdit}
      />
      <ErrorDialog
        dialogTitle="Failed to Fetch IUCN Data"
        dialogText="Could not retrieve data for editing purposes, please try again later."
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        onOk={() => setOpenErrorDialog(false)}
      />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">IUCN Classification</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => handleDialogEditOpen()} title="Edit IUCN Classifications" aria-label="Edit IUCN Classifications">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        {iucn.classificationDetails.length > 0 && (
          <Grid container item xs={12}>
            <TableContainer>
              <Table className={classes.table} aria-label="iucn-classification-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.heading}>Classification</TableCell>
                    <TableCell className={classes.heading}>Sub-classification</TableCell>
                    <TableCell className={classes.heading}>Sub-classification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {iucn.classificationDetails.map((classificationDetail: any, index: number) => {
                    const tableCellStyle =
                      index === iucn.classificationDetails.length - 1 ? classes.tableCellBorderBottom : undefined;

                    return (
                      <TableRow key={classificationDetail.classification}>
                        <TableCell className={tableCellStyle}>{classificationDetail.classification}</TableCell>
                        <TableCell className={tableCellStyle}>{classificationDetail.subClassification1}</TableCell>
                        <TableCell className={tableCellStyle}>{classificationDetail.subClassification2}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default IUCNClassification;
