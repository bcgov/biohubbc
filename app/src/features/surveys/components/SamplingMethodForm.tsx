import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';
import CreateSamplingMethod from './CreateSamplingMethod';

const SamplingMethodForm = () => {
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();
  const { values } = formikProps;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  console.log(values.methods.length);
  return (
    <>
      <CreateSamplingMethod
        open={isCreateModalOpen}
        onSubmit={(data) => {
          console.log(data);
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

        {/* {values.methods.map((item) => {
            
          })} */}

        <form>
          <Button
            sx={{
              mt: 1
            }}
            data-testid="sample-method-add-button"
            variant="outlined"
            color="primary"
            title="Add Sample Method"
            aria-label="Add Sample Method"
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
