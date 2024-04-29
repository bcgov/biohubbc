import LoadingButton from '@mui/lab/LoadingButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { EditAnimalI18N } from 'constants/i18n';
import { AnimalSex } from 'features/surveys/view/survey-animals/animal';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import AnimalForm from '../create/form/AnimalForm';

const EditAnimalPage = () => {
  const critterbaseApi = useCritterbaseApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const history = useHistory();

  const formikRef = useRef<FormikProps<ICreateEditAnimalRequest>>(null);

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const { projectId, surveyId } = surveyContext;
  const critter = animalPageContext.critterDataLoader.data;

  if (!animalPageContext.selectedAnimal) {
    animalPageContext.setSelectedAnimalFromSurveyCritterId(surveyCritterId);
  }

  if (!critter) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const initialAnimalData = {
    nickname: critter.animal_id,
    species: { tsn: critter.itis_tsn, scientificName: critter.itis_scientific_name, commonName: '' },
    ecological_units: [],
    description: '',
    wildlife_health_id: critter.wlh_id
  } as ICreateEditAnimalRequest;

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}`);
  };

  const defaultCancelDialogProps = {
    dialogTitle: EditAnimalI18N.cancelTitle,
    dialogText: EditAnimalI18N.cancelText,
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
      dialogTitle: EditAnimalI18N.createErrorTitle,
      dialogText: EditAnimalI18N.createErrorText,
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

      const response = await critterbaseApi.critters.updateCritter({
        critter_id: critter.critter_id,
        wlh_id: values.wildlife_health_id,
        animal_id: values.nickname,
        sex: AnimalSex.MALE,
        itis_tsn: values.species.tsn
      });

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
        title="Edit Animal"
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
            <Link
              component={RouterLink}
              underline="hover"
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`}>
              {critter.animal_id}
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Edit Animal
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
            initialAnimalData={initialAnimalData}
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

export default EditAnimalPage;
