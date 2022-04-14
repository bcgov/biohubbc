import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
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
  SurveyPermits,
  SurveyFundingSources,
  ISurveyFundingSourceForView
} from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
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
  const [surveyPermits, setSurveyPermits] = useState<SurveyPermits[]>([]);
  const [surveyFundingSources, setSurveyFundingSources] = useState<SurveyFundingSources[]>([]);

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
    let surveyPermitsResponseData;
    let surveyFundingSourcesResponseData;

    try {
      const [surveyForUpdateResponse, surveyPermitsResponse, surveyFundingSourcesResponse] = await Promise.all([
        biohubApi.survey.getSurveyForUpdate(projectForViewData.id, survey_details?.id, [
          UPDATE_GET_SURVEY_ENTITIES.survey_details
        ]),
        biohubApi.survey.getSurveyPermits(projectForViewData.id),
        biohubApi.survey.getSurveyFundingSources(projectForViewData.id)
      ]);

      if (!surveyForUpdateResponse?.survey_details || !surveyPermitsResponse || !surveyFundingSourcesResponse) {
        showErrorDialog({ open: true });
        return;
      }

      surveyFundingSourcesResponseData = surveyFundingSourcesResponse;
      surveyPermitsResponseData = surveyPermitsResponse;
      surveyDetailsResponseData = surveyForUpdateResponse.survey_details;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    /*
      If a permit number/type already exists for the record we are updating, we need to include it in the
      list of applicable permits for the survey to be associated with
    */
    if (surveyDetailsResponseData.permit_number && surveyDetailsResponseData.permit_type) {
      setSurveyPermits([
        { number: surveyDetailsResponseData.permit_number, type: surveyDetailsResponseData.permit_type },
        ...surveyPermitsResponseData
      ]);
    } else {
      setSurveyPermits(surveyPermitsResponseData);
    }

    setSurveyFundingSources(surveyFundingSourcesResponseData);
    setSurveyDataForUpdate(surveyDetailsResponseData);
    setGeneralInformationFormData({
      ...surveyDetailsResponseData,
      permit_type: '',
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
                surveyPermits?.map((item) => {
                  return { value: item.number, label: `${item.number} - ${item.type}` };
                }) || []
              }
              funding_sources={
                surveyFundingSources?.map((item) => {
                  return {
                    value: item.pfsId,
                    label: `${item.agencyName} | ${getFormattedAmount(item.amount)} | ${getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      item.startDate,
                      item.endDate
                    )}`
                  };
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
        <H3ButtonToolbar
          label="General Information"
          buttonLabel="Edit"
          buttonTitle="Edit General Information"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          buttonProps={{ 'data-testid': 'edit-general-info' }}
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
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
                      DATE_FORMAT.ShortMediumDateFormat,
                      survey_details.start_date,
                      survey_details.end_date
                    )}
                  </>
                ) : (
                  <>
                    <span>Start Date:</span>{' '}
                    {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, survey_details.start_date)}
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
          </Grid>
        </dl>
      </Box>
      <Box mt={2}>
        <H3ButtonToolbar
          label="Permits"
          buttonLabel="Edit"
          buttonTitle="Edit"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{survey_details.permit_number}</TableCell>
                <TableCell>{survey_details.permit_type}</TableCell>
              </TableRow>
            </TableBody>
            {/* <Typography variant="body1">
              {(survey_details.permit_number && `${survey_details.permit_number} - ${survey_details.permit_type}`) || 'No Permit'}
            </Typography> */}
          </Table>
        </TableContainer>
      </Box>
      <Box mt={2}>
        <H3ButtonToolbar
          label="Funding Sources"
          buttonLabel="Edit"
          buttonTitle="Edit"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agency</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Dates</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!survey_details.funding_sources || survey_details.funding_sources.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3}>No Funding Sources</TableCell>
                </TableRow>
              )}
              {survey_details.funding_sources &&
                survey_details.funding_sources?.map((fundingSource: ISurveyFundingSourceForView, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{fundingSource.agency_name}</TableCell>
                      <TableCell>{getFormattedAmount(fundingSource.funding_amount)}</TableCell>
                      <TableCell>
                        {getFormattedDateRangeString(
                          DATE_FORMAT.ShortMediumDateFormat,
                          fundingSource.funding_start_date,
                          fundingSource.funding_end_date
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
