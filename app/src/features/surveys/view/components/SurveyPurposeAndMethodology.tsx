import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditSurveyPurposeAndMethodologyI18N } from 'constants/i18n';
import PurposeAndMethodologyForm, {
  IPurposeAndMethodologyForm,
  PurposeAndMethodologyInitialValues,
  PurposeAndMethodologyYupSchema
} from 'features/surveys/components/PurposeAndMethodologyForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import {
  IGetSurveyForUpdateResponsePurposeAndMethodology,
  IGetSurveyForViewResponse,
  UPDATE_GET_SURVEY_ENTITIES
} from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';

export interface ISurveyPurposeAndMethodologyDataProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Purpose and Methodology data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData: React.FC<ISurveyPurposeAndMethodologyDataProps> = (props) => {
  const biohubApi = useBiohubApi();

  const {
    projectForViewData,
    surveyForViewData: { survey_details, survey_purpose_and_methodology },
    codes,
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [
    surveyPurposeAndMethodologyForUpdate,
    setSurveyPurposeAndMethodologyForUpdate
  ] = useState<IGetSurveyForUpdateResponsePurposeAndMethodology | null>(null);
  const [purposeAndMethodologyFormData, setPurposeAndMethodologyFormData] = useState<IPurposeAndMethodologyForm>(
    PurposeAndMethodologyInitialValues
  );

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSurveyPurposeAndMethodologyI18N.editErrorTitle,
    dialogText: EditSurveyPurposeAndMethodologyI18N.editErrorText,
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
    if (!survey_purpose_and_methodology) {
      setSurveyPurposeAndMethodologyForUpdate(null);
      setPurposeAndMethodologyFormData(PurposeAndMethodologyInitialValues);
      setOpenEditDialog(true);
      return;
    }

    let surveyPurposeAndMethodologyResponseData;

    try {
      const response = await biohubApi.survey.getSurveyForUpdate(projectForViewData.id, survey_details?.id, [
        UPDATE_GET_SURVEY_ENTITIES.survey_purpose_and_methodology
      ]);

      if (!response) {
        showErrorDialog({ open: true });
        return;
      }

      surveyPurposeAndMethodologyResponseData = response?.survey_purpose_and_methodology || null;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setSurveyPurposeAndMethodologyForUpdate(surveyPurposeAndMethodologyResponseData);

    setPurposeAndMethodologyFormData({
      intended_outcome_id:
        surveyPurposeAndMethodologyResponseData?.intended_outcome_id ||
        PurposeAndMethodologyInitialValues.intended_outcome_id,
      additional_details:
        surveyPurposeAndMethodologyResponseData?.additional_details ||
        PurposeAndMethodologyInitialValues.additional_details,
      field_method_id:
        surveyPurposeAndMethodologyResponseData?.field_method_id || PurposeAndMethodologyInitialValues.field_method_id,
      ecological_season_id:
        surveyPurposeAndMethodologyResponseData?.ecological_season_id ||
        PurposeAndMethodologyInitialValues.ecological_season_id,
      vantage_code_ids:
        surveyPurposeAndMethodologyResponseData?.vantage_code_ids || PurposeAndMethodologyInitialValues.vantage_code_ids
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IPurposeAndMethodologyForm) => {
    const surveyData = {
      survey_purpose_and_methodology: {
        ...values,
        id: surveyPurposeAndMethodologyForUpdate?.id,
        revision_count: surveyPurposeAndMethodologyForUpdate?.revision_count
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
        dialogTitle={EditSurveyPurposeAndMethodologyI18N.editTitle}
        open={openEditDialog}
        component={{
          element: (
            <PurposeAndMethodologyForm
              intended_outcomes={
                codes?.intended_outcomes || []
              }
              field_methods={
                codes?.field_methods || []
              }
              ecological_seasons={
                codes?.ecological_seasons || []
              }
              vantage_codes={
                codes?.vantage_codes?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              additional_details={survey_purpose_and_methodology.additional_details}
            />
          ),
          initialValues: purposeAndMethodologyFormData,
          validationSchema: PurposeAndMethodologyYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Box>
        <H3ButtonToolbar
          label="Purpose And Methodology Data"
          buttonLabel="Edit"
          buttonTitle="Edit Survey Purpose And Methodology"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
        <dl>
          {!survey_purpose_and_methodology && (
            <Grid container spacing={2}>
              <Grid item>
                <Typography>
                  The data captured in this survey does not have the purpose and methodology section.
                </Typography>
              </Grid>
            </Grid>
          )}
          {survey_purpose_and_methodology && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Intended Outcome
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.intended_outcome_id &&
                    codes?.intended_outcomes?.find(
                      (item: any) => item.id === survey_purpose_and_methodology.intended_outcome_id
                    )?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Additional Details
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.additional_details}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Field Method
                </Typography>

                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.field_method_id &&
                    codes?.field_methods?.find(
                      (item: any) => item.id === survey_purpose_and_methodology.field_method_id
                    )?.name}
                </Typography>
                <Typography component="dd" variant="body1"></Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Ecological Season
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.ecological_season_id &&
                    codes?.ecological_seasons?.find(
                      (item: any) => item.id === survey_purpose_and_methodology.ecological_season_id
                    )?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Vantage Code
                </Typography>
                {survey_purpose_and_methodology.vantage_code_ids?.map((vc_id: number, index: number) => {
                  return (
                    <Typography component="dd" variant="body1" key={index}>
                      {codes?.vantage_codes?.find((item: any) => item.id === vc_id)?.name}
                    </Typography>
                  );
                })}
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  );
};

export default SurveyPurposeAndMethodologyData;
