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
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { StringBoolean } from 'types/misc';

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
    surveyForViewData: {
      surveyData: { survey_details, purpose_and_methodology }
    },
    codes,
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  // const [surveyDataForUpdate, setSurveyDataForUpdate] = useState<IGetSurveyForViewResponse>(null as any);
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
    if (!purpose_and_methodology) {
      setPurposeAndMethodologyFormData(PurposeAndMethodologyInitialValues);
      setOpenEditDialog(true);
      return;
    }

    let surveyResponseData;

    try {
      const surveyResponse = await biohubApi.survey.getSurveyForView(projectForViewData.id, survey_details.id);

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

    setPurposeAndMethodologyFormData({
      purpose_and_methodology: {
        intended_outcome_id:
          surveyResponseData.surveyData.purpose_and_methodology?.intended_outcome_id ||
          PurposeAndMethodologyInitialValues.purpose_and_methodology.intended_outcome_id,
        additional_details:
          surveyResponseData.surveyData.purpose_and_methodology?.additional_details ||
          PurposeAndMethodologyInitialValues.purpose_and_methodology.additional_details,
        field_method_id:
          surveyResponseData.surveyData.purpose_and_methodology?.field_method_id ||
          PurposeAndMethodologyInitialValues.purpose_and_methodology.field_method_id,
        ecological_season_id:
          surveyResponseData.surveyData.purpose_and_methodology?.ecological_season_id ||
          PurposeAndMethodologyInitialValues.purpose_and_methodology.ecological_season_id,
        vantage_code_ids:
          surveyResponseData.surveyData.purpose_and_methodology?.vantage_code_ids ||
          PurposeAndMethodologyInitialValues.purpose_and_methodology.vantage_code_ids,
        surveyed_all_areas:
          surveyResponseData.surveyData.purpose_and_methodology?.surveyed_all_areas ||
          (('' as unknown) as StringBoolean)
      }
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IPurposeAndMethodologyForm) => {
    const surveyData = {
      purpose_and_methodology: {
        ...values.purpose_and_methodology,
        revision_count: survey_details.revision_count
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
                codes?.intended_outcomes?.map((item) => {
                  return { value: item.id, label: item.name, subText: item.description };
                }) || []
              }
              field_methods={
                codes?.field_methods?.map((item) => {
                  return { value: item.id, label: item.name, subText: item.description };
                }) || []
              }
              ecological_seasons={
                codes?.ecological_seasons?.map((item) => {
                  return { value: item.id, label: item.name, subText: item.description };
                }) || []
              }
              vantage_codes={
                codes?.vantage_codes?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
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
          label="Purpose and Methodology Data"
          buttonLabel="Edit"
          buttonTitle="Edit Survey Purpose and Methodology"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
        <dl>
          {!purpose_and_methodology && (
            <Grid container spacing={2}>
              <Grid item>
                <Typography>
                  The data captured in this survey does not have the purpose and methodology section.
                </Typography>
              </Grid>
            </Grid>
          )}
          {purpose_and_methodology && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Intended Outcome
                </Typography>
                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.intended_outcome_id &&
                    codes?.intended_outcomes?.find(
                      (item: any) => item.id === purpose_and_methodology.intended_outcome_id
                    )?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Additional Details
                </Typography>
                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.additional_details}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Field Method
                </Typography>

                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.field_method_id &&
                    codes?.field_methods?.find((item: any) => item.id === purpose_and_methodology.field_method_id)
                      ?.name}
                </Typography>
                <Typography component="dd" variant="body1"></Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Ecological Season
                </Typography>
                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.ecological_season_id &&
                    codes?.ecological_seasons?.find(
                      (item: any) => item.id === purpose_and_methodology.ecological_season_id
                    )?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Vantage Code
                </Typography>
                {purpose_and_methodology.vantage_code_ids?.map((vc_id: number, index: number) => {
                  return (
                    <Typography component="dd" variant="body1" key={index}>
                      {codes?.vantage_codes?.find((item: any) => item.id === vc_id)?.name}
                    </Typography>
                  );
                })}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Surveyed all areas?
                </Typography>
                <Typography component="dd" variant="body1">
                  {(purpose_and_methodology.surveyed_all_areas === 'true' && 'Yes - all areas were surveyed') ||
                    (purpose_and_methodology.surveyed_all_areas === 'false' && 'No - only some areas were surveyed')}
                </Typography>
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  );
};

export default SurveyPurposeAndMethodologyData;
