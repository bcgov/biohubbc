import { mdiCog, mdiLeaf, mdiRuler } from '@mdi/js';
import { LoadingButton } from '@mui/lab';
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid } from '@mui/material';
import { useState } from 'react';
import { ConfigureColumnsViewEnum } from '../ConfigureColumnsContainer';
import ConfigureColumnsContentContainer from './components/ConfigureColumnsContent';
import ConfigureColumnsToolbar from './components/ConfigureColumnsToolbar';

interface IConfigureColumnsDialogProps {
  open: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
}

const ConfigureColumnsDialog = (props: IConfigureColumnsDialogProps) => {
  const [activeView, setActiveView] = useState(ConfigureColumnsViewEnum.MEASUREMENTS);
  console.log(props);

  return (
    <>
      <Dialog
        sx={{ '& .MuiPaper-root': { maxWidth: 1000} }}
        fullWidth
        open={props.open}
        onClose={props.onClose}
        data-testid="yes-no-dialog"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Configure columns</DialogTitle>
        <DialogContent>
          <Grid container xs={12} justifyContent="space-between" minHeight={400} pr={2}>
            <Grid item xs={3}>
              <ConfigureColumnsToolbar
                activeView={activeView}
                updateActiveView={setActiveView}
                views={[
                  {
                    label: `General`,
                    value: ConfigureColumnsViewEnum.GENERAL,
                    icon: mdiCog,
                    isLoading: false
                  },
                  {
                    label: `Measurements`,
                    value: ConfigureColumnsViewEnum.MEASUREMENTS,
                    icon: mdiRuler,
                    isLoading: false
                  },
                  {
                    label: `Environment`,
                    value: ConfigureColumnsViewEnum.ENVIRONMENT,
                    icon: mdiLeaf,
                    isLoading: false
                  }
                ]}
              />
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={8}>
              <ConfigureColumnsContentContainer activeView={activeView} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            onClick={props.onSave}
            color="primary"
            variant="contained"
            autoFocus
            data-testid="edit-dialog-save">
            Save
          </LoadingButton>
          <LoadingButton data-testid="no-button" onClick={props.onClose} color="primary" variant="outlined">
            Close
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfigureColumnsDialog;
