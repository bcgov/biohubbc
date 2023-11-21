import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import YesNoDialog from 'components/dialog/YesNoDialog';
import SingleDateField from 'components/fields/SingleDateField';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Field, useFormikContext } from 'formik';
import { IGetDeviceDetailsResponse } from 'hooks/telemetry/useDeviceApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useQuery } from 'hooks/useQuery';
import { Fragment, useContext, useState } from 'react';
import { dateRangesOverlap, setMessageSnackbar } from 'utils/Utils';
import { ANIMAL_FORM_MODE } from '../animal';
import { IAnimalTelemetryDevice, IDeploymentTimespan } from './device';

interface DeploymentFormSectionProps {
  index: number;
  mode: ANIMAL_FORM_MODE;
  deviceDetails?: IGetDeviceDetailsResponse;
}

export const DeploymentForm = (props: DeploymentFormSectionProps): JSX.Element => {
  const { index, mode, deviceDetails } = props;

  const bhApi = useBiohubApi();
  const { cid: survey_critter_id } = useQuery();
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
      await bhApi.survey.removeDeployment(projectId, surveyId, Number(survey_critter_id), deployment_id);
      const indexOfDeployment = deployments?.findIndex((deployment) => deployment.deployment_id === deployment_id);
      if (indexOfDeployment !== undefined) {
        deployments?.splice(indexOfDeployment);
      }
      setMessageSnackbar('Deployment deleted', dialogContext);
    } catch (e) {
      setMessageSnackbar('Failed to delete deployment.', dialogContext);
    }
  };

  const deploymentOverlapTest = (deployment: IDeploymentTimespan) => {
    if (index === undefined) {
      return;
    }
    if (!deviceDetails) {
      return;
    }

    if (!deployment.attachment_start) {
      return;
    }
    const existingDeployment = deviceDetails.deployments.find(
      (existingDeployment) =>
        deployment.deployment_id !== existingDeployment.deployment_id &&
        dateRangesOverlap(
          deployment.attachment_start,
          deployment.attachment_end,
          existingDeployment.attachment_start,
          existingDeployment.attachment_end
        )
    );
    if (!existingDeployment) {
      return;
    }
    return `This will conflict with an existing deployment for the device running from ${
      existingDeployment.attachment_start
    } until ${existingDeployment.attachment_end ?? 'indefinite.'}`;
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
                  validate={() => deploymentOverlapTest(deploy)}
                />
              </Grid>
              <Grid item xs={mode === ANIMAL_FORM_MODE.ADD ? 6 : 5.5}>
                <Field
                  as={SingleDateField}
                  name={`deployments.${i}.attachment_end`}
                  label={'End Date'}
                  other={{ onChange: () => validateField(`deployments.${i}.attachment_end`) }}
                  validate={() => deploymentOverlapTest(deploy)}
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
