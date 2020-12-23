import { Button, Grid } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React from 'react';
import { useHistory } from 'react-router';

export interface IEditFormControlsComponentProps {
  onSubmit?: Function;
  isDisabled?: boolean;
}

const EditFormControlsComponent: React.FC<IEditFormControlsComponentProps> = (props) => {
  const history = useHistory();

  const isDisabled = props.isDisabled || false;

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item spacing={3}>
          <Grid item>
            <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={() => history.goBack()}>
              Back to Projects
            </Button>
          </Grid>
          <Grid item>
            <Button disabled={isDisabled} variant="contained" color="primary" onClick={() => props.onSubmit()}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default EditFormControlsComponent;
