import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useFormikContext } from 'formik';
import { useState } from 'react';

import CustomTextField from 'components/fields/CustomTextField';
import HelpButtonStack from 'components/tooltip/HelpButtonStack';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

/**
 * Returns component for adding wildlife health id to an animal within the AnimalFormContainer.
 *
 * @return {*}
 */
export const WildlifeHealthForm = () => {
  const { values } = useFormikContext<ICreateEditAnimalRequest>();
  const [showInput, setShowInput] = useState(!!values.wildlife_health_id);

  const critterbaseApi = useCritterbaseApi();

  return (
    <Grid container spacing={2}>
      {showInput && (
        <Grid item xs={12}>
          <CustomTextField
            name="wildlife_health_id"
            label="Wildlife Health ID"
            maxLength={200}
            other={{ required: false }}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <HelpButtonStack helpText="This may be the same identifier you chose to use as your animal's alias.">
          <Button
            color="primary"
            variant="outlined"
            data-testid="wildlife_health_id-button"
            onClick={() => setShowInput(true)}
            startIcon={<Icon path={mdiPlus} size={0.75} />}
            aria-label="Add Wildlife Health ID"
            disabled={showInput}>
            Add Wildlife Health ID
          </Button>
        </HelpButtonStack>
      </Grid>
    </Grid>
  );
};
