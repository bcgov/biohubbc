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
import { AnimalFormContainer } from 'features/surveys/animals/animal-form/components/AnimalFormContainer';
import { AnimalSex } from 'features/surveys/view/survey-animals/animal';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import {
  useAnimalPageContext,
  useDialogContext,
  useProjectContext,
  useSurveyContext,
  useTaxonomyContext
} from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Returns the page for editing an existing animal (critter) within a Survey
 *
 * @return {*}
 */
export const EditAnimalPage = () => {
  const history = useHistory();

  const critterbaseApi = useCritterbaseApi();
  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();
  const taxonomyContext = useTaxonomyContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSaving, setIsSaving] = useState(false);

  const formikRef = useRef<FormikProps<ICreateEditAnimalRequest>>(null);

  const { projectId, surveyId } = surveyContext;

  // Update the selected animal based on url Params
  if (surveyCritterId) {
    animalPageContext.setSelectedAnimalFromSurveyCritterId(surveyCritterId);
  }

  const critter = animalPageContext.critterDataLoader.data;

  useEffect(() => {
    if (!critter?.itis_tsn) {
      return;
    }

    taxonomyContext.getCachedSpeciesTaxonomyById(critter.itis_tsn);
  }, [critter?.itis_tsn, taxonomyContext]);

  // Loading spinner if the data later hasn't updated to the selected animal yet
  if (!critter || animalPageContext.selectedAnimal?.critterbase_critter_id !== critter.critterbase_critter_id) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleCancel = () => {
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals`);
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
        critter_id: critter.critterbase_critter_id,
        itis_tsn: values.species.tsn,
        wlh_id: values.wildlife_health_id,
        animal_id: values.nickname,
        sex: AnimalSex.UNKNOWN,
        critter_comment: values.critter_comment
      });

      // Find collection units to delete
      const collectionsForDelete = critter.collection_units.filter(
        (existing) =>
          !values.ecological_units.some(
            (incoming) => incoming.collection_category_id === existing.collection_category_id
          )
      );

      // Patch collection units in bulk
      const bulkResponse = await critterbaseApi.critters.bulkUpdate({
        collections: [
          ...values.ecological_units
            .filter((unit) => unit.collection_category_id !== null && unit.collection_unit_id !== null)
            .map((unit) => ({
              critter_collection_unit_id: unit.critter_collection_unit_id,
              critter_id: critter.critterbase_critter_id,
              collection_category_id: unit.collection_category_id as string,
              collection_unit_id: unit.collection_unit_id as string
            })),
          ...collectionsForDelete.map((collection) => ({
            ...collection,
            critter_id: critter.critterbase_critter_id,
            _delete: true
          }))
        ]
      });

      if (!response || !bulkResponse) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      // Refresh the context, so the next page loads with the latest data
      surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      animalPageContext.critterDataLoader.refresh(critter.critterbase_critter_id);

      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals`, SKIP_CONFIRMATION_DIALOG);
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
      <Prompt when={true} message={locationChangeInterceptor} />
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
          <AnimalFormContainer
            initialAnimalData={
              {
                critter_id: critter.critterbase_critter_id,
                nickname: critter.animal_id,
                species: {
                  ...taxonomyContext.getCachedSpeciesTaxonomyById(critter.itis_tsn),
                  tsn: critter.itis_tsn,
                  scientificName: critter.itis_scientific_name
                },
                ecological_units: critter.collection_units.map((unit) => ({ ...unit, critter_id: critter.critterbase_critter_id })),
                wildlife_health_id: critter.wlh_id,
                critter_comment: critter.critter_comment
              } as ICreateEditAnimalRequest
            }
            handleSubmit={handleSubmit}
            formikRef={formikRef}
            isEdit={true}
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
