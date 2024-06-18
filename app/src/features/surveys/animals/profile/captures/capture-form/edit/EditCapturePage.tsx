import LoadingButton from '@mui/lab/LoadingButton';
import { CircularProgress } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { EditCaptureI18N } from 'constants/i18n';
import { AnimalCaptureForm } from 'features/surveys/animals/profile/captures/capture-form/components/AnimalCaptureForm';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { IEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { formatCritterDetailsForBulkUpdate, formatLocation } from './utils';

/**
 * Page for editing an existing animal capture record.
 *
 * @return {*}
 */
export const EditCapturePage = () => {
  const history = useHistory();

  const critterbaseApi = useCritterbaseApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const urlParams: Record<string, string | number | undefined> = useParams();

  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);
  const captureId: string | undefined = String(urlParams['capture_id']);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSaving, setIsSaving] = useState(false);

  const formikRef = useRef<FormikProps<IEditCaptureRequest>>(null);

  const { projectId, surveyId } = surveyContext;

  const critter = animalPageContext.critterDataLoader.data;

  const captureDataLoader = useDataLoader(() => critterbaseApi.capture.getCapture(captureId));

  useEffect(() => {
    captureDataLoader.load();
  }, [captureDataLoader]);

  const capture = captureDataLoader.data;

  // If the user has refreshed the page and cleared the context, or come to this page externally from a link, use the
  // url params to set the selected animal in the context. The context then requests critter data from Critterbase.
  useEffect(() => {
    if (animalPageContext.selectedAnimal || !surveyCritterId) {
      return;
    }

    animalPageContext.setSelectedAnimalFromSurveyCritterId(surveyCritterId);
  }, [animalPageContext, surveyCritterId]);

  if (!capture || !critter) {
    return <CircularProgress size={40} className="pageProgress" />;
  }

  const handleCancel = () => {
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
  };

  /**
   * Creates an Capture
   *
   * @return {*}
   */
  const handleSubmit = async (values: IEditCaptureRequest) => {
    setIsSaving(true);

    try {
      const critterbaseCritterId = animalPageContext.selectedAnimal?.critterbase_critter_id;

      if (!values || !critterbaseCritterId || values.capture.capture_location?.geometry.type !== 'Point') {
        return;
      }

      // Format capture location
      const captureLocation = formatLocation(values.capture.capture_location);

      // If release location is null, use the capture location, otherwise format release location
      const releaseLocation = values.capture.release_location
        ? formatLocation(values.capture.release_location)
        : values.capture.capture_location;

      const {
        qualitativeMeasurementsForDelete,
        quantitativeMeasurementsForDelete,
        markingsForDelete,
        markingsForCreate,
        markingsForUpdate,
        qualitativeMeasurementsForCreate,
        quantitativeMeasurementsForCreate,
        qualitativeMeasurementsForUpdate,
        quantitativeMeasurementsForUpdate
      } = formatCritterDetailsForBulkUpdate(critter, values.markings, values.measurements, values.capture.capture_id);

      // Create new measurements added while editing the capture
      if (
        qualitativeMeasurementsForCreate.length ||
        quantitativeMeasurementsForCreate.length ||
        markingsForCreate.length
      ) {
        await critterbaseApi.critters.bulkCreate({
          qualitative_measurements: qualitativeMeasurementsForCreate,
          quantitative_measurements: quantitativeMeasurementsForCreate,
          markings: markingsForCreate
        });
      }

      // Update existing critter information
      const response = await critterbaseApi.critters.bulkUpdate({
        captures: [
          {
            capture_id: values.capture.capture_id,
            capture_date: values.capture.capture_date,
            capture_time: values.capture.capture_time || undefined,
            release_date: values.capture.release_date || values.capture.capture_date || undefined,
            release_time: values.capture.release_time || values.capture.capture_time || undefined,
            capture_comment: values.capture.capture_comment || undefined,
            release_comment: values.capture.release_comment || undefined,
            capture_location: captureLocation,
            release_location: releaseLocation ?? captureLocation,
            critter_id: critterbaseCritterId
          }
        ],
        markings: [...markingsForUpdate, ...markingsForDelete],
        qualitative_measurements: [...qualitativeMeasurementsForUpdate, ...qualitativeMeasurementsForDelete],
        quantitative_measurements: [...quantitativeMeasurementsForUpdate, ...quantitativeMeasurementsForDelete]
      });

      if (!response) {
        dialogContext.setErrorDialog({
          dialogTitle: EditCaptureI18N.createErrorTitle,
          dialogText: EditCaptureI18N.createErrorText,
          open: true,
          onClose: () => {
            dialogContext.setErrorDialog({ open: false });
          },
          onOk: () => {
            dialogContext.setErrorDialog({ open: false });
          }
        });
        return;
      }

      // Refresh page
      animalPageContext.critterDataLoader.refresh(critterbaseCritterId);

      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`, SKIP_CONFIRMATION_DIALOG);
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        dialogTitle: EditCaptureI18N.createErrorTitle,
        dialogText: EditCaptureI18N.createErrorText,
        dialogErrorDetails: apiError?.errors,
        open: true,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Initial formik values
  const initialFormikValues: IEditCaptureRequest = {
    capture: {
      capture_id: capture.capture_id,
      capture_method_id: capture.capture_method_id ?? '',
      capture_comment: capture.capture_comment ?? '',
      capture_date: capture.capture_date,
      capture_time: capture.capture_time ?? '',
      capture_location: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [capture.capture_location.longitude ?? 0, capture.capture_location.latitude ?? 0]
        },
        properties: {}
      },
      release_location: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [capture.release_location?.longitude ?? 0, capture.release_location?.latitude ?? 0]
        },
        properties: {}
      },
      release_date: capture.release_date ?? '',
      release_time: capture.release_time ?? '',
      release_comment: capture.release_comment ?? ''
    },
    markings:
      critter.markings
        .filter((marking) => marking.capture_id === capture.capture_id)
        .map((marking) => ({
          marking_id: marking.marking_id,
          identifier: marking.identifier,
          comment: marking.comment,
          capture_id: marking.capture_id,
          mortality_id: marking.mortality_id,
          taxon_marking_body_location_id: marking.taxon_marking_body_location_id,
          marking_type_id: marking.marking_type_id,
          primary_colour_id: marking.primary_colour_id,
          secondary_colour_id: marking.secondary_colour_id
        })) ?? [],
    measurements: [
      ...(critter.measurements.qualitative
        .filter((measurement) => measurement.capture_id === capture.capture_id)
        .map((measurement) => ({
          measurement_qualitative_id: measurement.measurement_qualitative_id,
          taxon_measurement_id: measurement.taxon_measurement_id,
          capture_id: measurement.capture_id,
          mortality_id: measurement.mortality_id,
          qualitative_option_id: measurement.qualitative_option_id,
          measurement_comment: measurement.measurement_comment,
          measured_timestamp: measurement.measured_timestamp
        })) ?? []),
      ...(critter.measurements.quantitative
        .filter((measurement) => measurement.capture_id === capture.capture_id)
        .map((measurement) => ({
          measurement_quantitative_id: measurement.measurement_quantitative_id,
          taxon_measurement_id: measurement.taxon_measurement_id,
          capture_id: measurement.capture_id,
          mortality_id: measurement.mortality_id,
          measurement_comment: measurement.measurement_comment,
          measured_timestamp: measurement.measured_timestamp,
          value: measurement.value
        })) ?? [])
    ]
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <PageHeader
        title="Edit Capture"
        breadCrumbJSX={
          critter?.animal_id ? (
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
                Edit Capture
              </Typography>
            </Breadcrumbs>
          ) : (
            <SkeletonHorizontalStack />
          )
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
          <AnimalCaptureForm
            initialCaptureData={initialFormikValues}
            handleSubmit={(formikData) => handleSubmit(formikData)}
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
