import Snackbar from '@material-ui/core/Snackbar';
import Alert, { Color } from '@material-ui/lab/Alert';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog, { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import React, { createContext, useState } from 'react';

export interface IDialogContext {
  setYesNoDialog: (props: Partial<IYesNoDialogProps>) => void;
  yesNoDialogProps: IYesNoDialogProps;
  setErrorDialog: (props: Partial<IErrorDialogProps>) => void;
  errorDialogProps: IErrorDialogProps;
  setSnackbar: (props: Partial<ISnackbarProps>) => void;
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
  onClose: () => {},
  onNo: () => {},
  onYes: () => {}
};

export const defaultErrorDialogProps: IErrorDialogProps = {
  dialogTitle: '',
  dialogText: '',
  open: false,
  onClose: () => {},
  onOk: () => {}
};

export const defaultSnackbarProps: ISnackbarProps = {
  snackbarText: '',
  open: false,
  onClose: () => {},
  severity: 'info'
};

export const DialogContext = createContext<IDialogContext>({
  setYesNoDialog: () => {},
  yesNoDialogProps: defaultYesNoDialogProps,
  setErrorDialog: () => {},
  errorDialogProps: defaultErrorDialogProps,
  setSnackbar: () => {},
  snackbarProps: defaultSnackbarProps
});

export const DialogContextProvider: React.FC = (props) => {
  const [yesNoDialogProps, setYesNoDialogProps] = useState<IYesNoDialogProps>(defaultYesNoDialogProps);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>(defaultErrorDialogProps);

  const [snackbarProps, setSnackbarProps] = useState<ISnackbarProps>(defaultSnackbarProps);

  const setYesNoDialog = function (props: Partial<IYesNoDialogProps>) {
    setYesNoDialogProps({ ...yesNoDialogProps, ...props });
  };

  const setSnackbar = function (props: Partial<ISnackbarProps>) {
    setSnackbarProps({ ...snackbarProps, ...props });
  };

  const setErrorDialog = function (props: Partial<IErrorDialogProps>) {
    setErrorDialogProps({ ...errorDialogProps, ...props });
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
