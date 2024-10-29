import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import VoteDialog, { IVoteDialogProps } from 'components/dialog/VoteDialog';
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
   * Set the vote dialog props.
   *
   * Note: Any props that are not provided, will default to whatever value was previously set (or the default value)
   *
   * @memberof IDialogContext
   */
  setVoteDialog: (props: Partial<IVoteDialogProps>) => void;
  /**
   * The current vote dialog props.
   *
   * @type {IVoteDialogProps}
   * @memberof IDialogContext
   */
  voteDialogProps: IVoteDialogProps;
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

export const defaultVoteDialogProps: IVoteDialogProps = {
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
  setVoteDialog: () => {
    // default do nothing
  },
  voteDialogProps: defaultVoteDialogProps
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

  const [voteDialogProps, setVoteDialogProps] = useState<IVoteDialogProps>(defaultVoteDialogProps);

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

  const setVoteDialog = function (partialProps: Partial<IVoteDialogProps>) {
    setVoteDialogProps((prev) => ({ ...prev, ...partialProps }));
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
        setVoteDialog,
        voteDialogProps
      }}>
      {props.children}
      <YesNoDialog {...yesNoDialogProps} />
      <ErrorDialog {...errorDialogProps} />
      <VoteDialog {...voteDialogProps} />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={snackbarProps.open}
        autoHideDuration={snackbarProps?.snackbarAutoCloseMs ?? 6000}
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
