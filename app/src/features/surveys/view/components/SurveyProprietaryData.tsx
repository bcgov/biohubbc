import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyProprietorI18N } from 'constants/i18n';
import ProprietaryDataForm, {
  IProprietaryDataForm,
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema
} from 'features/surveys/components/ProprietaryDataForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import {
  IGetSurveyForUpdateResponseProprietor,
  IGetSurveyForViewResponse,
  UPDATE_GET_SURVEY_ENTITIES
} from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';

export interface ISurveyProprietaryDataProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

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
  const [
    surveyProprietorDataForUpdate,
    setSurveyDataForUpdate
  ] = useState<IGetSurveyForUpdateResponseProprietor | null>(null);
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
    if (!survey_proprietor) {
      setSurveyDataForUpdate(null);
      setSurveyProprietorFormData(ProprietaryDataInitialValues);
      setOpenEditDialog(true);
      return;
    }

    let surveyProprietorResponseData;

    try {
      const response = await biohubApi.survey.getSurveyForUpdate(projectForViewData.id, survey_details?.id, [
        UPDATE_GET_SURVEY_ENTITIES.survey_proprietor
      ]);

      if (!response) {
        showErrorDialog({ open: true });
        return;
      }

      surveyProprietorResponseData = response?.survey_proprietor || null;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setSurveyDataForUpdate(surveyProprietorResponseData);

    setSurveyProprietorFormData({
      survey_data_proprietary:
        surveyProprietorResponseData?.survey_data_proprietary || ProprietaryDataInitialValues.survey_data_proprietary,
      proprietary_data_category:
        surveyProprietorResponseData?.proprietary_data_category ||
        ProprietaryDataInitialValues.proprietary_data_category,
      proprietor_name: surveyProprietorResponseData?.proprietor_name || ProprietaryDataInitialValues.proprietor_name,
      first_nations_id: surveyProprietorResponseData?.first_nations_id || ProprietaryDataInitialValues.first_nations_id,
      category_rationale:
        surveyProprietorResponseData?.category_rationale || ProprietaryDataInitialValues.category_rationale,
      data_sharing_agreement_required:
        surveyProprietorResponseData?.data_sharing_agreement_required ||
        ProprietaryDataInitialValues.data_sharing_agreement_required
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProprietaryDataForm) => {
    const surveyData = {
      survey_proprietor: {
        ...values,
        id: surveyProprietorDataForUpdate?.id,
        revision_count: surveyProprietorDataForUpdate?.revision_count
      }
    };

    try {
      await biohubApi.survey.updateSurvey(projectForViewData.id, survey_details.id, surveyData);
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
                  return { value: item.id, label: item.name, is_first_nation: item.is_first_nation };
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
        <H3ButtonToolbar
          label="Proprietary Data"
          buttonLabel="Edit"
          buttonTitle="Edit Survey Proprietor"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
        />
        <Divider></Divider>
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
                  Proprietary Data Category
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_proprietor.proprietary_data_category_name}
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
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Data and Information Sharing Agreement Required
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_proprietor.data_sharing_agreement_required === 'true' ? 'Yes' : 'No'}
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
  );
};

export default SurveyProprietaryData;
