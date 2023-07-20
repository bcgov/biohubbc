import { Box, Button, Grid, Typography } from '@mui/material';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useState } from 'react';
import AnimalGeneralSection from './form-sections/AnimalGeneralSection';
import { AnimalFormProvider, useAnimalFormData } from './useAnimalFormData';
import { Formik } from 'formik';

enum eSection {
  general = 'General',
  captures = 'Capture History',
  markings = 'Markings',
  measurements = 'Measurements',
  mortality = 'Mortality',
  family = 'Family Relationship',
  images = 'Images',
  telemetry = 'Telemetry'
}

interface ISection {
  title: eSection;
  comp: JSX.Element;
  bTitle?: string;
}

const sections: ISection[] = [
  { title: eSection.general, comp: <AnimalGeneralSection /> },
  { title: eSection.captures, comp: <>c</>, bTitle: 'Add Capture Event' },
  { title: eSection.markings, comp: <>m</>, bTitle: 'Add Marking' },
  { title: eSection.measurements, comp: <>d</>, bTitle: 'Add Measurement' },
  { title: eSection.mortality, comp: <>m</>, bTitle: 'Add Mortalty' },
  { title: eSection.family, comp: <>f</>, bTitle: 'Add Family Relationship' },
  { title: eSection.images, comp: <>i</>, bTitle: 'Upload Image' },
  { title: eSection.telemetry, comp: <>t</>, bTitle: 'Add Telemetry Device' }
];

type ISelectedSection = Partial<Record<eSection, boolean>>;

const AnimalForm = () => {
  const { data, updateData } = useAnimalFormData();
  console.log(data, updateData);
  const [selectedSections, addSelectedSection] = useState<ISelectedSection>({ [eSection.general]: true });
  const handleSubmit = () => {
    console.log('submit');
  };

  const handleAddSection = (section: eSection) => {
    addSelectedSection((s) => ({ ...s, [section]: true }));
  };

  return (
    <Formik onSubmit={handleSubmit} initialValues={{}}>
      <Box component="fieldset">
        <Grid container spacing={3}>
          {sections.map((s, i) => {
            return (
              <Grid item xs={12} key={`${i}-${s.title}`}>
                <Typography id={`${s.title}`} component="legend">
                  {s.title}
                </Typography>
                {selectedSections && selectedSections[s.title] ? (
                  <Grid container spacing={2}>
                    {s.comp}
                  </Grid>
                ) : (
                  <Button
                    onClick={() => handleAddSection(s.title)}
                    startIcon={<Icon path={mdiPlus} size={1} />}
                    variant="outlined"
                    color="primary">
                    {s.title}
                  </Button>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Formik>
  );
};

const IndividualAnimalForm = () => (
  <AnimalFormProvider>
    <AnimalForm />
  </AnimalFormProvider>
);
export default IndividualAnimalForm;
