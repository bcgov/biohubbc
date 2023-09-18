import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CustomTextField from 'components/fields/CustomTextField';
import { CodesContext } from 'contexts/codesContext';
import { useContext, useState } from 'react';

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

// THIS WILL SIT INSIDE OF THE DIALOG
const MethodForm = (props: ISamplingMethodData) => {
  const dataLoader = useContext(CodesContext);
  dataLoader.codesDataLoader.load();
  const [currentPeriods, setCurrentPeriods] = useState<MethodPeriod[]>(
    props.periods.length ? props.periods : [{ sample_method_id: null, start_date: '', end_date: '' }]
  );

  return (
    <form>
      <Box mb={3}>
        <Select size="small" sx={{ width: '200px', backgroundColor: '#fff' }} displayEmpty onChange={(event) => {}}>
          {dataLoader.codesDataLoader.data?.field_methods.map((item) => (
            <MenuItem key={item.id} value={item.name}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
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
