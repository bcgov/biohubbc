import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Icon from '@mdi/react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { mdiArrowLeft } from '@mdi/js';

export interface IViewMapProps {
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
export const ViewMapDialog: React.FC<IViewMapProps> = (props) => {
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
      <Box display="flex" flex="1 1 auto">
        <Box flex="0 0 auto" p={3} width="400px">
          <Box mb={3}>
            <Typography variant="h2">{props.mapTitle}</Typography>
          </Box>
          <Typography variant="h3">Location description</Typography>
          <Typography variant="body1">{props.description ? <>{props.description}</> : 'No Description'}</Typography>
          {props.layers}
        </Box>
        <Box flex="1 1 auto">{props.map}</Box>
      </Box>
    </Dialog>
  );
};

export default ViewMapDialog;
