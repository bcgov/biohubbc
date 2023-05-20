import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import { Color } from '@material-ui/lab/Alert';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IInfoDialogProps, InfoDialog } from 'components/dialog/InfoDialog';
import { ISuccessDialogProps, SuccessDialog } from 'components/dialog/SuccessDialog';
import YesNoDialog, { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import React, { createContext, ReactNode, useState } from 'react';

export interface IBaseDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IBaseDialogProps
   */
  dialogTitle: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IBaseDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IBaseDialogProps
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
   * Set the success dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  showSuccessDialog: (props: Partial<ISuccessDialogProps>) => void;
  /**
   * The current success dialog props.
   *
   * @type {ISuccessDialogProps}
   * @memberof IDialogContext
   */
  successDialogProps: ISuccessDialogProps;
  /**
   * Set the info dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  showInfoDialog: (props: Partial<IInfoDialogProps>) => void;
  /**
   * The current error dialog props.
   *
   * @type {IErrorDialogProps}
   * @memberof IDialogContext
   */
  infoDialogProps: IInfoDialogProps;
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

const defaultBaseDialogProps: IBaseDialogProps = {
  dialogTitle: '',
  open: false,
  onClose: () => {}
}

export const defaultYesNoDialogProps: IYesNoDialogProps = {
  ...defaultBaseDialogProps,
  dialogText: '',
  onNo: () => {},
  onYes: () => {}
};

export const defaultErrorDialogProps: IErrorDialogProps = {
  ...defaultBaseDialogProps,
  dialogText: ''
};

export const defaultSuccessDialogProps: ISuccessDialogProps = {
  ...defaultBaseDialogProps,
  dialogText: ''
};

export const defaultInfoDialogProps: IInfoDialogProps = {
  ...defaultBaseDialogProps,
  dialogText: ''
};


export const defaultSnackbarProps: ISnackbarProps = {
  snackbarMessage: '',
  open: false,
  onClose: () => {
    // default do nothing
  }
};

export const DialogContext = createContext<IDialogContext>({
  showYesNoDialog: () => {},
  yesNoDialogProps: defaultYesNoDialogProps,
  showErrorDialog: () => {},
  errorDialogProps: defaultErrorDialogProps,
  showSuccessDialog: () => {},
  successDialogProps: defaultSuccessDialogProps,
  showInfoDialog: () => {},
  infoDialogProps: defaultInfoDialogProps,
  showSnackbar: () => {},
  snackbarProps: defaultSnackbarProps,
  hideDialog: () => {}
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
    onNo: () => hideDialog(),
    onYes: () => hideDialog(),
    onClose: () => hideDialog()
  });

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    ...defaultErrorDialogProps,
    onClose: () => hideDialog()
  });

  const [successDialogProps, setSuccessDialogProps] = useState<ISuccessDialogProps>({
    ...defaultSuccessDialogProps,
    onClose: () => hideDialog()
  });

  const [infoDialogProps, setInfoDialogProps] = useState<IInfoDialogProps>({
    ...defaultInfoDialogProps,
    onClose: () => hideDialog()
  });

  const [snackbarProps, setSnackbarProps] = useState<ISnackbarProps>({
    ...defaultSnackbarProps,
    onClose: () => hideDialog()
  });

  console.log({ errorDialogProps })

  const hideDialog = () => {
    console.log('hideDialog()', { errorDialogProps });
    setYesNoDialogProps({ ...yesNoDialogProps, open: false });
    // setErrorDialogProps({ ...errorDialogProps, open: false });
    setSuccessDialogProps({ ...successDialogProps, open: false });
    setInfoDialogProps({ ...infoDialogProps, open: false });
    setSnackbarProps({ ...snackbarProps, open: false });
  }

  const showYesNoDialog = function (partialProps: Partial<IYesNoDialogProps>) {
    setYesNoDialogProps({ ...yesNoDialogProps, ...partialProps, open: true });
  };

  const showSnackbar = function (partialProps: Partial<ISnackbarProps>) {
    setSnackbarProps({ ...snackbarProps, ...partialProps, open: true  });
  };

  const showErrorDialog = function (partialProps: Partial<IErrorDialogProps>) {
    setErrorDialogProps({ ...errorDialogProps, ...partialProps, open: true });
  };

  const showSuccessDialog = function (partialProps: Partial<ISuccessDialogProps>) {
    setSuccessDialogProps({ ...successDialogProps, ...partialProps, open: true })
  }

  const showInfoDialog = function (partialProps: Partial<IInfoDialogProps>) {
    setInfoDialogProps({ ...infoDialogProps, ...partialProps, open: true })
  }

  return (
    <DialogContext.Provider
      value={{
        showYesNoDialog,
        yesNoDialogProps,
        showErrorDialog,
        errorDialogProps,
        showSuccessDialog,
        successDialogProps,
        showInfoDialog,
        infoDialogProps,
        showSnackbar,
        snackbarProps,
        hideDialog
      }}>
      {props.children}
      <YesNoDialog {...yesNoDialogProps} />
      <ErrorDialog {...errorDialogProps} />
      <SuccessDialog {...successDialogProps} />
      <InfoDialog {...infoDialogProps} />
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
