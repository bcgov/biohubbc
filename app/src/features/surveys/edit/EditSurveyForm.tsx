import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { CreateSurveyI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseFundingSource,
  IGetProjectForViewResponse
} from 'interfaces/useProjectApi.interface';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { StringBoolean } from 'types/misc';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
import yup from 'utils/YupSchema';
import AgreementsForm, { AgreementsYupSchema } from '../components/AgreementsForm';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from '../components/GeneralInformationForm';
import ProprietaryDataForm, { ProprietaryDataYupSchema } from '../components/ProprietaryDataForm';
import PurposeAndMethodologyForm, { PurposeAndMethodologyYupSchema } from '../components/PurposeAndMethodologyForm';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from '../components/StudyAreaForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  sectionDivider: {
    height: '1px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  }
}));

export interface IEditSurveyForm {
  codes: IGetAllCodeSetsResponse;
  projectData: IGetProjectForViewResponse;
  surveyFundingSources: IGetProjectForUpdateResponseFundingSource[];
  handleSubmit: (formikData: IEditSurveyRequest) => void;
  handleCancel: () => void;
  formikRef: React.RefObject<FormikProps<IEditSurveyRequest>>;
}

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyForm: React.FC<IEditSurveyForm> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const dialogContext = useContext(DialogContext);

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState<IEditSurveyRequest>({
    ...GeneralInformationInitialValues,
    ...{
      purpose_and_methodology: {
        intended_outcome_id: ('' as unknown) as number,
        additional_details: '',
        field_method_id: ('' as unknown) as number,
        ecological_season_id: ('' as unknown) as number,
        vantage_code_ids: [],
        surveyed_all_areas: ('' as unknown) as StringBoolean
      }
    },
    ...StudyAreaInitialValues,
    ...{
      proprietor: {
        survey_data_proprietary: ('' as unknown) as StringBoolean,
        proprietary_data_category: 0,
        proprietor_name: '',
        first_nations_id: 0,
        category_rationale: '',
        disa_required: ('' as unknown) as StringBoolean
      }
    },
    ...{
      agreements: {
        sedis_procedures_accepted: ('' as unknown) as StringBoolean,
        foippa_requirements_accepted: ('' as unknown) as StringBoolean
      }
    }
  });

  const defaultCancelDialogProps = {
    dialogTitle: CreateSurveyI18N.cancelTitle,
    dialogText: CreateSurveyI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/projects/${props.projectData?.id}/surveys`);
    }
  };

  // Yup schemas for the survey form sections
  const surveyEditYupSchemas = GeneralInformationYupSchema({
    start_date: yup
      .string()
      .isValidDateString()
      .isAfterDate(
        props.projectData?.project.start_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before project start date ${
          props.projectData && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, props.projectData.project.start_date)
        }`
      )
      .isAfterDate(
        moment(DATE_LIMIT.min).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.min)}`
      )
      .required('Start Date is Required'),
    end_date: yup
      .string()
      .isValidDateString()
      .isEndDateSameOrAfterStartDate('start_date')
      .isBeforeDate(
        props.projectData?.project.end_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after project end date ${
          props.projectData && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, props.projectData.project.end_date)
        }`
      )
      .isBeforeDate(
        moment(DATE_LIMIT.max).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.max)}`
      )
      .nullable()
  })
    .concat(StudyAreaYupSchema)
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(AgreementsYupSchema);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${props.projectData?.id}/surveys`);
  };

  console.log('props.formikRef.current?.values', props.formikRef.current?.values);
  return (
    <Box p={5} component={Paper} display="block">
      <Formik
        innerRef={props.formikRef}
        initialValues={surveyInitialValues}
        validationSchema={surveyEditYupSchemas}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={props.handleSubmit}>
        <>
          <ScrollToFormikError fieldOrder={Object.keys(surveyInitialValues)} />

          <HorizontalSplitFormComponent
            title="General Information"
            summary=""
            component={
              <GeneralInformationForm
                funding_sources={
                  props.surveyFundingSources?.map((item) => {
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
                projectStartDate={props.projectData.project.start_date}
                projectEndDate={props.projectData.project.end_date}
              />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Purpose and Methodology"
            summary=""
            component={
              <PurposeAndMethodologyForm
                intended_outcomes={
                  props.codes.intended_outcomes.map((item) => {
                    return { value: item.id, label: item.name, subText: item.description };
                  }) || []
                }
                field_methods={
                  props.codes.field_methods.map((item) => {
                    return { value: item.id, label: item.name, subText: item.description };
                  }) || []
                }
                ecological_seasons={
                  props.codes.ecological_seasons.map((item) => {
                    return { value: item.id, label: item.name, subText: item.description };
                  }) || []
                }
                vantage_codes={
                  props.codes.vantage_codes.map((item) => {
                    return { value: item.id, label: item.name };
                  }) || []
                }
              />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Study Area"
            summary=""
            component={<StudyAreaForm />}></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Proprietary Data"
            summary=""
            component={
              <ProprietaryDataForm
                proprietary_data_category={
                  props.codes.proprietor_type?.map((item) => {
                    return { value: item.id, label: item.name, is_first_nation: item.is_first_nation };
                  }) || []
                }
                first_nations={
                  props.codes.first_nations?.map((item) => {
                    return { value: item.id, label: item.name };
                  }) || []
                }
              />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Agreements"
            summary=""
            component={<AgreementsForm />}></HorizontalSplitFormComponent>
          <Divider className={classes.sectionDivider} />

          <Box p={3} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => props.formikRef.current?.submitForm()}
              className={classes.actionButton}>
              Save and Exit
            </Button>
            <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
              Cancel
            </Button>
          </Box>
        </>
      </Formik>
    </Box>
  );
};

export default EditSurveyForm;
