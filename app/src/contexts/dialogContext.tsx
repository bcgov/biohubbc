import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import { Color } from '@material-ui/lab/Alert';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog, { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import React, { createContext, ReactNode, useState } from 'react';

export interface IBaseDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IYesNoDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IYesNoDialogProps
   */
  dialogText: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IYesNoDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IYesNoDialogProps
   */
  onClose: () => void;
}

export interface IDialogContext {
  /**
   * Set the yes-no dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  showYesNoDialog: (props: Partial<IYesNoDialogProps>) => void;
  /**
   * The current yes-no dialog props.
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
  showErrorDialog: (props: Partial<IErrorDialogProps>) => void;
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
  showSnackbar: (props: Partial<ISnackbarProps>) => void;
  /**
   * The current snackbar props.
   *
   * @type {ISnackbarProps}
   * @memberof IDialogContext
   */
  snackbarProps: ISnackbarProps;
  /**
   * Closes all dialogs
   * 
   * @memberof IDialogContext
   */
  hideDialog: () => void;
}

export interface ISnackbarProps {
  open: boolean;
  onClose: () => void;
  severity?: Color;
  color?: Color;
  snackbarMessage: ReactNode;
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
  onClose: () => {
    // default do nothing
  }
};

export const DialogContext = createContext<IDialogContext>({
  showYesNoDialog: () => {
    // default do nothing
  },
  yesNoDialogProps: defaultYesNoDialogProps,
  showErrorDialog: () => {
    // default do nothing
  },
  errorDialogProps: defaultErrorDialogProps,
  showSnackbar: () => {
    // default do nothing
  },
  snackbarProps: defaultSnackbarProps,
  hideDialog: () => {
    // default do nothing
  }
});

/**
 * Wraps the provided children in a context that provides various modal dialogs/popups.
 *
 * @param {*} props
 * @return {*}
 */
export const DialogContextProvider: React.FC = (props) => {
  const [yesNoDialogProps, setYesNoDialogProps] = useState<IYesNoDialogProps>({
    ...defaultYesNoDialogProps,
    onYes: () => hideDialog()
  });

  const hideDialog = () => {
    setYesNoDialogProps({ ...yesNoDialogProps, open: false });
    setErrorDialogProps({ ...errorDialogProps, open: false });
    setSnackbarProps({ ...snackbarProps, open: false });
  }

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>(defaultErrorDialogProps);

  const [snackbarProps, setSnackbarProps] = useState<ISnackbarProps>(defaultSnackbarProps);

  const showYesNoDialog = function (partialProps: Partial<IYesNoDialogProps>) {
    setYesNoDialogProps({ ...yesNoDialogProps, ...partialProps,  });
  };

  const showSnackbar = function (partialProps: Partial<ISnackbarProps>) {
    setSnackbarProps({ ...snackbarProps, ...partialProps,  });
  };

  const showErrorDialog = function (partialProps: Partial<IErrorDialogProps>) {
    setErrorDialogProps({ ...errorDialogProps, ...partialProps,  });
  };

  return (
    <DialogContext.Provider
      value={{
        showYesNoDialog,
        yesNoDialogProps,
        showErrorDialog,
        errorDialogProps,
        showSnackbar,
        snackbarProps,
        hideDialog
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
        onClose={hideDialog}
        message={snackbarProps.snackbarMessage}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={hideDialog}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </DialogContext.Provider>
  );
};
