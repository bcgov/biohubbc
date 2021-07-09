import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema,
  IGeneralInformationForm
} from 'features/surveys/components/GeneralInformationForm';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import {
  IGetSurveyForViewResponse,
  IGetSurveyForUpdateResponseDetails,
  UPDATE_GET_SURVEY_ENTITIES,
  SurveyPermitNumbers
} from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { APIError } from 'hooks/api/useAxios';
import EditDialog from 'components/dialog/EditDialog';
import { EditSurveyGeneralInformationI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import moment from 'moment';
import yup from 'utils/YupSchema';

export interface ISurveyGeneralInformationProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
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
    projectForViewData,
    surveyForViewData: { survey_details },
    codes,
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [surveyDataForUpdate, setSurveyDataForUpdate] = useState<IGetSurveyForUpdateResponseDetails>(null as any);
  const [generalInformationFormData, setGeneralInformationFormData] = useState<IGeneralInformationForm>(
    GeneralInformationInitialValues
  );
  const [permitNumbers, setPermitNumbers] = useState<SurveyPermitNumbers[]>([]);

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
    let surveyDetailsResponseData;
    let surveyPermitNumbersResponseData;

    try {
      const response = await biohubApi.survey.getSurveyForUpdate(projectForViewData.id, survey_details?.id, [
        UPDATE_GET_SURVEY_ENTITIES.survey_details
      ]);

      const permitNumbersResponse = await biohubApi.survey.getSurveyPermitNumbers(projectForViewData.id);

      if (!response?.survey_details || !permitNumbersResponse) {
        showErrorDialog({ open: true });
        return;
      }

      surveyPermitNumbersResponseData = permitNumbersResponse;
      surveyDetailsResponseData = response.survey_details;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    console.log('surveyDetailsResponseData', surveyDetailsResponseData);

    setPermitNumbers(surveyPermitNumbersResponseData);
    setSurveyDataForUpdate(surveyDetailsResponseData);
    setGeneralInformationFormData({
      ...surveyDetailsResponseData,
      start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, surveyDetailsResponseData.start_date),
      end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, surveyDetailsResponseData.end_date)
    });
    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IGeneralInformationForm) => {
    try {
      if (surveyDataForUpdate) {
        const surveyDetailsData = {
          survey_details: {
            ...values,
            id: surveyDataForUpdate.id,
            revision_count: surveyDataForUpdate.revision_count,
            survey_area_name: surveyDataForUpdate.survey_area_name,
            geometry: surveyDataForUpdate.geometry
          }
        };

        await biohubApi.survey.updateSurvey(projectForViewData.id, surveyDataForUpdate.id, surveyDetailsData);
      }
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
                codes?.species?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              permit_numbers={
                permitNumbers?.map((item) => {
                  return { value: item.number, label: item.number };
                }) || []
              }
              projectStartDate={projectForViewData.project.start_date}
              projectEndDate={projectForViewData.project.end_date}
            />
          ),
          initialValues: generalInformationFormData,
          validationSchema: GeneralInformationYupSchema({
            start_date: yup
              .string()
              .isValidDateString()
              .isAfterDate(
                projectForViewData.project.start_date,
                DATE_FORMAT.ShortDateFormat,
                `Survey start date cannot be before project start date ${getFormattedDate(
                  DATE_FORMAT.ShortMediumDateFormat,
                  projectForViewData.project.start_date
                )}`
              )
              .isAfterDate(
                moment(DATE_LIMIT.min).toISOString(),
                DATE_FORMAT.ShortDateFormat,
                `Survey start date cannot be before ${getFormattedDate(
                  DATE_FORMAT.ShortMediumDateFormat,
                  DATE_LIMIT.min
                )}`
              )
              .required('Required'),
            end_date: yup
              .string()
              .isValidDateString()
              .isEndDateAfterStartDate('start_date')
              .isBeforeDate(
                projectForViewData.project.end_date,
                DATE_FORMAT.ShortDateFormat,
                `Survey end date cannot be after project end date ${getFormattedDate(
                  DATE_FORMAT.ShortMediumDateFormat,
                  projectForViewData.project.end_date
                )}`
              )
              .isBeforeDate(
                moment(DATE_LIMIT.max).toISOString(),
                DATE_FORMAT.ShortDateFormat,
                `Survey end date cannot be after ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.max)}`
              )
          })
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">General Information</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit Survey General Information"
            aria-label="Edit Survey General Information"
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
                {survey_details.survey_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Timeline
              </Typography>
              <Typography component="dd" variant="body1">
                {survey_details.end_date ? (
                  <>
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat2,
                      survey_details.start_date,
                      survey_details.end_date
                    )}
                  </>
                ) : (
                  <>
                    <span>Start Date:</span>{' '}
                    {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat2, survey_details.start_date)}
                  </>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Lead
              </Typography>
              <Typography component="dd" variant="body1">
                {survey_details.biologist_first_name} {survey_details.biologist_last_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Focal Species
              </Typography>
              {survey_details.focal_species.map((focalSpecies: string, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {focalSpecies}
                  </Typography>
                );
              })}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Anciliary Species
              </Typography>
              {survey_details.ancillary_species?.map((ancillarySpecies: string, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {ancillarySpecies}
                  </Typography>
                );
              })}
              {survey_details.ancillary_species.length <= 0 && (
                <Typography component="dd" variant="body1">
                  No Ancilliary Species
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Permit Number
              </Typography>
              <Typography component="dd" variant="body1">
                {survey_details.permit_number || 'No Permit Number'}
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
                <Typography>{survey_details.survey_purpose}</Typography>
              </Box>
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
