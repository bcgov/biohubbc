import Box from '@mui/material/Box';
import { DialogProps } from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import ObservationForm, { ObservationYupSchema } from '../../form/ObservationForm';

interface IAddObservationDialogProps extends DialogProps {
  open: boolean;
  onSave: (data: any, index?: number) => void;
  onClose: () => void;
}

export const initialSubcountValues = {
  observation_subcount_id: null,
  subcount: null,
  comment: null,
  qualitative_measurements: [],
  quantitative_measurements: [],
  qualitative_environments: [],
  quantitative_environments: []
};

const initialObservationValues: IObservationTableRowToSave = {
  standardColumns: {
    survey_observation_id: '' as unknown as number,
    itis_tsn: null,
    itis_scientific_name: null,
    survey_sample_site_id: null,
    survey_sample_method_id: null,
    survey_sample_period_id: null,
    count: null,
    observation_date: null,
    observation_time: null,
    latitude: null,
    longitude: null
  },
  subcounts: [initialSubcountValues]
};

const AddObservationDialog = (props: IAddObservationDialogProps) => {
  const { open, onClose } = props;

  return (
    <>
      <EditDialog
        dialogTitle={'Add Observation'}
        open={open}
        dialogLoading={false}
        size="lg"
        component={{
          element: (
            <>
              <Box mb={3}>
                <Typography color="textSecondary">Enter information about the observation</Typography>
              </Box>
              <Box height="75vh">
                <ObservationForm />
              </Box>
            </>
          ),
          initialValues: initialObservationValues,
          validationSchema: ObservationYupSchema
        }}
        dialogSaveButtonLabel="Save Observation"
        onCancel={() => {
          onClose();
        }}
        onSave={() => {
          // onSave(formValues, initialData?.index);
        }}
      />
    </>
  );
};

export default AddObservationDialog;
