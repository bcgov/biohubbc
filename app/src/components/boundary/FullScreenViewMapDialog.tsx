import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';

export interface IFullScreenViewMapProps {
  open: boolean;
  onClose: () => void;
  map: any;
  description: any;
  layers: any;
  mapTitle: string;
  backButtonTitle: string;
}

/**
 * A dialog for displaying a component for editing purposes and giving the user the option to say
 * `Yes`(Save) or `No`.
 *
 * @param {*} props
 * @return {*}
 */
export const FullScreenViewMapDialog: React.FC<IFullScreenViewMapProps> = (props) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog fullScreen open={props.open} onClose={props.onClose}>
      <AppBar position="relative" color="inherit" elevation={1}>
        <Toolbar>
          <Button
            color="primary"
            variant="text"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}
            onClick={props.onClose}>
            {props.backButtonTitle}
          </Button>
        </Toolbar>
      </AppBar>
      <Box display="flex" flex="1 1 auto" overflow="hidden">
        <Box flex="0 0 auto" p={3} width="400px" overflow="auto">
          <Box mb={3}>
            <Typography variant="h2">{props.mapTitle}</Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="body2" color="textSecondary">
              Location description
            </Typography>
            <Typography variant="body1">{props.description ? <>{props.description}</> : 'No Description'}</Typography>
          </Box>
          {props.layers}
        </Box>
        <Box flex="1 1 auto">{props.map}</Box>
      </Box>
    </Dialog>
  );
};

export default FullScreenViewMapDialog;
