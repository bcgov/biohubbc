import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { TransitionGroup } from 'react-transition-group';

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const TechniqueAttractantsForm = () => {
  const codesContext = useCodesContext();

  const { values, setFieldValue } = useFormikContext<ICreateTechniqueRequest>();

  if (!codesContext.codesDataLoader.data) {
    return <></>;
  }

  const attractants = codesContext.codesDataLoader.data.attractants;

  console.log(values);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography component="legend">Attractants (optional)</Typography>
          <AutocompleteField
            id="technique_attractant_id"
            label="Enter an attractant"
            name="attractants"
            loading={codesContext.codesDataLoader.isLoading}
            options={
              attractants
                .map((option) => ({
                  value: option.id,
                  label: option.name,
                  description: option.description
                }))
                .filter((option) => !values.attractants?.includes(option.value)) ?? []
            }
            onChange={(_, value) => {
              console.log([...values.attractants, value?.value]);
              if (value?.value) {
                setFieldValue('attractants', [...values.attractants, value.value]);
              }
            }}
            onInputChange={(_, __, ___) => {}}
          />
        </Grid>
        <Grid item xs={12}>
          <TransitionGroup>
            {values.attractants.map((attractant, index) => {
              const lookup = attractants.find((option) => option.id === attractant);
              return (
                <Collapse key={attractant}>
                  <Paper
                    variant="outlined"
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      mb: 1,
                      background: grey[100],
                      flex: '1 1 auto',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                    <Box>
                      <Typography fontWeight={700}>{lookup?.name}</Typography>
                      <Typography color="textSecondary" variant="body2">
                        {lookup?.description}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        data-testid={`remove-attractant-button-${index}`}
                        sx={{
                          ml: 2
                        }}
                        aria-label="remove attractant"
                        onClick={() => {
                          setFieldValue(
                            'attractants',
                            values.attractants.length > 1 ? values.attractants.filter((id) => id !== attractant) : []
                          );
                        }}>
                        <Icon path={mdiClose} size={1} />
                      </IconButton>
                    </Box>
                  </Paper>
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Grid>
      </Grid>
    </>
  );
};

export default TechniqueAttractantsForm;