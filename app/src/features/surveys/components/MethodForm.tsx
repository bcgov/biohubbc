import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { CircularProgress, MenuItem, Select, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { useContext, useState } from 'react';

interface ISurveySampleMethodPeriodData {
  survey_sample_period_id: number | null;
  survey_sample_method_id: number | null;
  start_date: string;
  end_date: string;
}

export interface ISurveySampleMethodData {
  survey_sample_method_id: number | null;
  survey_sample_site_id: number | null;
  method_lookup_id: number | null;
  description: string;
  periods: ISurveySampleMethodPeriodData[];
}

export interface IEditSurveySampleMethodData extends ISurveySampleMethodData {
  index: number;
}

const MethodForm = () => {
  const blankPeriod = {
    method_lookup_id: null,
    survey_sample_period_id: null,
    survey_sample_method_id: null,
    start_date: '',
    end_date: ''
  };
  const formikProps = useFormikContext<ISurveySampleMethodData>();
  const dataLoader = useContext(CodesContext);
  dataLoader.codesDataLoader.load();
  const [currentPeriods, setCurrentPeriods] = useState<ISurveySampleMethodPeriodData[]>(
    formikProps.values.periods.length ? formikProps.values.periods : [blankPeriod]
  );

  if (!dataLoader.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <form>
      <Box component={'fieldset'} mb={3}>
        <Typography component="legend">Sampling Method Details</Typography>
        <Select
          sx={{ width: '100%', backgroundColor: '#fff' }}
          displayEmpty
          value={formikProps.values.method_lookup_id}
          renderValue={(selected) => {
            if (selected) {
              return dataLoader.codesDataLoader.data?.sample_methods.find((item) => item.id === selected)?.name;
            } else {
              return 'Select Method';
            }
          }}
          name={`method_lookup_id`}
          onChange={formikProps.handleChange}>
          {dataLoader.codesDataLoader.data.sample_methods.map((item) => (
            <MenuItem key={item.id} value={item.id}>
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

      <Box component={'fieldset'}>
        <Typography component="legend">Add Time Periods</Typography>

        {currentPeriods.map((_, index) => (
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
        onClick={() => setCurrentPeriods([...currentPeriods, blankPeriod])}>
        Add Period
      </Button>
    </form>
  );
};

export default MethodForm;
