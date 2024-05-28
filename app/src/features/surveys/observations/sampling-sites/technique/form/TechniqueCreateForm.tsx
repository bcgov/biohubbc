import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useHistory } from 'react-router';
import TechniqueGeneralInformationForm from './general-information/TechniqueGeneralInformationForm';
import TechniqueAttractantsForm from './attractants/TechniqueAttractantsForm';

interface ITechniqueCreateFormProps {
  isSubmitting: boolean;
}

const TechniqueCreateForm = (props: ITechniqueCreateFormProps) => {
  const { isSubmitting } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateSamplingSiteRequest>();

  const surveyContext = useSurveyContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent
            title="General Information"
            summary="Enter information about the technique"
            component={<TechniqueGeneralInformationForm />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="General Information"
            summary="Enter information about the technique"
            component={<TechniqueAttractantsForm />}></HorizontalSplitFormComponent>

          <Divider />

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                submitForm();
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
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default TechniqueCreateForm;
