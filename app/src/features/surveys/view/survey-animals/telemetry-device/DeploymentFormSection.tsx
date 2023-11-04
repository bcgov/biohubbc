import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import YesNoDialog from 'components/dialog/YesNoDialog';
import SingleDateField from 'components/fields/SingleDateField';
import { useFormikContext } from 'formik';
import { Fragment, useState } from 'react';
import { ANIMAL_FORM_MODE, IAnimal } from '../animal';

interface DeploymentFormSectionProps {
  index: number;
  mode: ANIMAL_FORM_MODE;
  handleRemoveDeployment: (deployment_id: string) => Promise<void>;
}

export const DeploymentFormSection = (props: DeploymentFormSectionProps): JSX.Element => {
  const { index, mode, handleRemoveDeployment } = props;
  const animalKeyName: keyof IAnimal = 'device';

  const { values } = useFormikContext<IAnimal>();
  const [deploymentIDToDelete, setDeploymentIDToDelete] = useState<null | string>(null);

  const device = values[animalKeyName]?.[index];
  const deployments = device.deployments;

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
