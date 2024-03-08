import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { ANIMAL_FORM_MODE } from './animal';
import { IAnimalSections } from './animal-sections';
import { AnimalSectionWrapper } from './AnimalSectionWrapper';
import { MarkingAnimalForm } from './form-sections/MarkingAnimalForm';

interface IAnimalSectionProps {
  critter?: IDetailedCritterWithInternalId;
  section: IAnimalSections;
}
export const AnimalSection = (props: IAnimalSectionProps) => {
  const { section, critter } = props;

  const [openForm, setOpenForm] = useState(false);

  if (!critter) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flex="1 1 auto"
        p={3}
        sx={{
          overflowY: 'auto',
          background: grey[100]
        }}>
        <Typography component="span" variant="body2">
          No Animal Selected
        </Typography>
      </Box>
    );
  }

  const formProps = {
    formMode: ANIMAL_FORM_MODE.ADD,
    critter: critter,
    open: openForm,
    handleClose: () => {
      setOpenForm(false);
      console.log('Reset form here / get detailed critter.');
    }
  } as const;

  if (section === 'General') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        critter={critter}
      />
    );
  }

  if (section === 'Ecological Units') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  if (section === 'Markings') {
    return (
      <AnimalSectionWrapper
        form={<MarkingAnimalForm {...formProps} />}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  if (section === 'Measurements') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  if (section === 'Mortality Events') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  if (section === 'Family') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  if (section === 'Capture Events') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  if (section === 'Telemetry') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        content={<div>test</div>}
        section={section}
        openAddForm={() => setOpenForm(true)}
        critter={critter}
      />
    );
  }

  return null;
};
