import { Box, Divider, Paper, Stack, Toolbar, Typography } from '@mui/material';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { useHabitatFeatureTableContext } from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { SurveyHabitatFeatureTable } from './SurveyHabitatFeatureTable';

/**
 * Container for the Survey Habitat Feature Table.
 *
 * @return {*} {JSX.Element}
 */
export const SurveyHabitatFeatureTableContainer = (): JSX.Element => {
  const habitatFeatureTableContext = useHabitatFeatureTableContext();

  return (
    <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar
        disableGutters
        sx={{
          pl: 2,
          pr: 3
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Habitat Features &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({habitatFeatureTableContext.rowCount})
          </Typography>
        </Typography>

        <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.HABITAT_FEATURES} />
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
        <Box position="absolute" width="100%" height="100%">
          <SurveyHabitatFeatureTable />
        </Box>
      </Box>
    </Paper>
  );
};
