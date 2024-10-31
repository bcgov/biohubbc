import Alert, { AlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

interface IAlertBarProps extends AlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  variant: 'filled' | 'outlined' | 'standard';
  title: string;
  text: string | JSX.Element;
}

/**
 * Returns an alert banner
 *
 * @param props {IAlertBarProps}
 * @returns
 */
const AlertBar = (props: IAlertBarProps) => {
  const { severity, variant, title, text, ...alertProps } = props;

  return (
    <Alert {...alertProps} variant={variant} severity={severity} sx={{ flex: '1 1 auto', mb: 1, ...alertProps.sx }}>
      <AlertTitle>{title}</AlertTitle>
      {text}
    </Alert>
  );
};

AlertBar.defaultProps = {
  severity: 'success',
  variant: 'standard',
  title: '',
  text: ''
};

export default AlertBar;
