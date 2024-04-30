import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomTextField from 'components/fields/CustomTextField';
import { Formik, FormikProps } from 'formik';
import { IGetSurveyStratumForm } from 'interfaces/useSurveyApi.interface';
import { useRef } from 'react';
import { StratumFormYupSchema } from './SurveyStratumForm';

interface IGetSurveyStratumDialogProps {
  open: boolean;
  stratumFormInitialValues: IGetSurveyStratumForm;
  onCancel: () => void;
  onSave: (formikProps: FormikProps<IGetSurveyStratumForm> | null) => void;
}

const StratumCreateOrEditDialog = (props: IGetSurveyStratumDialogProps) => {
  const formikRef = useRef<FormikProps<IGetSurveyStratumForm>>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCancel = () => {
    props.onCancel();
  };

  const editing = props.stratumFormInitialValues.index !== null;

  return (
    <Formik<IGetSurveyStratumForm>
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
