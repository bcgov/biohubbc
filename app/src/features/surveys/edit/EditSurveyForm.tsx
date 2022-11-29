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
import { ICreateSurveyRequest, IGetSurveyForEdit } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useContext, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
import yup from 'utils/YupSchema';
import AgreementsForm, { AgreementsInitialValues, AgreementsYupSchema } from '../components/AgreementsForm';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from '../components/GeneralInformationForm';
import ProprietaryDataForm, {
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema
} from '../components/ProprietaryDataForm';
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyInitialValues,
  PurposeAndMethodologyYupSchema
} from '../components/PurposeAndMethodologyForm';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from '../components/StudyAreaForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
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
  handleSubmit: (formikData: IGetSurveyForEdit) => void;
  handleCancel: () => void;
  formikRef: React.RefObject<FormikProps<IGetSurveyForEdit>>;
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

  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState<ICreateSurveyRequest>({
    ...GeneralInformationInitialValues,
    ...PurposeAndMethodologyInitialValues,
    ...StudyAreaInitialValues,
    ...ProprietaryDataInitialValues,
    ...AgreementsInitialValues
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
  const surveyYupSchemas = GeneralInformationYupSchema({
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
  })
    .concat(StudyAreaYupSchema)
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(AgreementsYupSchema);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${props.projectData?.id}/surveys`);
  };

  return (
    <Box p={5} component={Paper} display="block">
      <Formik
        innerRef={formikRef}
        initialValues={(surveyInitialValues as unknown) as IGetSurveyForEdit}
        validationSchema={surveyYupSchemas}
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
              onClick={() => formikRef.current?.submitForm()}
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
