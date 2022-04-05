import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyPurposeAndMethodologyI18N } from 'constants/i18n';
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyInitialValues,
  IPurposeAndMethodologyForm,
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
 * Proprietary data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData: React.FC<ISurveyPurposeAndMethodologyDataProps> = (props) => {
  const biohubApi = useBiohubApi();

  const {
    projectForViewData,
    surveyForViewData: { survey_details, survey_purpose_and_methodology },
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [
    surveyDataForUpdate,
    setSurveyDataForUpdate
  ] = useState<IGetSurveyForUpdateResponsePurposeAndMethodology | null>(null);

  const [purposeAndMethodologyFormData, setPurposeAndMethodologyFormData] = useState<IPurposeAndMethodologyForm>(
    PurposeAndMethodologyInitialValues
  );

  const intended_outcomes = [
    { id: 1, name: 'intended outcome 1' },
    { id: 2, name: 'intended outcome 2' },
    { id: 3, name: 'intended outcome 3' }
  ];

  const ecological_seasons = [
    { id: 1, name: 'ecological season 1' },
    { id: 2, name: 'ecological season 2' },
    { id: 3, name: 'ecological season 3' }
  ];

  const vantage_codes = [
    { id: 1, name: 'vantage code 1' },
    { id: 2, name: 'vantage code 2' },
    { id: 3, name: 'vantage code 3' }
  ];

  const field_methods = [
    { id: 1, name: 'method 1' },
    { id: 2, name: 'method 2' },
    { id: 3, name: 'method 3' }
  ];

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
      setSurveyDataForUpdate(null);
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

    setSurveyDataForUpdate(surveyPurposeAndMethodologyResponseData);

    setPurposeAndMethodologyFormData({
      intended_outcome:
        surveyPurposeAndMethodologyResponseData?.intended_outcome ||
        PurposeAndMethodologyInitialValues.intended_outcome,
      additional_details:
        surveyPurposeAndMethodologyResponseData?.additional_details ||
        PurposeAndMethodologyInitialValues.additional_details,
      field_method:
        surveyPurposeAndMethodologyResponseData?.field_method || PurposeAndMethodologyInitialValues.field_method,
      ecological_season:
        surveyPurposeAndMethodologyResponseData?.ecological_season ||
        PurposeAndMethodologyInitialValues.ecological_season,
      vantage_codes:
        surveyPurposeAndMethodologyResponseData?.vantage_codes || PurposeAndMethodologyInitialValues.vantage_codes
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IPurposeAndMethodologyForm) => {
    const surveyData = {
      survey_purpose_and_methodology: {
        ...values,
        id: surveyDataForUpdate?.id,
        revision_count: surveyDataForUpdate?.revision_count
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
                intended_outcomes.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              field_methods={
                field_methods.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              ecological_seasons={
                ecological_seasons.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              vantage_codes={
                vantage_codes.map((item) => {
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
          label="Proprietary Data"
          buttonLabel="Edit"
          buttonTitle="Edit Survey Proprietor"
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
                  Proprietor Name
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.intended_outcome}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Data Category
                </Typography>
                <Typography component="dd" variant="body1">
                  {'put the additional comments in here'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  DISA Required
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.field_method}
                </Typography>
              </Grid>
              <Grid item>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Category Rationale
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.ecological_season}
                </Typography>
              </Grid>

              <Grid item>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Category Rationale
                </Typography>
                <Typography component="dd" variant="body1">
                  {survey_purpose_and_methodology.vantage_codes}
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
