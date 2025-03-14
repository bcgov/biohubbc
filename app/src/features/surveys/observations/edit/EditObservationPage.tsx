import { LoadingButton } from '@mui/lab';
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
import { EditObservationI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import ObservationForm from 'features/surveys/observations/form/ObservationForm';
import { UpdateObservationFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import {
  isSubcountQualitativeMeasurement,
  isSubcountQuantitativeMeasurement
} from 'features/surveys/observations/utils/type-guard-utils';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import {
  IEditObservation,
  ObservationEnvironmentQualitativeObject,
  ObservationEnvironmentQuantitativeObject,
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { v4 } from 'uuid';

/**
 * Page for creating an observation
 *
 * @return {*}
 */
const EditObservationPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<UpdateObservationFormData>>(null);

  const urlParams = useParams<Record<string, string | undefined>>();
  const observationId = Number(urlParams.observation_id);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  // Project and survey details for breadcrumbs
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const projectName = projectContext.projectDataLoader.data?.projectData.project.project_name;
  const surveyName = surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name;
  const { projectId, surveyId } = surveyContext;

  const observationDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationRecord(surveyContext.projectId, surveyContext.surveyId, observationId)
  );

  useEffect(() => {
    observationDataLoader.load();
  }, [observationDataLoader]);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showEditErrorDialog = (textDialogProps: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditObservationI18N.editErrorTitle,
      dialogText: EditObservationI18N.editErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations`);
  };

  /**
   * Edits an existing observation
   *
   * @param {IEditObservation} observationPostObject
   * @return {*}
   */
  const editObservation = async (formData: UpdateObservationFormData) => {
    setIsSaving(true);
    try {
      const {
        itis_scientific_name,
        itis_tsn,
        observation_date,
        observation_time,
        survey_sample_period_id,
        longitude,
        latitude,
        environments
      } = formData.standardColumns;

      const quantitative_environments: ObservationEnvironmentQuantitativeObject[] = [];
      const qualitative_environments: ObservationEnvironmentQualitativeObject[] = [];

      for (const environment of environments) {
        if (environment._type === 'quantitative') {
          if (!environment.environment_quantitative_id || !environment.value) {
            continue;
          }

          quantitative_environments.push({
            environment_quantitative_id: environment.environment_quantitative_id,
            value: environment.value
          });
        } else if (environment._type === 'qualitative') {
          if (!environment.environment_qualitative_id || !environment.environment_qualitative_option_id) {
            continue;
          }

          qualitative_environments.push({
            environment_qualitative_id: environment.environment_qualitative_id,
            environment_qualitative_option_id: environment.environment_qualitative_option_id
          });
        }
      }

      const standardColumns: IEditObservation['standardColumns'] = {
        survey_observation_id: observationId,
        itis_scientific_name,
        itis_tsn,
        observation_date,
        observation_time,
        survey_sample_period_id,
        latitude,
        longitude,
        count: formData.subcounts.reduce((sum, subcount) => sum + (subcount.subcount ?? 0), 0),
        observation_sign_id: formData.standardColumns.observation_sign_id,
        qualitative_environments,
        quantitative_environments
      };

      const subcounts: IEditObservation['subcounts'] = formData.subcounts.map((subcount) => {
        const { measurements, ...subcountProps } = subcount;

        const quantitative_measurements: SubcountQuantitativeMeasurement[] = [];
        const qualitative_measurements: SubcountQualitativeMeasurement[] = [];

        for (const measurement of measurements) {
          if (isSubcountQuantitativeMeasurement(measurement)) {
            if (!measurement.measurement_value) {
              // No value was entered for the quantitative measurement, skip it
              continue;
            }

            quantitative_measurements.push({
              measurement_id: measurement.measurement_id,
              measurement_value: measurement.measurement_value
            });
          } else if (isSubcountQualitativeMeasurement(measurement)) {
            if (!measurement.measurement_option_id) {
              // No value was selected for the qualitative measurement, skip it
              continue;
            }

            qualitative_measurements.push({
              measurement_id: measurement.measurement_id,
              measurement_option_id: measurement.measurement_option_id
            });
          }
        }

        return {
          observation_subcount_id: subcountProps.observation_subcount_id ?? undefined,
          subcount: subcountProps.subcount,
          comment: subcountProps.comment,
          quantitative_measurements,
          qualitative_measurements
        };
      });

      const editObservationPayload: IEditObservation = {
        standardColumns,
        subcounts
      };

      await biohubApi.observation.updateObservation(projectId, surveyId, observationId, editObservationPayload);

      setEnableCancelCheck(false);
      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations`, SKIP_CONFIRMATION_DIALOG);
    } catch (error) {
      const apiError = error as APIError;
      showEditErrorDialog({
        dialogTitle: EditObservationI18N.editErrorTitle,
        dialogText: EditObservationI18N.editErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (
    !surveyContext.surveyDataLoader.data ||
    !projectContext.projectDataLoader.data ||
    !codesContext.codesDataLoader.data ||
    !observationDataLoader.data ||
    observationDataLoader.isLoading
  ) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const initialObservationFormValues: UpdateObservationFormData = {
    standardColumns: {
      survey_observation_id: observationDataLoader.data.surveyObservation.survey_observation_id,
      count: observationDataLoader.data.surveyObservation.count,
      latitude: observationDataLoader.data.surveyObservation.latitude,
      longitude: observationDataLoader.data.surveyObservation.longitude,
      observation_date: observationDataLoader.data.surveyObservation.observation_date,
      observation_time: observationDataLoader.data.surveyObservation.observation_time,
      itis_tsn: observationDataLoader.data.surveyObservation.itis_tsn,
      itis_scientific_name: observationDataLoader.data.surveyObservation.itis_scientific_name,
      observation_sign_id: observationDataLoader.data.surveyObservation.observation_sign_id,
      survey_sample_site_id: observationDataLoader.data.surveyObservation.survey_sample_site_id,
      method_technique_id: observationDataLoader.data.surveyObservation.method_technique_id,
      survey_sample_period_id: observationDataLoader.data.surveyObservation.survey_sample_period_id,
      environments: []
    },
    subcounts:
      observationDataLoader.data.surveyObservation.subcounts.map((subcount) => {
        return {
          _id: v4(),
          observation_subcount_id: subcount.observation_subcount_id,
          subcount: subcount.subcount,
          comment: subcount.comment,
          measurements: [
            ...subcount.quantitative_measurements.map((measurement) => {
              return {
                _id: v4(),
                measurement_id: measurement.critterbase_taxon_measurement_id,
                measurement_value: measurement.value
              };
            }),
            ...subcount.qualitative_measurements.map((measurement) => {
              return {
                _id: v4(),
                measurement_id: measurement.critterbase_measurement_qualitative_option_id,
                measurement_option_id: measurement.critterbase_measurement_qualitative_option_id
              };
            })
          ],
          markings: []
        };
      }) ?? []
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Edit Observation"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/`}>
              {projectName}
            </Link>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/surveys/${surveyId}`}>
              {surveyName}
            </Link>
            <Link
              component={RouterLink}
              underline="hover"
              to={`/admin/projects/${projectId}/surveys/${surveyId}/observations`}>
              Observations
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Edit Observation
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-observation-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <TaxonomyContextProvider>
            <ObservationForm
              initialFormData={initialObservationFormValues}
              onSubmit={(formData) => {
                editObservation(formData);
              }}
              formikRef={formikRef}
            />
          </TaxonomyContextProvider>
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-observation-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default EditObservationPage;
