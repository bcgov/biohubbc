import Alert, { AlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { ReactNode } from 'react';

interface IAlertBarProps extends AlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  variant: 'filled' | 'outlined' | 'standard';
  title: string;
  text?: string | ReactNode
}

/**
 * Returns an alert banner
 *
 * @param props {IAlertBarProps}
 * @returns {*}
 */
const AlertBar = (props: IAlertBarProps) => {
  const { severity, variant, title, text, ...alertProps } = props;

  const defaultProps = {
    severity: 'success',
    variant: 'standard',
    title: '',
    text: ''
  };

  return (
    <Alert
      {...defaultProps}
      {...alertProps}
      variant={variant}
      severity={severity}
      sx={{ flex: '1 1 auto', ...alertProps.sx }}>
      <AlertTitle>{title}</AlertTitle>
      {text}
    </Alert>
  );
};

export default AlertBar;
