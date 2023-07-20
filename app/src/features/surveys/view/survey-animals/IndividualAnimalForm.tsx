import { Box, Button, Grid, Typography } from '@mui/material';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useState, useReducer } from 'react';

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
  { title: eSection.general, comp: <>g</> },
  { title: eSection.captures, comp: <>c</>, bTitle: 'Add Capture Event' },
  { title: eSection.markings, comp: <>m</>, bTitle: 'Add Marking' },
  { title: eSection.measurements, comp: <>d</>, bTitle: 'Add Measurement' },
  { title: eSection.mortality, comp: <>m</>, bTitle: 'Add Mortalty' },
  { title: eSection.family, comp: <>f</>, bTitle: 'Add Family Relationship' },
  { title: eSection.images, comp: <>i</>, bTitle: 'Upload Image' },
  { title: eSection.telemetry, comp: <>t</>, bTitle: 'Add Telemetry Device' }
];

type ISelectedSection = Partial<Record<eSection, boolean>>;

const IndividualAnimalForm = () => {
  const [selectedSections, addSelectedSection] = useState<ISelectedSection>({ [eSection.general]: true });
  const handleSubmit = () => {
    console.log('submit');
  };

  const handleAddSection = (section: eSection) => {
    addSelectedSection((s) => ({ ...s, [section]: true }));
  };

  return (
    <form data-testid="individual-animal-form" onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Grid container spacing={3}>
          {sections.map((s, i) => {
            return (
              <Grid item xs={12} key={`${i}-${s.title}`}>
                <Typography id={`${s.title}`} component="legend">
                  {s.title}
                </Typography>
                {selectedSections && selectedSections[s.title] ? (
                  s.comp
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
    </form>
  );
};

export default IndividualAnimalForm;
