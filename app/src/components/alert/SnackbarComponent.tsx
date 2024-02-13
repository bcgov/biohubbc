import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

export const SnackbarComponent = () => {
  const formikProps = useFormikContext<any>();
  const { errors, submitCount } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  useEffect(() => {
    const showSnackBar = (message: string) => {
      setOpenSnackbar({ open: true, msg: message });
    };

    if (errors && submitCount > 0) {
      showSnackBar('Missing one or more required fields.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, submitCount]);

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
