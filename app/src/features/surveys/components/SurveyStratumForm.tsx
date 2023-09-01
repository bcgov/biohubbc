import { mdiClose, mdiDotsVertical, mdiPlus, mdiUnfoldMoreVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import DialogActions from '@mui/material/DialogActions';
import {  useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import yup from 'utils/YupSchema';
import { useContext, useEffect, useState } from 'react';
import { CodesContext } from 'contexts/codesContext';
import assert from 'assert';
import { Box, DialogContentText, TextField } from '@mui/material';
import ComponentDialog from 'components/dialog/ComponentDialog';

interface IStratum {
  survey_stratum_id: number | undefined;
  name: string;
  description: string;
}

interface IStratumForm {
  index: number | null;
  stratum: IStratum;
}

const StratumFormInitialValues: IStratumForm = {
  index: null,
  stratum: {
    survey_stratum_id: undefined,
    name: '',
    description: ''
  }
}

const StratumFormYupSchema = yup.object().shape({
  index: yup.number().nullable(true),
  stratum: yup.object().shape({
    survey_stratum_id: yup.number(),
    name: yup
      .string()
      .required('Must provide a stratum name')
      .max(300, 'Name cannot exceed 300 characters'),
    description: yup
      .string()
      .max(3000, 'Description cannot exceed 3000 characters'),
  })
})

interface IStratumDialogProps {
  open: boolean;
  stratumFormInitialValues: IStratumForm
  onCancel: () => void;
  onSave: (stratumForm: IStratumForm) => void;
}

const StratumDialog = (props: IStratumDialogProps) => {
  const [currentStratum, setCurrentStratum] = useState<IStratumForm>(StratumFormInitialValues);

  const formikContext = useFormikContext<IEditSurveyRequest>();
  const { values, handleSubmit } = formikContext

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentStratum({
      ...currentStratum,
      stratum: {
        ...currentStratum.stratum,
        name: event.target.value
      }
    })
  }

  const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentStratum({
      ...currentStratum,
      stratum: {
        ...currentStratum.stratum,
        description: event.target.value
      }
    })
  }

  const handleSave = () => {
    props.onSave(currentStratum)
  }

  const handleCancel = () => {
    props.onCancel();
  }

  useEffect(() => {
    setCurrentStratum(props.stratumFormInitialValues)
  }, []);

  const editing = props.stratumFormInitialValues.index !== null;

  return (
    <ComponentDialog
      open={props.open}
      dialogTitle={editing ? 'Edit Stratum Details' : 'Add Stratum'}
      onClose={props.onCancel}>
      <form onSubmit={handleSubmit}>
        <DialogContentText>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.</DialogContentText>
        <TextField
          fullWidth
          name='new-survey-stratum-name'
          variant='outlined'
          value={currentStratum.stratum.name}
          onChange={handleChangeName}
          label='Name'
        />
        <TextField
          fullWidth
          multiline
          rows={5}
          name='new-survey-stratum-description'
          variant='outlined'
          value={currentStratum.stratum.description}
          onChange={handleChangeDescription}
          label='Description'
        />
        <DialogActions>
          <Button onClick={() => handleSave()}>Save</Button>
          <Button onClick={() => handleCancel()}>Cancel</Button>
        </DialogActions>
      </form>
    </ComponentDialog>
  )
}

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveyStratumForm = () => {
  const [currentStratumForm, setCurrentStratumForm] =  useState<IStratumForm>(StratumFormInitialValues);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleSubmit, setFieldValue } = formikProps;

  const handleSave = (stratumForm: IStratumForm) => {
    if (stratumForm.index === null) {
      // Create new stratum
      setFieldValue(
        'site_selection_strategies.stratums',
        [...values.site_selection_strategies.stratums, stratumForm.stratum]
      );
    } else {
      // Edit existing stratum
      setFieldValue(`site_selection_strategies.stratums[${stratumForm.index}`, stratumForm.stratum);
    }
  }

  const handleCreateStratum = () => {
    setCurrentStratumForm(StratumFormInitialValues);
    setDialogOpen(true);
  }

  /*
  const handleRemoveStratum = (index: number) => {
    // TODO
  }

  const handleEditStratum = (index: number) => {
    // TODO
  }
  */

  return (
    <>
      <StratumDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        stratumFormInitialValues={currentStratumForm}
        onSave={handleSave}
      />
      <form onSubmit={handleSubmit}>
        <Box my={2}>
          {values.site_selection_strategies.stratums.map((stratum: IStratum, index: number) => {
            return (
              <Box mt={1} className="userRoleItemContainer">
                <Paper
                  variant="outlined"
                  // className={error ? 'userRoleItemError' : 'userRoleItem'}
                  sx={{
                    '&.userRoleItem': {
                      borderColor: 'grey.400'
                    },
                    '&.userRoleItemError': {
                      borderColor: 'error.main',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.main'
                      },
                      '& + p': {
                        pt: 0.75,
                        pb: 0.75,
                        pl: 2
                      }
                    }
                  }}>
                  <Box display="flex" alignItems="center" px={2} py={1.5}>
                    <Box flex="1 1 auto">
                    
                      <Typography variant="subtitle1" fontWeight="bold">
                        {stratum.name}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {stratum.description}
                      </Typography>
                    </Box>
                    <Box flex="0 0 auto">
                      <IconButton
                        sx={{
                          ml: 2
                        }}
                        aria-label="remove user from project team"
                        onClick={() => {
                          
                        }}>
                        <Icon path={mdiDotsVertical} size={1}></Icon>
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
                {
                //error
                }
              </Box>
            );
          })}

          <Box mt={2}>
            <Button
              data-testid="stratum-add-button"
              variant="outlined"
              color="primary"
              title="Create Stratum"
              aria-label="Create Stratum"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => handleCreateStratum()}
              >
              Add Stratum
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
};

export default SurveyStratumForm;
