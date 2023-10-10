import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/system';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SurveyContext } from 'contexts/surveyContext';
import { ISurveySampleMethodData, SamplingSiteMethodYupSchema } from 'features/surveys/components/MethodForm';
import SamplingMethodForm from 'features/surveys/components/SamplingMethodForm';
import SurveySamplingSiteImportForm from 'features/surveys/components/SurveySamplingSiteImportForm';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import { useContext } from 'react';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SampleSiteGeneralInformationForm from './SampleSiteGeneralInformationForm';

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

export interface IEditSamplingSiteRequest {
  name: string;
  description: string;
  survey_id: number;
  survey_sample_sites: Feature[]; // extracted list from shape files
  methods: ISurveySampleMethodData[];
}

export interface ISampleSiteEditForm {
  handleSubmit: (formikData: IEditSamplingSiteRequest) => void;
  formikRef: React.RefObject<FormikProps<IEditSamplingSiteRequest>>;
  isSubmitting: boolean;
}

export const samplingSiteYupSchema = yup.object({
  name: yup.string().default(''),
  description: yup.string().default(''),
  survey_sample_sites: yup.array(yup.object()).min(1, 'At least one sampling site location is required'),
  methods: yup
    .array(yup.object().concat(SamplingSiteMethodYupSchema))
    .min(1, 'At least one sampling method is required')
});

const SampleSiteEditForm: React.FC<ISampleSiteEditForm> = (props) => {
  const classes = useStyles();
  const history = useHistory();

  const surveyContext = useContext(SurveyContext);

  return (
    <>
      <Formik
        innerRef={props.formikRef}
        initialValues={{
          survey_id: surveyContext.surveyId,
          name: '',
          description: '',
          survey_sample_sites: [],
          methods: []
        }}
        validationSchema={samplingSiteYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        enableReinitialize
        onSubmit={props.handleSubmit}>
        <Container maxWidth="xl">
          <Box py={3}>
            <Paper
              elevation={0}
              sx={{
                p: 5
              }}>
              <HorizontalSplitFormComponent
                title="General Information"
                summary="Specify the name and description for this sampling site"
                component={<SampleSiteGeneralInformationForm />}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <HorizontalSplitFormComponent
                title="Site Location"
                summary="Import or draw sampling site locations used for this survey."
                component={<SurveySamplingSiteImportForm />}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <HorizontalSplitFormComponent
                title="Sampling Methods"
                summary="Specify sampling methods that were used to collect data."
                component={<SamplingMethodForm />}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <Box display="flex" justifyContent="flex-end">
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={props.isSubmitting}
                  onClick={() => {
                    props.formikRef.current?.submitForm();
                  }}
                  className={classes.actionButton}>
                  Save and Exit
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    history.push(
                      `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`
                    );
                  }}
                  className={classes.actionButton}>
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Formik>
    </>
  );
};

export default SampleSiteEditForm;
