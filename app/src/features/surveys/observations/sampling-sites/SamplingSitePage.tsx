import { Button, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/system';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SurveyContext } from 'contexts/surveyContext';
import SamplingSiteImportForm from 'features/surveys/components/SurveySamplingSiteImportForm';
import { Formik, FormikProps } from 'formik';
import { useContext, useRef, useState } from 'react';
import yup from 'utils/YupSchema';

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

const SamplingSitePage = () => {
  const classes = useStyles();
  const surveyContext = useContext(SurveyContext);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const samplingSiteYupSchema = yup.object({
    sites: yup.array(yup.object({}))
  });

  return (
    <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
      {/* HEADER FOR SITE SAMPLING */}
      <>
        <Paper
          square
          sx={{
            pt: 3,
            pb: 3.5,
            px: 3
          }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 1,
              fontSize: '14px'
            }}>
            <Link underline="hover" href="#">
              {surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Manage Survey Observations
            </Link>
            <Typography color="text.secondary" variant="body2">
              New Sampling Site
            </Typography>
          </Breadcrumbs>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              ml: '-2px'
            }}>
            New Sampling Site
          </Typography>
        </Paper>
      </>
      <Box display="flex" flex="1 1 auto">
        <Container maxWidth="xl">
          <Formik
            innerRef={formikRef}
            initialValues={{ sites: [] }}
            validationSchema={samplingSiteYupSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={() => console.log('SUBMIT ME PLEASE')}>
            <Box p={5} component={Paper} display="block">
              <HorizontalSplitFormComponent
                title="Site Boundaries"
                summary="Drag files here or Browse Files Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem"
                component={<SamplingSiteImportForm />}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <HorizontalSplitFormComponent
                title="Sampling Methods"
                summary="Specify sampling methods used to collect data at each sampling site."
                component={<>Specify Sampling Methods</>}></HorizontalSplitFormComponent>

              <Divider className={classes.sectionDivider} />

              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={() => console.log('Submit Form')}
                  className={classes.actionButton}>
                  Save and Exit
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => console.log('Cancel Button')}
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
