import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
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
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
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
    surveyForViewData: {
      surveyData: { survey_details, proprietor }
    },
    codes,
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  // const [surveyDataForUpdate, setSurveyDataForUpdate] = useState<IGetSurveyForViewResponse>(null as any);
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
    if (!proprietor) {
      setSurveyProprietorFormData(ProprietaryDataInitialValues);
      setOpenEditDialog(true);
      return;
    }

    let surveyResponseData;

    try {
      const surveyResponse = await biohubApi.survey.getSurveyForView(projectForViewData.id, survey_details?.id);

      if (!surveyResponse) {
        showErrorDialog({ open: true });
        return;
      }

      surveyResponseData = surveyResponse;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    // setSurveyDataForUpdate(surveyResponseData);

    setSurveyProprietorFormData({
      proprietor: {
        survey_data_proprietary:
          (!!surveyResponseData.surveyData.proprietor && 'true') ||
          ProprietaryDataInitialValues.proprietor.survey_data_proprietary,
        proprietary_data_category:
          surveyResponseData.surveyData.proprietor?.proprietor_type_id ||
          ProprietaryDataInitialValues.proprietor.proprietary_data_category,
        proprietor_name:
          surveyResponseData.surveyData.proprietor?.proprietor_name ||
          ProprietaryDataInitialValues.proprietor.proprietor_name,
        first_nations_id:
          surveyResponseData.surveyData.proprietor?.first_nations_id ||
          ProprietaryDataInitialValues.proprietor.first_nations_id,
        category_rationale:
          surveyResponseData.surveyData.proprietor?.category_rationale ||
          ProprietaryDataInitialValues.proprietor.category_rationale,
        disa_required:
          (!!surveyResponseData.surveyData.proprietor?.disa_required && 'true') ||
          ProprietaryDataInitialValues.proprietor.disa_required
      }
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProprietaryDataForm) => {
    try {
      const surveyData = {
        proprietor: values.proprietor
      };

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
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
        <dl>
          {!proprietor && (
            <Grid container spacing={2}>
              <Grid item>
                <Typography>The data captured in this survey is not proprietary.</Typography>
              </Grid>
            </Grid>
          )}
          {proprietor && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietor Name
                </Typography>
                <Typography component="dd" variant="body1">
                  {proprietor.proprietor_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Data Category
                </Typography>
                <Typography component="dd" variant="body1">
                  {proprietor.proprietor_type_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  DISA Required
                </Typography>
                <Typography component="dd" variant="body1">
                  {proprietor.disa_required ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Category Rationale
                </Typography>
                <Typography style={{ wordBreak: 'break-all' }}>{proprietor.category_rationale}</Typography>
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  );
};

export default SurveyProprietaryData;
