import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface IAlertBarProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  variant: 'filled' | 'outlined' | 'standard';
  title: string;
  text: string | JSX.Element;
  startCollapsed?: boolean;
}

const AlertBar = (props: IAlertBarProps) => {
  const { severity, variant, title, text, startCollapsed } = props;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(startCollapsed ?? false);

  return (
    <>
      <Alert
        variant={variant}
        severity={severity}
        sx={{ flex: '1 1 auto', '& .MuiAlert-message': { flex: '1 1 auto' } }}>
        <Box
          display="flex"
          position="relative"
          justifyContent="space-between"
          flex="1 1 auto"
          onClick={() => setIsCollapsed((prev) => !prev)}
          sx={{ cursor: 'pointer' }}>
          <AlertTitle>{title}</AlertTitle>
          <IconButton sx={{ position: 'absolute', right: 0, p: 0.5 }}>
            <Icon path={isCollapsed ? mdiChevronDown : mdiChevronUp} size={1} />
          </IconButton>
        </Box>
        <TransitionGroup>
          {!isCollapsed && (
            <Collapse>
              <Box>{text}</Box>
            </Collapse>
          )}
        </TransitionGroup>
      </Alert>
    </>
  );
};

AlertBar.defaultProps = {
  severity: 'success',
  variant: 'standard',
  title: '',
  text: ''
};

export default AlertBar;
