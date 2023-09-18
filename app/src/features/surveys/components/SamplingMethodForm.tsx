import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import CreateSamplingMethod from './CreateSamplingMethod';

const SamplingMethodForm = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <>
      <CreateSamplingMethod
        open={isCreateModalOpen}
        onSubmit={(data) => {
          setIsCreateModalOpen(false);
        }}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
      />
      <Box component="fieldset">
        <Typography component="legend">Specify Sampling Methods</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '72ch'
          }}>
          Methods defined below will be applied to all imported sampling sites boundaries. This information can be
          modified later if required.
        </Typography>

        <form>
          <Button
            sx={{
              mt: 1
            }}
            data-testid="stratum-add-button"
            variant="outlined"
            color="primary"
            title="Create Stratum"
            aria-label="Create Stratum"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => {
              setIsCreateModalOpen(true);
            }}>
            Add Method
          </Button>
        </form>
      </Box>
    </>
  );
};

export default SamplingMethodForm;
