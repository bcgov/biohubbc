import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { PropsWithChildren } from 'react';
import { IAnimalSections } from './animal-sections';

interface IAnimalSectionWrapperProps extends PropsWithChildren {
  form: JSX.Element;
  section: IAnimalSections;
  critter?: IDetailedCritterWithInternalId;
  infoText: string;
  addBtn?: JSX.Element;
}
export const AnimalSectionWrapper = (props: IAnimalSectionWrapperProps) => {
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
              {props.addBtn ? props.addBtn : null}
            </Box>

            <Typography
              variant="body1"
              color="textSecondary"
              maxWidth={'88ch'}
              sx={{
                mb: 5
              }}>
              {props.infoText}
            </Typography>
            {props.children}
          </Box>
        </Box>
      </Paper>
    </>
  );
};
