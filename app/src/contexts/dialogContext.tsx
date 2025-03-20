import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ScoreDialog, { IScoreDialogProps } from 'components/dialog/ScoreDialog';
import YesNoDialog, { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import React, { createContext, ReactNode, useState } from 'react';

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
  /**
   * Set the score dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  setScoreDialog: (props: Partial<IScoreDialogProps>) => void;
  /**
   * The current score dialog props.
   *
   * @type {IScoreDialogProps}
   * @memberof IDialogContext
   */
  scoreDialogProps: IScoreDialogProps;
}

export interface ISnackbarProps {
  open: boolean;
  onClose?: () => void;
  snackbarMessage: ReactNode;
  snackbarAutoCloseMs?: number; //ms
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
  open: false
};

export const defaultScoreDialogProps: IScoreDialogProps = {
  dialogTitle: '',
  dialogText: '',
  dialogContent: <></>,
  open: false,
  onClose: () => {
    // default do nothing
  },
  onOk: () => {
    // default do nothing
  },
  onSubmit: () => {
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
  snackbarProps: defaultSnackbarProps,
  setScoreDialog: () => {
    // default do nothing
  },
  scoreDialogProps: defaultScoreDialogProps
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

  const [scoreDialogProps, setScoreDialogProps] = useState<IScoreDialogProps>(defaultScoreDialogProps);

  const [snackbarProps, setSnackbarProps] = useState<ISnackbarProps>(defaultSnackbarProps);

  const setYesNoDialog = function (partialProps: Partial<IYesNoDialogProps>) {
    setYesNoDialogProps({ ...yesNoDialogProps, ...partialProps });
  };

  const setSnackbar = function (partialProps: Partial<ISnackbarProps>) {
    setSnackbarProps({ onClose: () => setSnackbar({ open: false }), ...snackbarProps, ...partialProps });
  };

  const setErrorDialog = function (partialProps: Partial<IErrorDialogProps>) {
    setErrorDialogProps({ ...errorDialogProps, ...partialProps });
  };

  const setScoreDialog = function (partialProps: Partial<IScoreDialogProps>) {
    setScoreDialogProps((prev) => ({ ...prev, ...partialProps }));
  };

  return (
    <DialogContext.Provider
      value={{
        setYesNoDialog,
        yesNoDialogProps,
        setErrorDialog,
        errorDialogProps,
        setSnackbar,
        snackbarProps,
        setScoreDialog,
        scoreDialogProps
      }}>
      {props.children}
      <YesNoDialog {...yesNoDialogProps} />
      <ErrorDialog {...errorDialogProps} />
      <ScoreDialog {...scoreDialogProps} />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={snackbarProps.open}
        autoHideDuration={snackbarProps?.snackbarAutoCloseMs ?? 3000}
        onClose={snackbarProps.onClose}
        message={snackbarProps.snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={snackbarProps.onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </DialogContext.Provider>
  );
};
