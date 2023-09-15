import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CustomTextField from 'components/fields/CustomTextField';
import { useState } from 'react';

interface MethodPeriod {
  sample_method_id: number | null;
  start_date: string;
  end_date: string;
}

export interface ISamplingMethodData {
  sample_method_id: number | null;
  method_lookup_id: string;
  description: string;
  periods: MethodPeriod[];
}

const MethodForm = (props: ISamplingMethodData) => {
  const [currentPeriods, setCurrentPeriods] = useState<MethodPeriod[]>(
    props.periods.length ? props.periods : [{ sample_method_id: null, start_date: '', end_date: '' }]
  );

  return (
    <form>
      <Box mb={3}>
        <CustomTextField
          name="name"
          label="Name"
          maxLength={50}
          other={{ placeholder: 'Maximum 50 characters', required: true }}
        />
      </Box>
      <Box mb={3}>
        <CustomTextField
          name="description"
          label="Description"
          maxLength={250}
          other={{ multiline: true, placeholder: 'Maximum 250 characters', required: true, rows: 3 }}
        />
      </Box>

      {/* {currentPeriods.map((item) => {})} */}

      <Button
        sx={{
          mt: 1
        }}
        data-testid="sampling-period-add-button"
        variant="outlined"
        color="primary"
        title="Add Period"
        aria-label="Create Sample Period"
        startIcon={<Icon path={mdiPlus} size={1} />}
        onClick={() => console.log('ADD PERIOD')}>
        Add Period
      </Button>
    </form>
  );
};

export default MethodForm;
