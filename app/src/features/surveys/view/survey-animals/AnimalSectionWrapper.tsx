import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { PropsWithChildren } from 'react';
import { ANIMAL_SECTION } from './animal';

interface IAnimalSectionWrapperProps extends PropsWithChildren {
  form?: JSX.Element;
  section?: ANIMAL_SECTION;
  infoText?: string;
  critter?: ICritterDetailedResponse;
  addBtn?: JSX.Element;
}
/**
 * Wrapper for the selected section main content.
 *
 * This component renders beside the AnimalList navbar.
 * In most cases it displays the currently selected critter + the attribute data cards.
 *
 * Note: All props can be undefined to easily handle the empty state.
 *
 * @param {IAnimalSectionWrapperProps} props
 * @returns {*}
 */
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
        {!props?.critter ? (
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
        ) : (
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
                {props.addBtn}
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
        )}
      </Paper>
    </>
  );
};
