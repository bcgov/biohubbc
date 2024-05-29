import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useHistory } from 'react-router';
import TechniqueAttractantsForm from './attractants/TechniqueAttractantsForm';
import TechniqueDetailsForm from './details/TechniqueDetailsForm';
import TechniqueGeneralInformationForm from './general-information/TechniqueGeneralInformationForm';

interface ITechniqueCreateFormProps {
  isSubmitting: boolean;
}

const TechniqueCreateForm = (props: ITechniqueCreateFormProps) => {
  const { isSubmitting } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateTechniqueRequest>();

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
            title="Attractants"
            summary="Enter information about any attractants used to lure species as part of the technique"
            component={<TechniqueAttractantsForm />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Methodology"
            summary="Enter details about the technique"
            component={<TechniqueDetailsForm />}></HorizontalSplitFormComponent>

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
