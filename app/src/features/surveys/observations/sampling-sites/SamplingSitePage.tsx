import { Button, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/system';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SamplingSiteMethodYupSchema } from 'features/surveys/components/CreateSamplingMethod';
import { ISurveySampleMethodData } from 'features/surveys/components/MethodForm';
import SamplingSiteMethodForm from 'features/surveys/components/SamplingMethodForm';
import SamplingSiteImportForm from 'features/surveys/components/SurveySamplingSiteImportForm';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useRef, useState } from 'react';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from './SamplingSiteHeader';

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

export interface ICreateSamplingSiteRequest {
  name: string;
  description: string;
  survey_id: number;
  survey_sample_sites: Feature[]; // extracted list from shape files
  methods: ISurveySampleMethodData[];
}

const SamplingSitePage = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const samplingSiteYupSchema = yup.object({
    name: yup.string().default(''),
    description: yup.string().default(''),
    survey_sample_sites: yup.array(yup.object({})),
    methods: yup
      .array(yup.object().concat(SamplingSiteMethodYupSchema))
      .min(1, 'At least 1 Sampling Method is required')
  });

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: 'Error Creating Sampling Site(s)',
      dialogText:
        'An error has occurred while attempting to create your sampling site, please try again. If the error persists, please contact your system administrator.',
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmit = async (values: ICreateSamplingSiteRequest) => {
    try {
      await biohubApi.samplingSite.createSamplingSites(surveyContext.projectId, surveyContext.surveyId, values);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Sampling Site(s)',
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
      <SamplingSiteHeader />
      <Box display="flex" flex="1 1 auto">
        <Container maxWidth="xl">
          <Formik
            innerRef={formikRef}
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
            onSubmit={handleSubmit}>
            <Box p={5} component={Paper} display="block">
              <HorizontalSplitFormComponent
                title="Site Boundaries"
                summary="Drag files here or Browse Files Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem"
                component={<SamplingSiteImportForm />}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <HorizontalSplitFormComponent
                title="Sampling Methods"
                summary="Specify sampling methods used to collect data at each sampling site."
                component={<SamplingSiteMethodForm />}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    formikRef.current?.submitForm();
                  }}
                  className={classes.actionButton}>
                  Save and Exit
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // TODO: Go back to Manage Observations page
                    console.log('Cancel Button');
                  }}
                  className={classes.actionButton}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Formik>
        </Container>
      </Box>
    </Box>
  );
};

export default SamplingSitePage;
