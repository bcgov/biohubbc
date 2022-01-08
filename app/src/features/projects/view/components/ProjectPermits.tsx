import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditPermitI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import ProjectPermitForm, {
  IProjectPermitForm,
  ProjectPermitEditFormYupSchema,
  ProjectPermitFormArrayItemInitialValues,
  ProjectPermitFormInitialValues
} from 'features/projects/components/ProjectPermitForm';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetNonSamplingPermit } from 'interfaces/usePermitApi.interface';
import {
  IGetProjectForUpdateResponseCoordinator,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';

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

  const restorationTrackerApi = useRestorationTrackerApi();

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
  const [nonSamplingPermits, setNonSamplingPermits] = useState<IGetNonSamplingPermit[]>((null as unknown) as []);

  const handleDialogEditOpen = async () => {
    let permitResponseData;
    let coordinatorResponseData;
    let existingPermitsResponseData;

    try {
      const [projectForUpdateResponse, existingPermitsResponse] = await Promise.all([
        restorationTrackerApi.project.getProjectForUpdate(id, [
          UPDATE_GET_ENTITIES.permit,
          UPDATE_GET_ENTITIES.coordinator
        ]),
        restorationTrackerApi.permit.getNonSamplingPermits()
      ]);

      if (!projectForUpdateResponse?.permit || !projectForUpdateResponse?.coordinator || !existingPermitsResponse) {
        showErrorDialog({ open: true });
        return;
      }

      permitResponseData = projectForUpdateResponse.permit;
      coordinatorResponseData = projectForUpdateResponse.coordinator;
      existingPermitsResponseData = existingPermitsResponse;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setPermitFormData({
      permits: permitResponseData.permits
    });
    setCoordinatorData(coordinatorResponseData);
    setNonSamplingPermits(existingPermitsResponseData);

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectPermitForm) => {
    const projectData = { permit: values, coordinator: coordinatorData };

    try {
      await restorationTrackerApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
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
          element: (
            <ProjectPermitForm
              non_sampling_permits={
                nonSamplingPermits?.map((item: IGetNonSamplingPermit) => {
                  return { value: item.permit_id, label: `${item.number} - ${item.type}` };
                }) || []
              }
            />
          ),
          initialValues: permitFormData?.permits?.length
            ? permitFormData
            : { permits: [ProjectPermitFormArrayItemInitialValues] },
          validationSchema: ProjectPermitEditFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <Box>
        <H3ButtonToolbar
          label="Project Permits"
          buttonLabel="Edit"
          buttonTitle="Edit Permits"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>

            {hasPermits && (
              <TableBody>
                {permit.permits.map((item: any) => (
                  <TableRow key={item.permit_number}>
                    <TableCell>{item.permit_number}</TableCell>
                    <TableCell>{item.permit_type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}

            {!hasPermits && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>No Permits</TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default ProjectPermits;
