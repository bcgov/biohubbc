import Box from '@mui/material/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { SurveyHabitatFeatureTable } from '../../../../habitat-features/components/SurveyHabitatFeatureTable';

/**
 * Array of additional static layers to be added to the map.
 */
interface ISurveySpatialHabitatFeatureProps {
  staticLayers?: IStaticLayer[];
}

/**
 * Container displaying a map of Habitat Features in the Survey
 *
 * TODO: Mac: Implement the the fetching logic for habitat features
 *
 * @param {ISurveySpatialHabitatFeatureProps} props - The props for the component.
 * @returns {*} {JSX.Element}
 */
export const SurveySpatialHabitatFeature = (props: ISurveySpatialHabitatFeatureProps) => {
  return (
    <>
      {/* Display map with habitat feature points */}
      <Box height={{ xs: 300, md: 500 }} position="relative">
        <SurveyMap staticLayers={[...(props.staticLayers ?? [])]} isLoading={false} />
      </Box>

      {/*
        Display data table with habitat feature details
        TODO: Mac: Replace the isLoading with the actual loading state
        */}
      <Box height={{ xs: 300, md: 500 }} display="flex" flexDirection="column">
        <SurveyHabitatFeatureTable isLoading={false} />
      </Box>
    </>
  );
};
