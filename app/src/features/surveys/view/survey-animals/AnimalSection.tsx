import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { ANIMAL_FORM_MODE } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';
import { MarkingAnimalForm } from './form-sections/MarkingAnimalForm';

interface IAnimalSectionProps {
  critter?: IDetailedCritterWithInternalId;
  section: IAnimalSections;
}
export const AnimalSection = (props: IAnimalSectionProps) => {
  const { section, critter } = props;
  const sectionData = ANIMAL_SECTIONS_FORM_MAP[section];

  const [openForm, setOpenForm] = useState(false);

  const renderCritterAddAttributeForm = () => {
    if (!critter) {
      return;
    }
    const formProps = {
      formMode: ANIMAL_FORM_MODE.ADD,
      critter: critter,
      open: openForm,
      critterID: critter.critter_id,
      handleClose: () => {
        setOpenForm(false);
        console.log('Reset form here / get detailed critter.');
      }
    } as const;

    if (section === 'Markings') {
      return <MarkingAnimalForm {...formProps} />;
    }
  };

  return (
    <>
      {renderCritterAddAttributeForm()}
      <Paper component={Stack} position="absolute" top={0} right={0} bottom={0} left={0} overflow="hidden">
        <Toolbar
          disableGutters
          sx={{
            px: 2
          }}>
          <Typography variant="h3" component="h2">
            {critter?.animal_id ? `Animal Details > ${critter?.animal_id}` : 'No animal selected'}
          </Typography>
        </Toolbar>

        <Divider flexItem></Divider>

        {critter?.critter_id ? (
          <Box
            flex="1 1 auto"
            p={5}
            sx={{
              overflowY: 'auto',
              background: grey[100]
            }}>
            <Box
              sx={{
                maxWidth: '1200px',
                mx: 'auto'
              }}>
              <Box display="flex" flexDirection="row" alignItems="flex-start" mb={2}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    flex: '1 1 auto'
                  }}>
                  {section}
                </Typography>
                <Button
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenForm(true)}>
                  {sectionData.addBtnText}
                </Button>
                {/*
              {!ANIMAL_SECTIONS_FORM_MAP[section]?.addBtnText ||
              (section === 'Mortality Events' && initialValues.mortality.length >= 1) ? null : (
                <Button
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setFormMode(ANIMAL_FORM_MODE.ADD);
                    const animalData = ANIMAL_SECTIONS_FORM_MAP[section];
                    const sectionValues = values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName];
                    const defaultValue = animalData?.defaultFormValue();
                    setSelectedIndex((sectionValues as any)['length'] ?? 0);
                    formikArrayHelpers.push(defaultValue);
                    setShowDialog(true);
                  }}>
                  {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                </Button>
              )}
              */}
              </Box>

              <Typography
                variant="body1"
                color="textSecondary"
                maxWidth={'88ch'}
                sx={{
                  mb: 5
                }}>
                {sectionData.infoText}
              </Typography>

              {/*
            <AnimalSectionDataCards
              key={section}
              onEditClick={(idx) => {
                //setSelectedIndex(idx);
                //setShowDialog(true);
              }}
              section={section}
              //allFamilies={}
            />

            */}
            </Box>
          </Box>
        ) : (
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
        )}
      </Paper>
    </>
  );
};
