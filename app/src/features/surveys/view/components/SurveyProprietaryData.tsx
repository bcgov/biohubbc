import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ProprietaryDataForm, {
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema,
  IProprietaryDataForm
} from 'features/surveys/components/ProprietaryDataForm';
import { IGetProjectForViewResponse}  from 'interfaces/useProjectApi.interface';
import { IGetSurveyForUpdateResponse, IGetSurveyForViewResponse} from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';

import { APIError } from 'hooks/api/useAxios';
import EditDialog from 'components/dialog/EditDialog';
import { EditSurveyProprietorI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { UPDATE_GET_SURVEY_ENTITIES } from 'interfaces/useSurveyApi.interface';

export interface ISurveyProprietaryDataProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;}

/**
 * Proprietary data content for a survey.
 *
 * @return {*}
 */
const SurveyProprietaryData: React.FC<ISurveyProprietaryDataProps> = (props) => {
  const biohubApi = useBiohubApi();

  const {
    projectForViewData,
    surveyForViewData: { survey_details, survey_proprietor },
    codes,
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [surveyDataForUpdate, setSurveyDataForUpdate] = useState<IGetSurveyForUpdateResponse>(null as any);
  const [surveyProprietorFormData, setSurveyProprietorFormData] = useState<IProprietaryDataForm>(
    ProprietaryDataInitialValues

  );

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSurveyProprietorI18N.editErrorTitle,
    dialogText: EditSurveyProprietorI18N.editErrorText,
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
    let surveyProprietorResponseData;

    if (survey_proprietor) {
      try {
        const response = await biohubApi.survey.getSurveyForUpdate(projectForViewData.id, survey_details?.id,  [UPDATE_GET_SURVEY_ENTITIES.survey_proprietor]);

        if (!response) {
          showErrorDialog({ open: true });
          return;
        }

        surveyProprietorResponseData = response;
      } catch (error) {
        const apiError = error as APIError;
        showErrorDialog({ dialogText: apiError.message, open: true });
        return;
      }

      if (surveyProprietorResponseData.survey_proprietor) {
        setSurveyProprietorFormData({
          proprietary_data_category: surveyProprietorResponseData.survey_proprietor.proprietor_type_id,
          proprietor_name: surveyProprietorResponseData.survey_proprietor.proprietor_name,
          first_nations_id: surveyProprietorResponseData.survey_proprietor.first_nations_id,
          category_rationale: surveyProprietorResponseData.survey_proprietor.category_rationale,
          survey_data_proprietary: 'true',
          data_sharing_agreement_required: surveyProprietorResponseData.survey_proprietor.data_sharing_agreement_required
        });
        //console.log('surveyProprietorFormData', surveyProprietorFormData);

        setSurveyDataForUpdate(surveyProprietorResponseData);
      } else {
        setSurveyProprietorFormData(ProprietaryDataInitialValues);
      }
    } else {
      setSurveyProprietorFormData(ProprietaryDataInitialValues);
    }

    // console.log('surveyProprietorFormData', surveyProprietorFormData);
    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values:  IProprietaryDataForm) => {
    console.log('surveyDataForUpdate', surveyDataForUpdate);

    try {
      const surveyProprietorData = {
        survey_proprietor: {
          proprietor_type_id: values.proprietary_data_category,
          proprietor_name: values.proprietor_name,
          first_nations_id: values.first_nations_id,
          category_rationale: values.category_rationale,
          data_sharing_agreement_required: values.data_sharing_agreement_required,
          id: (surveyDataForUpdate?.survey_proprietor && surveyDataForUpdate?.survey_proprietor.id) || undefined,
          revision_count: (surveyDataForUpdate?.survey_proprietor && surveyDataForUpdate?.survey_proprietor?.revision_count) || undefined
        },
        survey_data_proprietary: values.survey_data_proprietary
      };

      await biohubApi.survey.updateSurvey(
        projectForViewData.id,
        survey_details.id,
        surveyProprietorData
      );
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
        dialogTitle={EditSurveyProprietorI18N.editTitle}
        open={openEditDialog}
        component={{
          element: (
            <ProprietaryDataForm
              proprietary_data_category={
                codes?.proprietor_type?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              first_nations={
                codes?.first_nations?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: surveyProprietorFormData,
          validationSchema: ProprietaryDataYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">Proprietary Data</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit Proprietary Data"
            aria-label="Edit Proprietary Data"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            Edit
          </Button>
        </Box>
        <dl>
          {!survey_proprietor && (
            <Grid container spacing={2}>
              <Grid item>
                <Typography>The data captured in this survey is not proprietary.</Typography>
              </Grid>
            </Grid>
          )}
          {survey_proprietor && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Data Sharing Agreement Required
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_proprietor.data_sharing_agreement_required === 'true' ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietary Data Category
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_proprietor.proprietor_type_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietor Name
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_proprietor.proprietor_name}
                </Typography>
              </Grid>
              <Grid item>
                <Box mt={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" height="2rem">
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Category Rationale
                    </Typography>
                  </Box>
                  <Typography style={{ wordBreak: 'break-all' }}>{survey_proprietor.category_rationale}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  )
};

export default SurveyProprietaryData;
