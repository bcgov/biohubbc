import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  inputRow: {
    whiteSpace: 'nowrap'
  },
  inputWidth: {
    width: '120px'
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
  
}));

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

const ObservationsDialog: React.FC = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Add Survey
      </Button>

      <Dialog aria-labelledby="simple-dialog-title"open={open} onClose={handleClose} fullScreen>
        <Box className={classes.dialogTitle} p={3}>
          <Typography variant="h2">Moose Survey Form</Typography>
          <Button variant="contained" color="primary" onClick={handleClose}>Close</Button>
        </Box>
        <Divider></Divider>
        <Box p={3}>

          <Grid container spacing={6}>
            
            {/* BOX INFORMATION */}
            <Grid item xs={6}>
              <fieldset>
                <Box component="legend" mb={2}><b>Block Information</b></Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Block ID"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Block Size"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                      <TextField
                        label="Date"
                        type="number"
                        size="small"
                        variant="outlined"
                        fullWidth>
                      </TextField>
                    </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Start Time"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="End Time"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                </Grid>
                <Box component="fieldset" mt={4}>
                  <Box component="legend" mb={2}><b>Conditions</b></Box>
                  <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <TextField
                          label="Visibility"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Light"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Cloud Cover"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={2}>
                        <TextField
                          label="Temperature"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          label="Precipitation"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          label="Wind Speed"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={2}>
                        <TextField
                          label="Snow Cover"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          label="Snow Depth"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          label="Days Since Snowfall"
                          type="number"
                          size="small"
                          variant="outlined"
                          fullWidth>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                </Box>

              </fieldset>
            </Grid>

            {/* PARTICIPANTS */}
            <Grid item xs={6}>
              <Box component="fieldset">
                <Box component="legend" mb={2}><b>Flight Information</b></Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Pilot"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Navigator"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Left Observer"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Right Observer"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
              <Box component="fieldset" mt={4}>
                <Box component="legend" mb={2}><b>Aircraft Details</b></Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Company"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Aircraft Type"
                      type="number"
                      size="small"
                      variant="outlined"
                      fullWidth>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                      <TextField
                        label="Registration Number"
                        type="number"
                        size="small"
                        variant="outlined"
                        fullWidth>
                      </TextField>
                    </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          <Box component="fieldset" mt={6}>
            <Box component="legend" mb={2}><b>Observations</b></Box>
            <Grid container spacing={2}>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Waypoint"
                    type="number"
                    variant="outlined" 
                    fullWidth>
                  </TextField>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Bulls"
                    type="number"
                    variant="outlined" 
                    fullWidth>
                  </TextField>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Cows"
                    type="number"
                    variant="outlined" 
                    fullWidth>
                  </TextField>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Lone Calves"
                    type="number"
                    variant="outlined" 
                    fullWidth>
                  </TextField>
                </Grid>
                <Grid item xs={2}>
                  <FormControl
                    variant="outlined"
                    size="small"
                    fullWidth>
                    <InputLabel>Activity</InputLabel>
                    <Select>
                      <MenuItem value={10}>Bedding</MenuItem>
                      <MenuItem value={20}>Moving</MenuItem>
                      <MenuItem value={30}>Standing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Veg Cover"
                    type="number"
                    variant="outlined" 
                    fullWidth>
                  </TextField>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Snow Cover"
                    type="number"
                    variant="outlined" 
                    fullWidth>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Comments"
                    variant="outlined"
                    fullWidth>
                  </TextField>
                </Grid>
              </Grid>
            <Grid container spacing={2}>
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="Waypoint"
                  type="number"
                  variant="outlined" 
                  fullWidth>
                </TextField>
              </Grid>
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="Bulls"
                  type="number"
                  variant="outlined" 
                  fullWidth>
                </TextField>
              </Grid>
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="Cows"
                  type="number"
                  variant="outlined" 
                  fullWidth>
                </TextField>
              </Grid>
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="Lone Calves"
                  type="number"
                  variant="outlined" 
                  fullWidth>
                </TextField>
              </Grid>
              <Grid item xs={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth>
                  <InputLabel>Activity</InputLabel>
                  <Select>
                    <MenuItem value={10}>Bedding</MenuItem>
                    <MenuItem value={20}>Moving</MenuItem>
                    <MenuItem value={30}>Standing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="Veg Cover"
                  type="number"
                  variant="outlined" 
                  fullWidth>
                </TextField>
              </Grid>
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="Snow Cover"
                  type="number"
                  variant="outlined" 
                  fullWidth>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  label="Comments"
                  variant="outlined"
                  fullWidth>
                </TextField>
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button variant="contained" color="primary">Add Row</Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
};

export default ObservationsDialog;
