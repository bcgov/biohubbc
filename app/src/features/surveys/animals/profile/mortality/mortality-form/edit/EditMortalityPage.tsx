import LoadingButton from '@mui/lab/LoadingButton';
import { CircularProgress } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { EditMortalityI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { AnimalMortalityForm } from 'features/surveys/animals/profile/mortality/mortality-form/AnimalMortalityForm';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { formatCritterDetailsForBulkUpdate, formatLocation } from './utils';

/**
 * Returns the page for editing an animal mortality
 *
 * @return {*}
 */
export const EditMortalityPage = () => {
  const history = useHistory();

  const critterbaseApi = useCritterbaseApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const urlParams: Record<string, string | number | undefined> = useParams();

  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);
  const mortalityId: string | undefined = String(urlParams['mortality_id']);

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  const formikRef = useRef<FormikProps<ICreateEditMortalityRequest>>(null);

  const { projectId, surveyId } = surveyContext;

  const critter = animalPageContext.critterDataLoader.data;

  const mortalityDataLoader = useDataLoader(() => critterbaseApi.mortality.getMortality(mortalityId));

  console.log('mortality critter', critter);

  useEffect(() => {
    mortalityDataLoader.load();
  }, [mortalityDataLoader]);

  const mortality = mortalityDataLoader.data;

  console.log('mortality', mortality);

  // If the user has refreshed the page and cleared the context, or come to this page externally from a link, use the
  // url params to set the selected animal in the context. The context then requests critter data from Critterbase.
  useEffect(() => {
    if (animalPageContext.selectedAnimal || !surveyCritterId) {
      return;
    }

    animalPageContext.setSelectedAnimalFromSurveyCritterId(surveyCritterId);
  }, [animalPageContext, surveyCritterId]);

  if (!mortality || !critter) {
    return <CircularProgress size={40} className="pageProgress" />;
  }

  const handleCancel = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: EditMortalityI18N.cancelTitle,
      dialogText: EditMortalityI18N.cancelText,
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
    });
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditMortalityI18N.createErrorTitle,
      dialogText: EditMortalityI18N.createErrorText,
      open: true,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps
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
        dialogTitle: EditMortalityI18N.cancelTitle,
        dialogText: EditMortalityI18N.cancelText,
        open: true,
        onClose: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onNo: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        }
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  /**
   * Creates an Mortality
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateEditMortalityRequest) => {
    setIsSaving(true);
    setEnableCancelCheck(false);

    try {
      const critterbaseCritterId = animalPageContext.selectedAnimal?.critterbase_critter_id;
      if (!values || !critterbaseCritterId || values.mortality.location?.geometry.type !== 'Point') {
        return;
      }

      // Format mortality location
      const mortalityLocation = formatLocation(values.mortality.location);

      // Format mortality timestamp
      const mortalityTimestamp = dayjs(
        `${values.mortality.mortality_date}${
          values.mortality.mortality_time ? ` ${values.mortality.mortality_time}-07:00` : 'T00:00:00-07:00'
        }`
      ).toDate();

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
      } = formatCritterDetailsForBulkUpdate(
        critter,
        values.markings,
        values.measurements,
        values.mortality.mortality_id
      );

      // Create new measurements added while editing the mortality
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
        mortality: {
          critter_id: critterbaseCritterId,
          mortality_id: values.mortality.mortality_id,
          location: mortalityLocation,
          mortality_timestamp: mortalityTimestamp,
          mortality_comment: values.mortality.mortality_comment,
          proximate_cause_of_death_id: values.mortality.proximate_cause_of_death_id,
          proximate_cause_of_death_confidence: values.mortality.proximate_cause_of_death_confidence,
          proximate_predated_by_itis_tsn: values.mortality.proximate_predated_by_itis_tsn,
          ultimate_cause_of_death_id: values.mortality.ultimate_cause_of_death_id,
          ultimate_cause_of_death_confidence: values.mortality.ultimate_cause_of_death_confidence,
          ultimate_predated_by_itis_tsn: values.mortality.ultimate_predated_by_itis_tsn
        },
        markings: [...markingsForUpdate, ...markingsForDelete],
        qualitative_measurements: [...qualitativeMeasurementsForUpdate, ...qualitativeMeasurementsForDelete],
        quantitative_measurements: [...quantitativeMeasurementsForUpdate, ...quantitativeMeasurementsForDelete]
      });

      if (!response) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      // Refresh page
      animalPageContext.critterDataLoader.refresh(critterbaseCritterId);

      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
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

  const [mortalityDate, mortalityTime] = dayjs(mortality.mortality_timestamp).format('YYYY-MM-DD HH:mm:ss').split(' ');

  // Initial formik values
  const initialFormikValues: ICreateEditMortalityRequest = {
    mortality: {
      mortality_id: mortality.mortality_id,
      mortality_comment: mortality.mortality_comment ?? '',
      mortality_timestamp: mortality.mortality_timestamp,
      mortality_date: mortalityDate,
      mortality_time: mortalityTime,
      proximate_cause_of_death_id: mortality.proximate_cause_of_death_id,
      proximate_cause_of_death_confidence: mortality.proximate_cause_of_death_confidence,
      proximate_predated_by_itis_tsn: mortality.proximate_predated_by_itis_tsn,
      ultimate_cause_of_death_id: mortality.ultimate_cause_of_death_id,
      ultimate_cause_of_death_confidence: mortality.ultimate_cause_of_death_confidence,
      ultimate_predated_by_itis_tsn: mortality.ultimate_predated_by_itis_tsn,
      location: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [mortality.location.longitude ?? 0, mortality.location.latitude ?? 0]
        },
        properties: {}
      }
    },
    markings:
      critter.markings
        .filter((marking) => marking.mortality_id === mortality.mortality_id)
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
        .filter((measurement) => measurement.mortality_id === mortality.mortality_id)
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
        .filter((measurement) => measurement.mortality_id === mortality.mortality_id)
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

  console.log('initialFormikValues', initialFormikValues);

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <PageHeader
        title="Edit Mortality"
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
                Edit Mortality
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
          <AnimalMortalityForm
            initialMortalityData={initialFormikValues}
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
