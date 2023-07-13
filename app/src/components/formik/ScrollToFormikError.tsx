import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useFormikContext } from 'formik';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';

export interface IScrollToFormikErrorProps {
  /**
   * An ordered list of field names, which informs which field this component will scroll to when multiple fields are
   * in error.
   *
   * Note: A regex is required if the field name has dynamic components (ie: a field with an array of objects where
   * part of the field name is its index in the array field).
   *
   * @type {((string | RegExp)[])}
   * @memberof IScrollToFormikErrorProps
   */
  fieldOrder: (string | RegExp)[];
}

export const ScrollToFormikError: React.FC<IScrollToFormikErrorProps> = (props) => {
  const formikProps = useFormikContext<ProjectViewObject>();
  const { errors, submitCount } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  useEffect(() => {
    const showSnackBar = (message: string) => {
      setOpenSnackbar({ open: true, msg: message });
    };

    const getAllFieldErrorNames = (obj: object, prefix = '', result: string[] = []) => {
      Object.keys(obj).forEach((key) => {
        const value = (obj as Record<string, any>)[key];
        if (!value) return;

        key = Number(key) || key === '0' ? `[${key}]` : key;

        const nextKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object') {
          getAllFieldErrorNames(value, nextKey, result);
        } else {
          result.push(nextKey);
        }
      });
      return result;
    };

    const getFirstErrorField = (errorArray: string[]): string | undefined => {
      for (const listError of props.fieldOrder) {
        for (const trueError of errorArray) {
          if (trueError.match(listError) || listError === trueError) {
            return trueError;
          }
        }
      }
    };

    const fieldErrorNames = getAllFieldErrorNames(errors);

    const topFieldError = getFirstErrorField(fieldErrorNames);

    if (!topFieldError) {
      return;
    }

    showSnackBar(`Missing one or more required fields.`);

    const errorElement = document.getElementsByName(topFieldError);

    if (errorElement.length <= 0) {
      return;
    }

    errorElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

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
