import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { Container } from '@mui/system';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SurveyContext } from 'contexts/surveyContext';
import { ISurveySampleMethodData, SamplingSiteMethodYupSchema } from 'features/surveys/components/MethodForm';
import { FormikProps } from 'formik';
import { Feature } from 'geojson';
import { useContext } from 'react';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SampleMethodEditForm from './SampleMethodEditForm';
import SampleSiteGeneralInformationForm from './SampleSiteGeneralInformationForm';
import SurveySamplingSiteEditForm from './SurveySampleSiteEditForm';

export interface IEditSamplingSiteRequest {
  sampleSite: {
    name: string;
    description: string;
    survey_id: number;
    survey_sample_sites: Feature[]; // extracted list from shape files (used for formik loading)
    geojson?: Feature; // geojson object from map (used for sending to api)
    methods: ISurveySampleMethodData[];
  };
}

export interface ISampleSiteEditForm {
  handleSubmit: (formikData: IEditSamplingSiteRequest) => void;
  formikRef: React.RefObject<FormikProps<IEditSamplingSiteRequest>>;
  isSubmitting: boolean;
}

export const samplingSiteYupSchema = yup.object({
  sampleSite: yup.object({
    name: yup.string().default(''),
    description: yup.string().default('').nullable(),
    survey_sample_sites: yup
      .array(yup.object())
      .min(1, 'At least one sampling site location is required')
      .max(1, 'Only one location is permitted per sampling site'),
    methods: yup
      .array(yup.object().concat(SamplingSiteMethodYupSchema))
      .min(1, 'At least one sampling method is required')
  })
});

const SampleSiteEditForm: React.FC<ISampleSiteEditForm> = (props) => {
  const history = useHistory();
  const surveyContext = useContext(SurveyContext);

  return (
    <>
      <Container maxWidth="xl">
        <Box py={3}>
          <Paper
            elevation={0}
            sx={{
              p: 5,
              '& hr': {
                height: '1px',
                mt: 5,
                mb: 5
              }
            }}>
            <HorizontalSplitFormComponent
              title="General Information"
              summary="Specify the name and description for this sampling site"
              component={<SampleSiteGeneralInformationForm />}></HorizontalSplitFormComponent>

            <Divider />

            <HorizontalSplitFormComponent
              title="Site Location"
              summary="Import or draw sampling site locations used for this survey."
              component={<SurveySamplingSiteEditForm />}></HorizontalSplitFormComponent>

            <Divider />

            <HorizontalSplitFormComponent
              title="Sampling Methods"
              summary="Specify sampling methods that were used to collect data."
              component={<SampleMethodEditForm name={'sampleSite.methods'} />}></HorizontalSplitFormComponent>

            <Divider />

            <Box display="flex" justifyContent="flex-end">
              <Box
                sx={{
                  '& button': {
                    minWidth: '6rem'
                  },
                  '& button + button': {
                    ml: 1
                  }
                }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={props.isSubmitting}
                  onClick={() => {
                    props.formikRef.current?.submitForm();
                  }}>
                  Save and Exit
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    history.push(
                      `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`
                    );
                  }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default SampleSiteEditForm;
