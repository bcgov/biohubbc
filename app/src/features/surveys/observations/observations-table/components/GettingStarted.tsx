import { Box, Grid, List } from '@mui/material';
import CircleStepCard from './CircleStepCard';

const GettingStarted = () => {
  const gridContainerSx = { justifyContent: 'center' };
  const gridItemSx = { flexDirection: 'column', justifyContent: 'center', flex: '1' };

  const filePath = 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/species_observations_template_example.csv';

  const steps = [
    {
      title: 'Add sampling sites',
      description: `Before adding species observations, create sampling sites in the left panel to associate species observations to.\n
      You can add multiple sampling methods to each site, and you can add multiple sampling periods to each method.\n
      `
    },
    {
      title: 'Add species observations',
      description: `After adding sampling sites, you can add species observations manually or by uploading a
      file. For manual imports, click ADD RECORD in the top right, enter your observations, then SAVE. For file imports, upload a .csv or .xlsx\n
      file with column names matching what you see above.`,
      resources: <a href={filePath}>Download an example species observations file</a>
    }
  ];

  return (
    <Box sx={{ opacity: 0.5 }} p={2} overflow='auto'>
      <Grid container sx={gridContainerSx}>
        <Grid item xs={12} sm={10} lg={10} xl={8} sx={gridItemSx}>
          <Box flex="1">
            <List>
              {steps.map((step, index) => (
                <CircleStepCard key={`${step.title}-${index}`} number={index + 1} {...step} />
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export { GettingStarted };
