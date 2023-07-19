import { Box, Button, Grid, Typography } from '@material-ui/core';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useState } from 'react';

interface ISection {
  title: string;
  comp: JSX.Element;
  bTitle?: string;
}

const sections: ISection[] = [
  { title: 'General', comp: <></> },
  { title: 'Capture History', comp: <></>, bTitle: 'Add Capture Event' },
  { title: 'Markings', comp: <></>, bTitle: 'Add Marking' },
  { title: 'Measurements', comp: <></>, bTitle: 'Add Measurement' },
  { title: 'Mortality', comp: <></>, bTitle: 'Add Mortalty' },
  { title: 'Family Relationships', comp: <></>, bTitle: 'Add Family Relationship' },
  { title: 'Images', comp: <></>, bTitle: 'Upload Image' },
  { title: 'Telemetry Device', comp: <></>, bTitle: 'Add Telemetry Device' }
];

//type ISectionTitle = (typeof sections)[number]['title'];

const IndividualAnimalForm = () => {
  //const [selectedSections, setSelectedSections] = useState<ISectionTitle>({});
  const handleSubmit = () => {
    console.log('submit');
  };

  const handleAddSection = (idx: number) => {
    //setSelectedSections([...selectedSections, idx]);
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
                {s.bTitle && (
                  <Button
                    onClick={() => handleAddSection(i)}
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
