import { mdiClose, mdiDotsVertical, mdiPlus, mdiUnfoldMoreVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import {  useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import yup from 'utils/YupSchema';
import { useContext, useState } from 'react';
import { CodesContext } from 'contexts/codesContext';
import assert from 'assert';
import { Box, DialogContentText, TextField } from '@mui/material';
import ComponentDialog from 'components/dialog/ComponentDialog';

interface IStratum {
  survey_stratum_id: number | undefined;
  name: string;
  description: string;
}

interface IStratumDialogProps {
  open: boolean;
  editing: boolean;
  stratumIndex: number | null;
  onClose: () => void;
}

const StratumDialog = (props: IStratumDialogProps) => {
  const handleChangeName = () => {
    //
  }

  const handleChangeDescription = () => {
    //
  }

  const formikContext = useFormikContext<IEditSurveyRequest>();
  const { values } = formikContext

  return (
    <ComponentDialog
      open={props.open}
      dialogTitle={props.editing ? 'Edit Stratum Details' : 'Add Stratum'}
      onClose={props.onClose}>
      <>
        <DialogContentText>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.</DialogContentText>
        <TextField
          fullWidth
          name={`site_selection_strategies.stratums[${props.stratumIndex}].name`}
          variant='outlined'
          value={props.stratumIndex ? values.site_selection_strategies.stratums[props.stratumIndex].name : undefined}
          onChange={handleChangeName}
          label='Name'
        />
        <TextField
          fullWidth
          multiline
          rows={5}
          name={`site_selection_strategies.stratums[${props.stratumIndex}].description`}
          variant='outlined'
          value={props.stratumIndex ? values.site_selection_strategies.stratums[props.stratumIndex].description : undefined}
          onChange={handleChangeDescription}
          label='Description'
        />

      </>
    </ComponentDialog>
  )
}

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveyStratumForm = () => {
  const [stratumIndex, setStratumIndex] =  useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleSubmit, setFieldValue } = formikProps;

  const handleCreateStratum = () => {
    setFieldValue(
      'site_selection_strategies.stratums',
      [
        ...values.site_selection_strategies.stratums, { name: '', description: '' }
      ]
    );

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
    <form onSubmit={handleSubmit}>
      <StratumDialog
        open={stratumIndex !== null}
        onClose={() => {}}
        stratumIndex={stratumIndex}
        editing={false}
      />
      <Box my={2}>
        {values.site_selection_strategies.stratums.map((stratum, index: number) => {
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
  );
};

export default SurveyStratumForm;
