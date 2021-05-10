import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateFormats';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema,
  IGeneralInformationForm
} from 'features/surveys/components/GeneralInformationForm';
import { IGetProjectSurveyForViewResponse, ISurveyUpdateRequest } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { APIError } from 'hooks/api/useAxios';
import EditDialog from 'components/dialog/EditDialog';
import { EditSurveyGeneralInformationI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

export interface ISurveyGeneralInformationProps {
  surveyForViewData: IGetProjectSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectId: number;
  refresh: () => void;
}

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyGeneralInformation: React.FC<ISurveyGeneralInformationProps> = (props) => {
  const biohubApi = useBiohubApi();

  const {
    projectId,
    surveyForViewData: { id, survey },
    codes,
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [surveyDataForUpdate, setSurveyDataForUpdate] = useState<ISurveyUpdateRequest>(null as any);
  const [generalInformationFormData, setGeneralInformationFormData] = useState<IGeneralInformationForm>(
    GeneralInformationInitialValues
  );

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSurveyGeneralInformationI18N.editErrorTitle,
    dialogText: EditSurveyGeneralInformationI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const handleDialogEditOpen = async () => {
    let generalInformationResponseData;

    try {
      const response = await biohubApi.project.getSurveyForUpdate(projectId, id);

      if (!response) {
        showErrorDialog({ open: true });
        return;
      }

      generalInformationResponseData = response;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setSurveyDataForUpdate(generalInformationResponseData);

    setGeneralInformationFormData({
      ...generalInformationResponseData,
      start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, generalInformationResponseData.start_date),
      end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, generalInformationResponseData.end_date)
    });
    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IGeneralInformationForm) => {
    const surveyData = {
      ...values,
      revision_count: surveyDataForUpdate.revision_count,
      survey_area_name: surveyDataForUpdate.survey_area_name
    };

    try {
      await biohubApi.project.updateSurvey(projectId, id, surveyData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    refresh();
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditSurveyGeneralInformationI18N.editTitle}
        open={openEditDialog}
        component={{
          element: (
            <GeneralInformationForm
              species={
                codes?.species?.map((item: any) => {
                  return { value: item.name, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: generalInformationFormData,
          validationSchema: GeneralInformationYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">General Information</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit General Information"
            aria-label="Edit General Information"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            Edit
          </Button>
        </Box>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Name
              </Typography>
              <Typography component="dd" variant="body1">
                {survey.survey_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Timeline
              </Typography>
              <Typography component="dd" variant="body1">
                {survey.end_date ? (
                  <>
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat2,
                      survey.start_date,
                      survey.end_date
                    )}
                  </>
                ) : (
                  <>
                    <span>Start Date:</span>{' '}
                    {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat2, survey.start_date)}
                  </>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Lead
              </Typography>
              <Typography component="dd" variant="body1">
                {survey.biologist_first_name} {survey.biologist_last_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Species
              </Typography>
              <Typography component="dd" variant="body1">
                {survey.species}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item>
              <Box mt={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between" height="2rem">
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Purpose
                  </Typography>
                </Box>
                <Typography>{survey.survey_purpose}</Typography>
              </Box>
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
