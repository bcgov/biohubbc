import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditPartnershipsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectPartnershipsForm,
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships },
      id
    },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [partnershipsFormData, setPartnershipsFormData] = useState<IProjectPartnershipsForm>(
    ProjectPartnershipsFormInitialValues
  );

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditPartnershipsI18N.editErrorTitle,
    dialogText: EditPartnershipsI18N.editErrorText,
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

  const handleDialogEditOpen = async () => {
    let partnershipsResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.partnerships]);

      if (!response?.partnerships) {
        showErrorDialog({ open: true });
        return;
      }

      partnershipsResponseData = response.partnerships;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setPartnershipsFormData({
      indigenous_partnerships: partnershipsResponseData.indigenous_partnerships,
      stakeholder_partnerships: partnershipsResponseData.stakeholder_partnerships
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectPartnershipsForm) => {
    const projectData = {
      partnerships: {
        ...values
      }
    };

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

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={EditPartnershipsI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectPartnerships" codes={codes} />,
          initialValues: partnershipsFormData,
          validationSchema: ProjectPartnershipsFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />

      <H3ButtonToolbar
        label="Partnerships"
        buttonLabel="Edit"
        buttonTitle="Edit Partnerships"
        buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
        buttonOnClick={() => handleDialogEditOpen()}
        toolbarProps={{ disableGutters: true }}
      />

      <dl className="ddInline">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Indigenous Partnerships
            </Typography>
            {indigenous_partnerships?.map((indigenousPartnership: string, index: number) => {
              return (
                <Typography component="dd" variant="body1" key={index}>
                  {codes?.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
                </Typography>
              );
            })}

            {!hasIndigenousPartnerships && (
              <Typography component="dd" variant="body1">
                No Indigenous Partnerships
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Other Partnerships
            </Typography>
            {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
              return (
                <Typography component="dd" variant="body1" key={index}>
                  {stakeholderPartnership}
                </Typography>
              );
            })}

            {!hasStakeholderPartnerships && (
              <Typography component="dd" variant="body1">
                No Other Partnerships
              </Typography>
            )}
          </Grid>
        </Grid>
      </dl>
    </>
  );
};

export default Partnerships;
