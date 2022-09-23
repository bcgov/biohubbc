import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
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
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { EditSurveyGeneralInformationI18N } from 'constants/i18n';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema,
  IGeneralInformationForm
} from 'features/surveys/components/GeneralInformationForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import {
  IGetSurveyForViewResponse,
  ISurveyAvailableFundingSources,
  ISurveyFundingSourceForView,
  ISurveyPermits
} from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useState } from 'react';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
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
    surveyForViewData: {
      //surveyData: { survey_details, species, permit, funding }
      surveyData: { survey_details, species, funding }
    },
    refresh
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [generalInformationFormData, setGeneralInformationFormData] = useState<IGeneralInformationForm>(
    GeneralInformationInitialValues
  );
  const [surveyPermits, setSurveyPermits] = useState<ISurveyPermits[]>([]);
  const [surveyFundingSources, setSurveyFundingSources] = useState<ISurveyAvailableFundingSources[]>([]);

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
    let surveyResponseData;
    let surveyPermitsResponseData;
    let surveyFundingSourcesResponseData;

    try {
      const [surveyResponse, surveyPermitsResponse, surveyFundingSourcesResponse] = await Promise.all([
        biohubApi.survey.getSurveyForView(projectForViewData.id, survey_details.id),
        biohubApi.survey.getSurveyPermits(projectForViewData.id),
        biohubApi.survey.getAvailableSurveyFundingSources(projectForViewData.id)
      ]);
      if (!surveyResponse || !surveyPermitsResponse || !surveyFundingSourcesResponse) {
        showErrorDialog({ open: true });
        return;
      }

      surveyFundingSourcesResponseData = surveyFundingSourcesResponse;
      surveyPermitsResponseData = surveyPermitsResponse;
      surveyResponseData = surveyResponse;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    /*
      If a permit number/type already exists for the record we are updating, we need to include it in the
      list of applicable permits for the survey to be associated with
    */
    if (surveyResponseData.surveyData.permit.permit_number && surveyResponseData.surveyData.permit.permit_type) {
      setSurveyPermits([
        {
          id: surveyResponseData.surveyData.permit.id,
          permit_number: surveyResponseData.surveyData.permit.permit_number,
          permit_type: surveyResponseData.surveyData.permit.permit_type
        },
        ...surveyPermitsResponseData
      ]);
    } else {
      setSurveyPermits(surveyPermitsResponseData);
    }

    setSurveyFundingSources(surveyFundingSourcesResponseData);

    setGeneralInformationFormData({
      survey_details: {
        survey_name: surveyResponseData.surveyData.survey_details.survey_name,
        start_date: getFormattedDate(
          DATE_FORMAT.ShortDateFormat,
          surveyResponseData.surveyData.survey_details.start_date
        ),
        end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, surveyResponseData.surveyData.survey_details.end_date),
        biologist_first_name: surveyResponseData.surveyData.survey_details.biologist_first_name,
        biologist_last_name: surveyResponseData.surveyData.survey_details.biologist_last_name
      },
      species: surveyResponseData.surveyData.species,
      permit: surveyResponseData.surveyData.permit,
      funding: {
        funding_sources: surveyResponseData.surveyData.funding.funding_sources.map((item) => item.pfs_id)
      }
    });
    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IGeneralInformationForm) => {
    try {
      const surveyDetailsData = {
        ...values,
        survey_details: {
          ...values.survey_details,
          revision_count: survey_details.revision_count
        }
      };

      await biohubApi.survey.updateSurvey(projectForViewData.id, survey_details.id, surveyDetailsData);
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
              permit_numbers={
                surveyPermits?.map((item) => {
                  return { value: item.permit_number, label: `${item.permit_number} - ${item.permit_type}` };
                }) || []
              }
              funding_sources={
                surveyFundingSources?.map((item) => {
                  return {
                    value: item.id,
                    label: `${
                      props.codes.funding_source.find((fundingCode) => fundingCode.id === item.agency_id)?.name
                    } | ${getFormattedAmount(item.funding_amount)} | ${getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      item.start_date,
                      item.end_date
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
              .isEndDateSameOrAfterStartDate('start_date')
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

              {species.focal_species_names?.map((focalSpecies: string, index: number) => {
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

              {species.ancillary_species_names?.map((ancillarySpecies: string, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {ancillarySpecies}
                  </Typography>
                );
              })}
              {species.ancillary_species_names?.length <= 0 && (
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
        {/* <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(permit.permit_number && (
                <TableRow>
                  <TableCell>{permit.permit_number}</TableCell>
                  <TableCell>{permit.permit_type}</TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={2}>No Permits</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer> */}
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
              {!funding.funding_sources.length && (
                <TableRow>
                  <TableCell colSpan={3}>No Funding Sources</TableCell>
                </TableRow>
              )}
              {funding.funding_sources?.map((fundingSource: ISurveyFundingSourceForView, index: number) => {
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
