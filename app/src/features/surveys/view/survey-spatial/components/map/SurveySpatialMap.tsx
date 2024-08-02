import { IStaticLayer } from 'components/map/components/StaticLayers';
import { useSamplingSiteStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import { useStudyAreaStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useStudyAreaStaticLayer';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { useMemo } from 'react';

/**
 * Props interface for SurveySpatialMap component.
 */
interface ISurveyDataMapProps {
  /**
   * Array of additional static layers to be added to the map.
   */
  staticLayers: IStaticLayer[];
  /**
   * Loading indicator to control map skeleton loader.
   */
  isLoading: boolean;
}

/**
 * Component for displaying survey-related spatial data on a map.
 *
 * Automatically includes the study area and sampling site static layers.
 *
 * @param {ISurveyDataMapProps} props
 * @return {*}
 */
export const SurveySpatialMap = (props: ISurveyDataMapProps) => {
  const { staticLayers, isLoading } = props;

  const studyAreaStaticLayer = useStudyAreaStaticLayer();

  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const allStaticLayers = useMemo(
    () => [studyAreaStaticLayer, samplingSiteStaticLayer, ...staticLayers],
    [samplingSiteStaticLayer, staticLayers, studyAreaStaticLayer]
  );

  return <SurveyMap staticLayers={allStaticLayers} isLoading={isLoading} />;
};
