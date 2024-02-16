import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

const SnackbarComponent = () => {
  const formikProps = useFormikContext<any>();
  const { errors, submitCount, isSubmitting } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  useEffect(() => {
    const showSnackBar = (message: string) => {
      setOpenSnackbar({ open: true, msg: message });
    };

    if (Object.keys(errors).length && submitCount > 0 && !isSubmitting) {
      showSnackBar('Missing one or more required fields.');
    }
  }, [errors, submitCount, isSubmitting]);

  const closeSnackBar = () =>
    setOpenSnackbar((currentState) => {
      return { open: false, msg: currentState.msg };
    });

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={openSnackbar.open}
        onClose={closeSnackBar}>
        <Alert elevation={4} severity="error" variant="filled" onClose={closeSnackBar}>
          {openSnackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SnackbarComponent;
