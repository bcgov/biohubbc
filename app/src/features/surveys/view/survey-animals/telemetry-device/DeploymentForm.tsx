import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import YesNoDialog from 'components/dialog/YesNoDialog';
import SingleDateField from 'components/fields/SingleDateField';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Field, useFormikContext } from 'formik';
import { IGetDeviceDetailsResponse } from 'hooks/telemetry/useDeviceApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useQuery } from 'hooks/useQuery';
import { Fragment, useContext, useState } from 'react';
import { setMessageSnackbar } from 'utils/Utils';
import { ANIMAL_FORM_MODE } from '../animal';
import { IAnimalTelemetryDevice } from './device';

interface DeploymentFormSectionProps {
  mode: ANIMAL_FORM_MODE;
  deviceDetails?: IGetDeviceDetailsResponse;
}

export const DeploymentForm = (props: DeploymentFormSectionProps): JSX.Element => {
  const { mode } = props;

  const biohubApi = useBiohubApi();
  const { critter_id: survey_critter_id } = useQuery();
  const { values, validateField } = useFormikContext<IAnimalTelemetryDevice>();
  const { surveyId, projectId } = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

  const [deploymentIDToDelete, setDeploymentIDToDelete] = useState<null | string>(null);

  const device = values;
  const deployments = device.deployments;

  const handleRemoveDeployment = async (deployment_id: string) => {
    try {
      if (survey_critter_id === undefined) {
        setMessageSnackbar('No critter set!', dialogContext);
      }
      await biohubApi.survey.removeDeployment(projectId, surveyId, Number(survey_critter_id), deployment_id);
      const indexOfDeployment = deployments?.findIndex((deployment) => deployment.deployment_id === deployment_id);
      if (indexOfDeployment !== undefined) {
        deployments?.splice(indexOfDeployment);
      }
      setMessageSnackbar('Deployment deleted', dialogContext);
    } catch (e) {
      setMessageSnackbar('Failed to delete deployment.', dialogContext);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {deployments?.map((deploy, i) => {
          return (
            <Fragment key={`deployment-item-${deploy.deployment_id}`}>
              <Grid item xs={mode === ANIMAL_FORM_MODE.ADD ? 6 : 5.5}>
                <Field
                  as={SingleDateField}
                  name={`deployments.${i}.attachment_start`}
                  required={true}
                  label={'Start Date'}
                  other={{ onChange: () => validateField(`deployments.${i}.attachment_start`) }}
                />
              </Grid>
              <Grid item xs={mode === ANIMAL_FORM_MODE.ADD ? 6 : 5.5}>
                <Field
                  as={SingleDateField}
                  name={`deployments.${i}.attachment_end`}
                  label={'End Date'}
                  other={{ onChange: () => validateField(`deployments.${i}.attachment_end`) }}
                />
              </Grid>
              {mode === ANIMAL_FORM_MODE.EDIT && (
                <Grid item xs={1}>
                  <IconButton
                    sx={{ mt: 1 }}
                    title="Remove Deployment"
                    aria-label="remove-deployment"
                    onClick={() => {
                      setDeploymentIDToDelete(String(deploy.deployment_id));
                    }}>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </IconButton>
                </Grid>
              )}
            </Fragment>
          );
        })}
      </Grid>

      {/* Delete Dialog */}
      <YesNoDialog
        dialogTitle={'Remove deployment?'}
        dialogText={`Are you sure you want to remove this deployment?
          If you would like to end a deployment or unattach a device, you should set the attachment end date instead.
          Please confirm that you wish to permanently erase this deployment.`}
        open={deploymentIDToDelete !== null}
        yesButtonLabel="Delete"
        noButtonLabel="Cancel"
        yesButtonProps={{ color: 'error' }}
        onClose={() => setDeploymentIDToDelete(null)}
        onNo={() => setDeploymentIDToDelete(null)}
        onYes={async () => {
          if (deploymentIDToDelete) {
            await handleRemoveDeployment(deploymentIDToDelete);
          }
          setDeploymentIDToDelete(null);
        }}
      />
    </>
  );
};
