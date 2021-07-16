import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseCoordinator,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ProjectPermitForm, {
  IProjectPermitForm,
  ProjectPermitEditFormYupSchema,
  ProjectPermitFormArrayItemInitialValues,
  ProjectPermitFormInitialValues
} from 'features/projects/components/ProjectPermitForm';
import EditDialog from 'components/dialog/EditDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { APIError } from 'hooks/api/useAxios';
import { EditPermitI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  }
});

export interface IProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Permits content for a project.
 *
 * @return {*}
 */
const ProjectPermits: React.FC<IProjectPermitsProps> = (props) => {
  const {
    projectForViewData: { permit, id }
  } = props;

  const biohubApi = useBiohubApi();
  const classes = useStyles();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditPermitI18N.editErrorTitle,
    dialogText: EditPermitI18N.editErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [permitFormData, setPermitFormData] = useState(ProjectPermitFormInitialValues);
  const [coordinatorData, setCoordinatorData] = useState<IGetProjectForUpdateResponseCoordinator>(
    (null as unknown) as IGetProjectForUpdateResponseCoordinator
  );

  const handleDialogEditOpen = async () => {
    let permitResponseData;
    let coordinatorResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [
        UPDATE_GET_ENTITIES.permit,
        UPDATE_GET_ENTITIES.coordinator
      ]);

      if (!response?.permit || !response?.coordinator) {
        showErrorDialog({ open: true });
        return;
      }

      permitResponseData = response.permit;
      coordinatorResponseData = response.coordinator;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setPermitFormData({
      permits: permitResponseData.permits
    });
    setCoordinatorData(coordinatorResponseData);

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectPermitForm) => {
    const projectData = { permit: values, coordinator: coordinatorData };

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

  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={EditPermitI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectPermitForm />,
          initialValues: permitFormData?.permits?.length
            ? permitFormData
            : { permits: [ProjectPermitFormArrayItemInitialValues] },
          validationSchema: ProjectPermitEditFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">Permits</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit Permits"
            aria-label="Edit Permits"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            Edit
          </Button>
        </Box>

        {hasPermits && (
          <TableContainer>
            <Table className={classes.table} aria-label="permits-list-table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.heading}>Permit Number</TableCell>
                  <TableCell className={classes.heading}>Permit Type</TableCell>
                </TableRow>
              </TableHead>
              {permit.permits.map((item: any) => (
                <TableBody key={item.permit_number}>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      {item.permit_number}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.permit_type}
                    </TableCell>
                  </TableRow>
                </TableBody>
              ))}
            </Table>
          </TableContainer>
        )}

        {!hasPermits && (
          <Box component="ul" className="listNoBullets">
            <Box component="li">
              <Typography component="dd" variant="body1">
                No Permits
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ProjectPermits;
