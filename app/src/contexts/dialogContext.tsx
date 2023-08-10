import { Alert, AlertProps } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog, { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import React, { createContext, ReactNode, useState } from 'react';

export interface IDialogContext {
  /**
   * Set the yes no dialog props.
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
  open: boolean;
  color: AlertProps['color'];
  snackbarMessage: ReactNode;
  /**
   * Callback fired when the snackbar is closed.
   *
   * Note: this callback will be fired once (when either the snackbar times out or is manually closed by the user).
   *
   * @memberof ISnackbarProps
   */
  onClose: (() => void) | (() => Promise<void>);
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
  snackbarMessage: '',
  open: false,
  color: 'success',
  onClose: () => {
    // default do nothing
  }
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
export const DialogContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [yesNoDialogProps, setYesNoDialogProps] = useState<IYesNoDialogProps>(defaultYesNoDialogProps);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>(defaultErrorDialogProps);

  const [snackbarProps, setSnackbarProps] = useState<ISnackbarProps>(defaultSnackbarProps);

  const setYesNoDialog = function (partialProps: Partial<IYesNoDialogProps>) {
    setYesNoDialogProps({
      ...defaultYesNoDialogProps,
      ...partialProps,
      onClose: () => {
        partialProps?.onClose?.();
        closeYesNoDialog();
      },
      onYes: () => {
        partialProps?.onYes?.();
        closeYesNoDialog();
      },
      onNo: () => {
        partialProps?.onNo?.();
        closeYesNoDialog();
      }
    });
  };

  const closeYesNoDialog = function () {
    setYesNoDialogProps({ ...defaultYesNoDialogProps, open: false });
  };

  const setErrorDialog = function (partialProps: Partial<IErrorDialogProps>) {
    setErrorDialogProps({
      ...defaultErrorDialogProps,
      ...partialProps,
      onClose: () => {
        partialProps?.onClose?.();
        closeErrorDialog();
      },
      onOk: () => {
        partialProps?.onOk?.();
        closeErrorDialog();
      }
    });
  };

  const closeErrorDialog = function () {
    setErrorDialogProps({ ...defaultErrorDialogProps, open: false });
  };

  const setSnackbar = function (partialProps: Partial<ISnackbarProps>) {
    setSnackbarProps({
      ...defaultSnackbarProps,
      ...partialProps,
      onClose: () => {
        partialProps?.onClose?.();
        closeSnackbarDialog();
      }
    });
  };

  const closeSnackbarDialog = function () {
    setSnackbarProps({ ...defaultSnackbarProps, open: false });
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
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={snackbarProps.open}
        autoHideDuration={6000}
        onClose={snackbarProps.onClose}>
        <Alert color={snackbarProps.color || 'info'} onClose={snackbarProps.onClose}>
          {snackbarProps.snackbarMessage}
        </Alert>
      </Snackbar>
    </DialogContext.Provider>
  );
};
