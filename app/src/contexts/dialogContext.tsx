import Snackbar from '@material-ui/core/Snackbar';
import Alert, { Color } from '@material-ui/lab/Alert';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog, { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import React, { createContext, useState } from 'react';

export interface IDialogContext {
  /**
   * Set the yes no dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  setYesNoDialog: (props: Partial<IYesNoDialogProps>) => void;
  /**
   * The current yes no dialog props.
   *
   * @type {IYesNoDialogProps}
   * @memberof IDialogContext
   */
  yesNoDialogProps: IYesNoDialogProps;
  /**
   * Set the error dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  setErrorDialog: (props: Partial<IErrorDialogProps>) => void;
  /**
   * The current error dialog props.
   *
   * @type {IErrorDialogProps}
   * @memberof IDialogContext
   */
  errorDialogProps: IErrorDialogProps;
  /**
   * Set the snackbar props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  setSnackbar: (props: Partial<ISnackbarProps>) => void;
  /**
   * The current snackbar props.
   *
   * @type {ISnackbarProps}
   * @memberof IDialogContext
   */
  snackbarProps: ISnackbarProps;
}

export interface ISnackbarProps {
  snackbarText: string;
  open: boolean;
  onClose: () => void;
  severity: Color;
}

export const defaultYesNoDialogProps: IYesNoDialogProps = {
  dialogTitle: '',
  dialogText: '',
  open: false,
  onClose: () => {
    // default do nothing
  },
  onNo: () => {
    // default do nothing
  },
  onYes: () => {
    // default do nothing
  }
};

export const defaultErrorDialogProps: IErrorDialogProps = {
  dialogTitle: '',
  dialogText: '',
  open: false,
  onClose: () => {
    // default do nothing
  },
  onOk: () => {
    // default do nothing
  }
};

export const defaultSnackbarProps: ISnackbarProps = {
  snackbarText: '',
  open: false,
  onClose: () => {
    // default do nothing
  },
  severity: 'info'
};

export const DialogContext = createContext<IDialogContext>({
  setYesNoDialog: () => {
    // default do nothing
  },
  yesNoDialogProps: defaultYesNoDialogProps,
  setErrorDialog: () => {
    // default do nothing
  },
  errorDialogProps: defaultErrorDialogProps,
  setSnackbar: () => {
    // default do nothing
  },
  snackbarProps: defaultSnackbarProps
});

/**
 * Wraps the provided children in a context that provides various modal dialogs/popups.
 *
 * @param {*} props
 * @return {*}
 */
export const DialogContextProvider: React.FC = (props) => {
  const [yesNoDialogProps, setYesNoDialogProps] = useState<IYesNoDialogProps>(defaultYesNoDialogProps);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>(defaultErrorDialogProps);

  const [snackbarProps, setSnackbarProps] = useState<ISnackbarProps>(defaultSnackbarProps);

  const setYesNoDialog = function (partialProps: Partial<IYesNoDialogProps>) {
    setYesNoDialogProps({ ...yesNoDialogProps, ...partialProps });
  };

  const setSnackbar = function (partialProps: Partial<ISnackbarProps>) {
    setSnackbarProps({ ...snackbarProps, ...partialProps });
  };

  const setErrorDialog = function (partialProps: Partial<IErrorDialogProps>) {
    setErrorDialogProps({ ...errorDialogProps, ...partialProps });
  };

  return (
    <DialogContext.Provider
      value={{
        setYesNoDialog,
        yesNoDialogProps,
        setErrorDialog,
        errorDialogProps,
        setSnackbar,
        snackbarProps
      }}>
      {props.children}
      <YesNoDialog {...yesNoDialogProps} />
      <ErrorDialog {...errorDialogProps} />
      <Snackbar open={snackbarProps.open} autoHideDuration={6000} onClose={() => setSnackbar({ open: false })}>
        <Alert onClose={snackbarProps.onClose} severity={snackbarProps.severity}>
          {snackbarProps.snackbarText}
        </Alert>
      </Snackbar>
    </DialogContext.Provider>
  );
};
