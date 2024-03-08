import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

interface IAnimalSectionWrapperProps {
  form: JSX.Element;
  content: JSX.Element;
  section: IAnimalSections;
  openAddForm?: () => void;
  critter?: IDetailedCritterWithInternalId;
}
export const AnimalSectionWrapper = (props: IAnimalSectionWrapperProps) => {
  const sectionData = ANIMAL_SECTIONS_FORM_MAP[props.section];

  return (
    <>
      {props.form}
      <Paper component={Stack} position="absolute" top={0} right={0} bottom={0} left={0} overflow="hidden">
        <Toolbar
          disableGutters
          sx={{
            px: 2
          }}>
          <Typography variant="h3" component="h2">
            {props.critter ? `Animal Details > ${props.critter?.animal_id}` : 'No animal selected'}
          </Typography>
        </Toolbar>

        <Divider flexItem></Divider>

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
                {props.section}
              </Typography>

              {props.openAddForm ? (
                <Button
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  variant="contained"
                  color="primary"
                  onClick={props.openAddForm}>
                  {sectionData.addBtnText}
                </Button>
              ) : null}
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
            {props.content}
          </Box>
        </Box>
      </Paper>
    </>
  );
};
