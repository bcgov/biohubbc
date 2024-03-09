import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
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

  const [formMode, setFormMode] = useState<ANIMAL_FORM_MODE | undefined>(undefined);
  const [formObject, setFormObject] = useState<any | undefined>(undefined);

  const handleOpenAddForm = () => {
    setFormMode(ANIMAL_FORM_MODE.ADD);
  };

  const handleOpenEditForm = (editObject: any) => {
    setFormObject(editObject);
    setFormMode(ANIMAL_FORM_MODE.EDIT);
  };

  const handleCloseForm = () => {
    setFormObject(undefined);
    setFormMode(undefined);
    // reset critter here
  };

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
    formMode: formMode ? formMode : ANIMAL_FORM_MODE.ADD,
    formObject: formObject ? formObject : undefined,
    critter: critter,
    open: !!formMode,
    handleClose: () => {
      handleCloseForm();
      console.log('Reset form here / get detailed critter.');
    }
  } as const;

  if (section === 'General') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        //content={<GeneralAnimalSummary handleEdit={() => console.log('edit animal placeholder')} />}
        section={section}
        critter={critter}
      />
    );
  }

  if (section === 'Ecological Units') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}
      />
    );
  }

  if (section === 'Markings') {
    return (
      <AnimalSectionWrapper
        form={<MarkingAnimalForm {...formProps} />}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}>
        <TransitionGroup>
          {critter.markings.map((marking) => (
            <Collapse>
              <EditDeleteStubCard
                header={'Marking'}
                subHeader={'marking'}
                onClickEdit={() => handleOpenEditForm(marking)}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (section === 'Measurements') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}
      />
    );
  }

  if (section === 'Mortality Events') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}
      />
    );
  }

  if (section === 'Family') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}
      />
    );
  }

  if (section === 'Capture Events') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}
      />
    );
  }

  if (section === 'Telemetry') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        section={section}
        openAddForm={handleOpenAddForm}
        critter={critter}
      />
    );
  }

  return null;
};
