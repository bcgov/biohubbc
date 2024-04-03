import { Button } from '@mui/material';
import { useFormikContext } from 'formik';
import { useState } from 'react';

/**
 * Renders formik form values. Used for manual testing purposes
 * Only renders display button when in development.
 * Can provide a custom payload / object for additional testing.
 *
 * @params {FormikDevDebugger}
 * @returns {*}
 *
 **/

interface FormikDevDebuggerProps {
  custom_payload?: any;
}
const FormikDevDebugger = ({ custom_payload }: FormikDevDebuggerProps) => {
  const { values, errors, touched } = useFormikContext();
  const [showFormDebugger, setShowDebugger] = useState(false);
  return (
    <>
      {/* Only render the button in Development */}
      {process.env.NODE_ENV === 'development' ? (
        <Button onClick={() => setShowDebugger((d) => !d)}>Formik Debugger (Only Dev)</Button>
      ) : null}
      {showFormDebugger ? (
        <pre>
          {JSON.stringify(
            { FORMIK_ERRORS: errors, FORMIK_VALUES: values, FORMIK_TOUCHED: touched, CUSTOM_PAYLOAD: custom_payload },
            null,
            2
          )}
        </pre>
      ) : null}
    </>
  );
};

export default FormikDevDebugger;
