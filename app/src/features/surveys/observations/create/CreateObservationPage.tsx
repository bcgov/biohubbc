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
import { CreateObservationI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import ObservationForm from 'features/surveys/observations/form/ObservationForm';
import { ObservationFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import {
  ICreateObservation,
  ObservationEnvironmentQualitative,
  ObservationEnvironmentQuantitative,
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { v4 } from 'uuid';

export const initialSubcountValues = {
  observation_subcount_id: null,
  count: null,
  comment: null,
  measurements: [],
  environments: [],
  _id: v4()
};

const initialObservationFormData: ObservationFormData = {
  standardColumns: {
    survey_observation_id: null,
    itis_tsn: null,
    itis_scientific_name: null,
    survey_sample_site_id: undefined,
    method_technique_id: undefined,
    survey_sample_period_id: null,
    count: null,
    observation_date: null,
    observation_time: null,
    latitude: null,
    longitude: null,
    observation_sign_id: null,
    environments: []
  },
  subcounts: [initialSubcountValues]
};

/**
 * Page for creating an observation
 *
 * @return {*}
 */
const CreateObservationPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<ObservationFormData>>(null);

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

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateObservationI18N.createErrorTitle,
      dialogText: CreateObservationI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations`);
  };

  /**
   * Creates a new observation
   *
   * @param {ICreateObservation} observationPostObject
   * @return {*}
   */
  const createObservation = async (formData: ObservationFormData) => {
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

      const quantitative_environments: ObservationEnvironmentQuantitative[] = [];
      const qualitative_environments: ObservationEnvironmentQualitative[] = [];

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

      const standardColumns: ICreateObservation['standardColumns'] = {
        itis_scientific_name,
        itis_tsn,
        observation_date,
        observation_time,
        survey_sample_period_id,
        latitude,
        longitude,
        count: formData.subcounts.reduce((sum, subcount) => sum + (subcount.count ?? 0), 0),
        observation_sign_id: formData.standardColumns.observation_sign_id,
        qualitative_environments,
        quantitative_environments
      };

      const subcounts: ICreateObservation['subcounts'] = formData.subcounts.map((subcount) => {
        const { measurements, ...subcountProps } = subcount;

        const quantitative_measurements: SubcountQuantitativeMeasurement[] = [];
        const qualitative_measurements: SubcountQualitativeMeasurement[] = [];

        for (const measurement of measurements) {
          if ('measurement_value' in measurement) {
            quantitative_measurements.push({
              measurement_id: measurement.measurement_id,
              measurement_value: measurement.measurement_value
            });
          } else if ('measurement_option_id' in measurement) {
            qualitative_measurements.push({
              measurement_id: measurement.measurement_id,
              measurement_option_id: measurement.measurement_option_id
            });
          }
        }

        return {
          comment: subcountProps.comment,
          count: subcountProps.count,
          quantitative_measurements,
          qualitative_measurements
        };
      });

      const createObservationPayload: ICreateObservation = {
        standardColumns,
        subcounts
      };

      await biohubApi.observation.createObservation(projectId, surveyId, createObservationPayload);

      setEnableCancelCheck(false);
      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations`, SKIP_CONFIRMATION_DIALOG);
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
        dialogTitle: CreateObservationI18N.createErrorTitle,
        dialogText: CreateObservationI18N.createErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Create Observation"
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
              Create Observation
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
              initialFormData={initialObservationFormData}
              onSubmit={(formData) => createObservation(formData)}
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

export default CreateObservationPage;
