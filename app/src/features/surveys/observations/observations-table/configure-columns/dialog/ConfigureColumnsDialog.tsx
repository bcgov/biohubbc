import { mdiCog, mdiLeaf, mdiRuler } from '@mdi/js';
import { LoadingButton } from '@mui/lab';
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Typography } from '@mui/material';
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

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { maxWidth: 1200, minHeight: '75vh' } }}
        fullWidth
        open={props.open}
        onClose={props.onClose}
        data-testid="yes-no-dialog"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          Configure Columns
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            Customize the columns in your table to upload additional data, such as environmental variables and species
            measurements.
          </Typography>
        </DialogTitle>
        <DialogContent id="configure-dialog-content">
          <Grid container xs={12} justifyContent="space-between" pr={2}>
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
            <Divider orientation="vertical" flexItem/>
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
