import { Box, Button, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import AnimalGeneralSection from './form-sections/AnimalGeneralSection';
import { AnimalFormProvider, IAnimalKey, useAnimalFormData } from './useAnimalFormData';
import { Formik } from 'formik';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';

interface ISection {
  title: string;
  comp: JSX.Element;
  bTitle?: string;
}

type IAnimalFormSections = Record<IAnimalKey, ISection>;

type IFormSectionState = Record<IAnimalKey, JSX.Element[]>;

/**
 * The rendered sections to display in component.
 * Reducing duplicated code / styling in component return.
 */

const SECTIONS: IAnimalFormSections = {
  general: { title: 'General', comp: <AnimalGeneralSection /> },
  capture: { title: 'Capture Information', comp: <>c</>, bTitle: 'Add Capture Event' },
  marking: { title: 'Markings', comp: <>m</>, bTitle: 'Add Marking' },
  measurement: { title: 'Measurements', comp: <>d</>, bTitle: 'Add Measurement' },
  mortality: { title: 'Mortality', comp: <>m</>, bTitle: 'Add Mortalty' },
  family: { title: 'Family Relationships', comp: <>f</>, bTitle: 'Add Family Relationship' },
  image: { title: 'Images', comp: <>i</>, bTitle: 'Upload Image' },
  device: { title: 'Telemetry Device', comp: <>t</>, bTitle: 'Add Telemetry Device' }
};

/**
 * Renders The 'Individual Animals' Form displayed in Survey view
 * Note: Data handled by useAnimalFormData hook.
 * Lots of conditionally rendered sections.
 *
 * returns {*}
 */
const AnimalForm = () => {
  const { updateAnimal } = useAnimalFormData();
  const [formSections, setFormSection] = useState<IFormSectionState>({
    general: [SECTIONS.general.comp],
    capture: [],
    marking: [],
    measurement: [],
    mortality: [],
    family: [],
    image: [],
    device: []
  });

  const handleSubmit = () => {
    console.log('submit');
  };

  const handleRemoveSection = (key: IAnimalKey, idx: number) => {
    updateAnimal({ type: key, operation: 'REMOVE', payload: idx });
    formSections[key].splice(idx, 1);
    setFormSection({ ...formSections });
  };

  const handleAddSection = (key: IAnimalKey) => {
    const componentToAdd = SECTIONS[key].comp;
    formSections[key].push(componentToAdd);
    setFormSection({ ...formSections });
  };

  return (
    <Formik onSubmit={handleSubmit} initialValues={{}}>
      <Box component="fieldset">
        <Grid container spacing={3}>
          {Object.keys(SECTIONS).map((k, i) => {
            const key = k as IAnimalKey;
            const section = SECTIONS[key];
            const isGeneralSection = section.title === 'General';
            return (
              <Grid item xs={12} key={`${i}-${section.title}`}>
                <Typography id={`${section.title}`} component="legend">
                  <HelpButtonTooltip content={section.title}>{section.title}</HelpButtonTooltip>
                </Typography>
                <Grid container spacing={2} direction="column">
                  {formSections[key] && (
                    <Grid item>
                      {formSections[key].map((inputs, fsIdx) => (
                        <>
                          {!isGeneralSection && <button onClick={() => handleRemoveSection(key, fsIdx)}>delete</button>}
                          {inputs}
                        </>
                      ))}
                    </Grid>
                  )}
                  {!isGeneralSection && (
                    <Grid item>
                      <Button
                        onClick={() => handleAddSection(key)}
                        startIcon={<Icon path={mdiPlus} size={1} />}
                        variant="outlined"
                        color="primary">
                        {section.bTitle}
                      </Button>
                    </Grid>
                  )}
                </Grid>
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
