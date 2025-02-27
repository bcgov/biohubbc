import Box from '@mui/material/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { HabitatFeatureTableContextProvider } from 'contexts/habitatFeatureTableContext';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { SurveySpatialHabitatFeatureTableContainer } from './SurveySpatialHabitatFeatureTableContainer';

interface ISurveySpatialHabitatFeatureProps {
  /**
   * Array of additional static layers to be added to the map.
   *
   * @type {IStaticLayer[]}
   */
  staticLayers?: IStaticLayer[];
}

/**
 * Container displaying a map of Habitat Features in the Survey
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

      {/* Display data table with habitat feature details */}
      <Box height={{ xs: 300, md: 500 }} display="flex" flexDirection="column">
        <HabitatFeatureTableContextProvider>
          <SurveySpatialHabitatFeatureTableContainer />
        </HabitatFeatureTableContextProvider>
      </Box>
    </>
  );
};
