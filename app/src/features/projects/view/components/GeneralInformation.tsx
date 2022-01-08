import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { EditGeneralInformationI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseDetails,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const GeneralInformation: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { project, id },
    codes
  } = props;

  const restorationTrackerApi = useRestorationTrackerApi();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditGeneralInformationI18N.editErrorTitle,
    dialogText: EditGeneralInformationI18N.editErrorText,
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
  const [detailsDataForUpdate, setDetailsDataForUpdate] = useState<IGetProjectForUpdateResponseDetails>(null as any);
  const [detailsFormData, setDetailsFormData] = useState<IProjectDetailsForm>(ProjectDetailsFormInitialValues);

  const handleDialogEditOpen = async () => {
    let detailsResponseData;

    try {
      const response = await restorationTrackerApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.project]);

      if (!response?.project) {
        showErrorDialog({ open: true });
        return;
      }

      detailsResponseData = response.project;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setDetailsDataForUpdate(detailsResponseData);

    setDetailsFormData({
      project_name: detailsResponseData.project_name,
      project_type: detailsResponseData.project_type,
      project_activities: detailsResponseData.project_activities,
      start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, detailsResponseData.start_date),
      end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, detailsResponseData.end_date)
    } as any);

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectDetailsForm) => {
    const projectData = {
      project: { ...values, revision_count: detailsDataForUpdate.revision_count }
    };

    try {
      await restorationTrackerApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  const projectActivities =
    codes?.activity
      ?.filter((item) => project.project_activities.includes(item.id))
      ?.map((item) => item.name)
      .join(', ') || '';

  return (
    <>
      <EditDialog
        dialogTitle={EditGeneralInformationI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectDetails" codes={codes} />,
          initialValues: detailsFormData,
          validationSchema: ProjectDetailsFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <Box>
        <H3ButtonToolbar
          label="General Information"
          buttonLabel="Edit"
          buttonTitle="Edit General Information"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Project Name
              </Typography>
              <Typography component="dd" variant="body1">
                {project.project_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Project Type
              </Typography>
              <Typography component="dd" variant="body1">
                {project.project_type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Timeline
              </Typography>
              <Typography component="dd" variant="body1">
                {project.end_date ? (
                  <>
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      project.start_date,
                      project.end_date
                    )}
                  </>
                ) : (
                  <>
                    <span>Start Date:</span>{' '}
                    {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, project.start_date)}
                  </>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Activities
              </Typography>
              <Typography component="dd" variant="body1">
                {projectActivities ? <>{projectActivities}</> : 'No Activities'}
              </Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default GeneralInformation;
