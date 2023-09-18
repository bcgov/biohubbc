import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Divider, MenuItem, Select, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
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
const MethodForm = () => {
  const formikProps = useFormikContext<ISamplingMethodData>();
  const dataLoader = useContext(CodesContext);
  dataLoader.codesDataLoader.load();
  const [currentPeriods, setCurrentPeriods] = useState<MethodPeriod[]>(
    formikProps.values.periods.length
      ? formikProps.values.periods
      : [{ sample_method_id: null, start_date: '', end_date: '' }]
  );
  console.log(formikProps.values);
  return (
    <form>
      <Box component={'fieldset'} mb={3}>
        <Typography component="legend">Sampling Method Details</Typography>
        <Select sx={{ width: '100%', backgroundColor: '#fff' }} displayEmpty onChange={(event) => {}}>
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

      <Box component={'fieldset'}>
        <Typography component="legend">Add Time Periods</Typography>

        {currentPeriods.map((item, index) => (
          <Box mt={1}>
            <StartEndDateFields
              formikProps={formikProps}
              startName={`periods[${index}].start_date`}
              endName={`periods[${index}].end_date`}
              startRequired={false}
              endRequired={false}
            />
          </Box>
        ))}
      </Box>

      <Button
        sx={{
          mt: 2
        }}
        data-testid="sampling-period-add-button"
        variant="outlined"
        color="primary"
        title="Add Period"
        aria-label="Create Sample Period"
        startIcon={<Icon path={mdiPlus} size={1} />}
        onClick={() => setCurrentPeriods([])}>
        Add Period
      </Button>

      <Divider sx={{ mt: 3 }}></Divider>
    </form>
  );
};

export default MethodForm;
