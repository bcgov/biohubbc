import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import React from 'react';

interface ObservationSamplingFormProps {
  showSamplingInformation: boolean;
  setShowSamplingInformation: React.Dispatch<React.SetStateAction<boolean>>;
}

const ObservationSamplingForm: React.FC<ObservationSamplingFormProps> = ({
  showSamplingInformation,
  setShowSamplingInformation
}) => {
  return (
    <>
      {showSamplingInformation ? (
        <Stack gap={2}>
          <AutocompleteField id="survey_sample_site" name="survey_sample_site" label="Sampling Site" options={[]} />
          <AutocompleteField id="survey_sample_method" name="survey_sample_method" label="Technique" options={[]} />
          <AutocompleteField id="survey_sample_period" name="survey_sample_period" label="Period" options={[]} />
        </Stack>
      ) : (
        <Button
          color="primary"
          variant="outlined"
          startIcon={<Icon path={mdiPlus} size={1} />}
          aria-label="add sampling information"
          onClick={() => setShowSamplingInformation(true)}>
          Add Sampling Site
        </Button>
      )}
    </>
  );
};

export default ObservationSamplingForm;
