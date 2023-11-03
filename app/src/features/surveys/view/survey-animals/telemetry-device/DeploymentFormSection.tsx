import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import YesNoDialog from 'components/dialog/YesNoDialog';
import SingleDateField from 'components/fields/SingleDateField';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useQuery } from 'hooks/useQuery';
import { Fragment, useContext, useState } from 'react';
import { setMessageSnackbar } from 'utils/Utils';
import { ANIMAL_FORM_MODE, IAnimal } from '../animal';

interface DeploymentFormSectionProps {
  index: number;
  mode: ANIMAL_FORM_MODE;
}

export const DeploymentFormSection = (props: DeploymentFormSectionProps): JSX.Element => {
  const { index, mode } = props;
  const animalKeyName: keyof IAnimal = 'device';

  const bhApi = useBiohubApi();

  const { cid: survey_critter_id } = useQuery();
  const { values } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);
  const { surveyId, projectId } = useContext(SurveyContext);
  const [deploymentIDToDelete, setDeploymentIDToDelete] = useState<null | string>(null);

  const device = values[animalKeyName]?.[index];
  const deployments = device.deployments;

  const handleRemoveDeployment = async (deployment_id: string) => {
    try {
      if (survey_critter_id === undefined) {
        setMessageSnackbar('No critter set!', dialogContext);
      }
      await bhApi.survey.removeDeployment(projectId, surveyId, Number(survey_critter_id), deployment_id);
      setMessageSnackbar('Deployment deleted', dialogContext);
      if (!deployments) {
        return;
      }
      if (deployments.length === 1) {
        values[animalKeyName].pop();
        return;
      }
      const deploymentIndex = deployments.findIndex((deployment) => deployment.deployment_id === deployment_id);
      deployments?.splice(deploymentIndex, 1);
      setMessageSnackbar('Deployment deleted', dialogContext);
    } catch (e) {
      setMessageSnackbar('Failed to delete deployment.', dialogContext);
      return;
    }

    //TODO is this still needed?
    //refreshDeployments();
  };

  if (!deployments) {
    return <></>;
  }

  return (
    <>
      <Grid container spacing={3}>
        {deployments.map((deploy, i) => {
          return (
            <Fragment key={`deployment-item-${deploy.deployment_id}`}>
              <Grid item xs={mode === ANIMAL_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField
                  name={`device.${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Start Date'}
                />
              </Grid>
              <Grid item xs={mode === ANIMAL_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField name={`device.${index}.deployments.${i}.attachment_end`} label={'End Date'} />
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
          If you would like to end a deployment / unattach a device, you should set the attachment end date instead.
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
