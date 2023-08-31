import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import {  useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import yup from 'utils/YupSchema';
import { useContext } from 'react';
import { CodesContext } from 'contexts/codesContext';
import assert from 'assert';
import { Box } from '@mui/material';

interface IStratum {
  survey_stratum_id: number | undefined;
  name: string;
  description: string;
}

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveyStratumForm = () => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleChange, handleSubmit } = formikProps;

  const codesContext = useContext(CodesContext);
  assert(codesContext.codesDataLoader.data);

  const siteStrategies = codesContext.codesDataLoader.data.site_strategies.map((code) => {
    return { label: code.name, value: code.name };
  });

  console.log({ siteStrategies })

  return (
    <form onSubmit={handleSubmit}>
      {values.site_selection_strategies.stratums.map((stratum) => {
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
                      // handleRemove(user.system_user_id);
                    }}>
                    <Icon path={mdiClose} size={1}></Icon>
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
          // onClick={() => arrayHelpers.push(SurveySiteSelectionInitialValues)}
          >
          Add Stratum
        </Button>
       </Box>
    </form>
  );
};

export default SurveyStratumForm;
