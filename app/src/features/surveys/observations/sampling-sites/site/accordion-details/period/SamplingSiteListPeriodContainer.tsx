import { grey } from '@mui/material/colors';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { SamplingSiteListPeriod } from 'features/surveys/observations/sampling-sites/site/accordion-details/period/SamplingSiteListPeriod';
import { useObservationsContext, useObservationsPageContext } from 'hooks/useContext';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';

export interface ISamplingSiteListPeriodContainerProps {
  samplePeriods: GetSamplingPeriod[];
}

/**
 * Renders a list of sampling periods grouped by technique name.
 *
 * @param {ISamplingSiteListPeriodContainerProps} props
 * @return {*}
 */
export const SamplingSiteListPeriodContainer = (props: ISamplingSiteListPeriodContainerProps) => {
  const { samplePeriods } = props;

  const observationsPageContext = useObservationsPageContext();
  const observationsContext = useObservationsContext();

  // Group sample periods by technique name
  // Exclude sample periods that have no technique or have no start or end date. These records are incomplete, and
  // users should not be able to upload observations against them.
  const samplePeriodsByTechniqueMap = new Map<string, Set<GetSamplingPeriod>>();
  samplePeriods.forEach((samplePeriod) => {
    const techniqueName = samplePeriod.method_technique?.name;

    if (!techniqueName) {
      // No technique name, skip
      return;
    }

    if (!samplePeriod.start_date || !samplePeriod.end_date) {
      // No start or end date, skip
      return;
    }

    if (!samplePeriodsByTechniqueMap.has(techniqueName)) {
      samplePeriodsByTechniqueMap.set(techniqueName, new Set<GetSamplingPeriod>());
    }

    const techniquePeriods = samplePeriodsByTechniqueMap.get(techniqueName);

    if (!techniquePeriods) {
      return;
    }

    // Add the sample period to the set for the technique name
    techniquePeriods.add(samplePeriod);
  });

  return (
    <>
      {Array.from(samplePeriodsByTechniqueMap).map(([techniqueName, samplePeriodsForTechniqueName]) => {
        const samplePeriods = Array.from(samplePeriodsForTechniqueName);

        return (
          <ListItem
            sx={{
              p: 0,
              display: 'block',
              '& + li': {
                mt: 0.5
              }
            }}
            key={`technique-${techniqueName}`}>
            <ListItemText
              sx={{
                p: 1,
                bgcolor: grey[100],
                '& .MuiTypography-root': {
                  fontWeight: 700,
                  pt: 0
                }
              }}
              title="Sampling Technique"
              primary={techniqueName}
            />
            <List disablePadding sx={{ ml: 0.5 }}>
              <SamplingSiteListPeriod
                samplePeriods={samplePeriods}
                observationsContext={observationsContext}
                observationsPageContext={observationsPageContext}
              />
            </List>
          </ListItem>
        );
      })}
    </>
  );
};
