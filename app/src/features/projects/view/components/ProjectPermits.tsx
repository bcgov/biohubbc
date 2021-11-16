import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
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
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetNonSamplingPermit } from 'interfaces/usePermitApi.interface';
import {
  IGetProjectForUpdateResponseCoordinator,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';

const useStyles = makeStyles({
  permitList: {

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
  const [nonSamplingPermits, setNonSamplingPermits] = useState<IGetNonSamplingPermit[]>((null as unknown) as []);

  const handleDialogEditOpen = async () => {
    let permitResponseData;
    let coordinatorResponseData;
    let existingPermitsResponseData;

    try {
      const [projectForUpdateResponse, existingPermitsResponse] = await Promise.all([
        biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.permit, UPDATE_GET_ENTITIES.coordinator]),
        biohubApi.permit.getNonSamplingPermits()
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
      await biohubApi.project.updateProject(id, projectData);
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

        <Box component={Divider} mb={0}></Box>

        {hasPermits && (
          <List disablePadding className={classes.permitList}>
            {permit.permits.map((item: any) => (
              <>
                <ListItem key={item.permit_number} divider disableGutters>
                  <Box>
                    <strong>#{item.permit_number}</strong>&nbsp;
                    ({item.permit_type})
                  </Box>
                </ListItem>
              </>
            ))}
          </List>
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
