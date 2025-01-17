import Alert, { AlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

interface IAlertBarProps extends AlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  variant: 'filled' | 'outlined' | 'standard';
  title: string;
  text: string | JSX.Element;
  ornament?: JSX.Element;
}

/**
 * Returns an alert banner
 *
 * @param props {IAlertBarProps}
 * @returns {*}
 */
const AlertBar = (props: IAlertBarProps) => {
  const { severity, variant, title, text, ornament, ...alertProps } = props;

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
      sx={{ flex: '1 1 auto', '& .MuiAlert-message': { flex: '1 1 auto' }, ...alertProps.sx }}>
      <AlertTitle sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flex: '1 1 auto' }}>
        {title}
        <Typography component="span" variant="body2">
          {ornament}
        </Typography>
      </AlertTitle>
      {text}
    </Alert>
  );
};

export default AlertBar;
