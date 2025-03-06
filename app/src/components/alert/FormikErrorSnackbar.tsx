import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { logIfDevelopment } from 'utils/developer-utils';

/**
 * Plug-and-play Formik error snackbar component.
 *
 * Adds a snackbar that displays when there are form validation errors.
 *
 * Additionally, when in NODE_ENV=development, logs the formik values and errors to the console.
 *
 * @example
 * ```tsx
 * <Formik>
 *   <FormikErrorSnackbar />
 *   <Form />
 * </Formik>
 * ```
 *
 * @return {*}
 */
const FormikErrorSnackbar = () => {
  const formikProps = useFormikContext<any>();
  const { values, errors, submitCount, isSubmitting } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  useEffect(() => {
    if (!Object.keys(errors).length || submitCount <= 0 || isSubmitting) {
      return;
    }

    setOpenSnackbar({ open: true, msg: 'One or more fields are invalid.' });

    logIfDevelopment({
      label: 'FormikErrorSnackbar',
      message: 'One or more fields are invalid.',
      args: [values, errors]
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount, isSubmitting]);

  const closeSnackBar = () =>
    setOpenSnackbar((currentState) => {
      return { open: false, msg: currentState.msg, errors };
    });

  return (
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
  );
};

export default FormikErrorSnackbar;
