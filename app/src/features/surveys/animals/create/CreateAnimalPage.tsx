import LoadingButton from '@mui/lab/LoadingButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { CreateAnimalI18N } from 'constants/i18n';
import { AnimalSex } from 'features/surveys/view/survey-animals/animal';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import AnimalForm from './form/AnimalForm';

export const defaultAnimalDataFormValues: ICreateEditAnimalRequest = {
  nickname: '',
  species: null,
  ecological_units: [],
  wildlife_health_id: '',
  critter_comment: null
};

/**
 * Returns the page for creatig new animals (critters) and inserting them into the current survey
 *
 * @returns
 */
const CreateAnimalPage = () => {
  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const history = useHistory();

  const formikRef = useRef<FormikProps<ICreateEditAnimalRequest>>(null);

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const { projectId, surveyId } = surveyContext;

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals`);
  };

  const defaultCancelDialogProps = {
    dialogTitle: CreateAnimalI18N.cancelTitle,
    dialogText: CreateAnimalI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/projects/${projectId}`);
    }
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateAnimalI18N.createErrorTitle,
      dialogText: CreateAnimalI18N.createErrorText,
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

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  /**
   * Creates an animal
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateEditAnimalRequest) => {
    setIsSaving(true);

    try {
      if (!values.species) {
        return;
      }

      const response = await biohubApi.survey.createCritterAndAddToSurvey(projectId, surveyId, {
        critter_id: undefined,
        wlh_id: undefined,
        animal_id: values.nickname,
        sex: AnimalSex.UNKNOWN,
        itis_tsn: values.species.tsn
      });

      // Insert collection units through bulk update
      const bulkResponse = await critterbaseApi.critters.bulkCreateCritter({
        critter: response,
        collections: values.ecological_units
          .filter((unit) => unit.collection_category_id !== null && unit.collection_unit_id !== null)
          .map((unit) => ({
            critter_collection_unit_id: undefined,
            critter_id: response.critter_id,
            collection_category_id: unit.collection_category_id as string,
            collection_unit_id: unit.collection_unit_id as string
          }))
      });

      console.log(bulkResponse);

      if (!response) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      // Refresh the context, so the next page loads with the latest data
      surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals`);
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Survey',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <PageHeader
        title="Create New Animal"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/`}>
              {projectContext.projectDataLoader.data?.projectData.project.project_name}
            </Link>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/surveys/${surveyId}`}>
              {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
            </Link>
            <Link
              component={RouterLink}
              underline="hover"
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals`}>
              Manage Animals
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Create New Animal
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
            <LoadingButton
              loading={isSaving}
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}>
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <AnimalForm
            initialAnimalData={defaultAnimalDataFormValues}
            handleSubmit={(formikData) => handleSubmit(formikData as ICreateEditAnimalRequest)}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => {
                formikRef.current?.submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} variant="outlined" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateAnimalPage;
