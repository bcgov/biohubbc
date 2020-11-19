import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  Grid,
  InputLabel,
  List,
  ListItem,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Switch
} from '@material-ui/core';
import { Add, DeleteForever } from '@material-ui/icons';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';

interface IPointOfInterestChoices {
  pointOfInterestType: string;
  includePhotos: boolean;
  includeForms: boolean;
  startDate: string;
  endDate: string;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  pointOfInterestChoice: {
    padding: theme.spacing(2)
  }
}));

export const PointOfInterestDataFilter: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [pointOfInterestChoices, setPointOfInterestChoices] = useState([]);

  const getPointOfInterestChoicesFromTrip = async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip'
      }
    });
    if (docs.docs.length > 0) {
      let tripDoc = docs.docs[0];
      if (tripDoc.pointOfInterestChoices) {
        setPointOfInterestChoices([...tripDoc.pointOfInterestChoices]);
      }
    }
  };
  useEffect(() => {
    const updateComponent = () => {
      getPointOfInterestChoicesFromTrip();
    };
    updateComponent();
  }, [databaseChangesContext]);

  const saveChoices = async (newPointOfInterestChoices) => {
    await databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, pointOfInterestChoices: newPointOfInterestChoices };
    });
  };

  const addPointOfInterestChoice = (newPointOfInterest: IPointOfInterestChoices) => {
    saveChoices([...pointOfInterestChoices, newPointOfInterest]);
  };

  const updatePointOfInterestChoice = (updatedPointOfInterest: IPointOfInterestChoices, index: number) => {
    let updatedPointOfInterestChoices = pointOfInterestChoices;
    updatedPointOfInterestChoices[index] = updatedPointOfInterest;
    saveChoices([...updatedPointOfInterestChoices]);
  };

  const deletePointOfInterestChoice = (index: number) => {
    let copy = [...pointOfInterestChoices];
    copy.splice(index, 1);
    saveChoices(copy);
  };

  const classes = useStyles();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <List>
          {pointOfInterestChoices.map((pointOfInterestChoice, index) => {
            return (
              <ListItem key={index}>
                <Paper className={classes.pointOfInterestChoice}>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <div>
                        <InputLabel id="demo-simple-select-label">Point Of Interest Type</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={pointOfInterestChoice.pointOfInterestType}
                          onChange={(e) => {
                            updatePointOfInterestChoice(
                              { ...pointOfInterestChoice, pointOfInterestType: e.target.value },
                              index
                            );
                          }}>
                          <MenuItem value={''}>All</MenuItem>
                          <MenuItem value={'IAPP Site'}>IAPP Site</MenuItem>
                          <MenuItem value={'Well'}>Well</MenuItem>
                        </Select>
                      </div>
                    </Grid>
                    <Grid item xs={4}>
                      <InputLabel>Photos</InputLabel>
                      <Switch
                        color="primary"
                        checked={pointOfInterestChoice.includePhotos}
                        onChange={() => {
                          updatePointOfInterestChoice(
                            { ...pointOfInterestChoice, includePhotos: !pointOfInterestChoice.includePhotos },
                            index
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <InputLabel>Forms</InputLabel>
                      <Switch
                        color="primary"
                        checked={pointOfInterestChoice.includeForms}
                        onChange={() => {
                          updatePointOfInterestChoice(
                            { ...pointOfInterestChoice, includeForms: !pointOfInterestChoice.includeForms },
                            index
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Earliest Date"
                        value={pointOfInterestChoice.startDate}
                        onChange={(e) => {
                          updatePointOfInterestChoice({ ...pointOfInterestChoice, startDate: e }, index);
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date start'
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Latest Date"
                        value={pointOfInterestChoice.endDate}
                        onChange={(e) => {
                          updatePointOfInterestChoice({ ...pointOfInterestChoice, endDate: e }, index);
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date end'
                        }}
                      />
                    </Grid>
                    <Grid container item justify="flex-end">
                      <Button
                        variant="contained"
                        startIcon={<DeleteForever />}
                        onClick={() => deletePointOfInterestChoice(index)}>
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </ListItem>
            );
          })}
        </List>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            addPointOfInterestChoice({
              pointOfInterestType: '',
              includePhotos: false,
              includeForms: false,
              startDate: null,
              endDate: null
            });
          }}>
          Add New
        </Button>
      </MuiPickersUtilsProvider>
    </>
  );
};

export default PointOfInterestDataFilter;
