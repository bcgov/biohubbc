import { Box, Typography } from '@mui/material';
import { Form } from 'formik';
import React from 'react';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

/**
 * Renders The 'Individual Animals' Form displayed in Survey view
 * Note: Data handled by useAnimalFormData hook.
 * Lots of conditionally rendered sections.
 *
 * returns {*}
 */

const IndividualAnimalForm = () => {
  return (
    <Form>
      <Typography variant="h5">Add New Individual</Typography>
      <Box component="fieldset">
        <GeneralAnimalForm />
        <CaptureAnimalForm />
        <MortalityAnimalForm />
        <MarkingAnimalForm />
        <MeasurementAnimalForm />
        <FamilyAnimalForm />
      </Box>
    </Form>
  );
};

export default IndividualAnimalForm;
