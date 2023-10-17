import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomTextField from 'components/fields/CustomTextField';
import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';
import { IStratumForm, StratumFormYupSchema } from './SurveyStratumForm';

interface IStratumDialogProps {
  open: boolean;
  stratumFormInitialValues: IStratumForm;
  onCancel: () => void;
  onSave: (formikProps: FormikProps<IStratumForm> | null) => void;
}

const StratumCreateOrEditDialog = (props: IStratumDialogProps) => {
  const formikRef = useRef<FormikProps<IStratumForm>>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCancel = () => {
    props.onCancel();
  };

  const editing = props.stratumFormInitialValues.index !== null;

  return (
    <Formik<IStratumForm>
      initialValues={props.stratumFormInitialValues}
      innerRef={formikRef}
      enableReinitialize={true}
      validationSchema={StratumFormYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={(_values) => {
        props.onSave(formikRef.current);
      }}>
      {(formikProps) => {
        return (
          <Dialog open={props.open} fullScreen={fullScreen} maxWidth="xl" onClose={props.onCancel}>
            <DialogTitle>{editing ? 'Edit Stratum Details' : 'Add Stratum'}</DialogTitle>
            <DialogContent>
              <CustomTextField
                other={{
                  sx: { mb: 4 },
                  required: true
                }}
                name="stratum.name"
                label="Name"
              />
              <CustomTextField
                other={{
                  multiline: true,
                  required: true,
                  rows: 5
                }}
                name="stratum.description"
                label="Description"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => formikProps.submitForm()} variant="contained" color="primary">
                {editing ? 'Update' : 'Add Stratum'}
              </Button>
              <Button onClick={() => handleCancel()} variant="outlined">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default StratumCreateOrEditDialog;
