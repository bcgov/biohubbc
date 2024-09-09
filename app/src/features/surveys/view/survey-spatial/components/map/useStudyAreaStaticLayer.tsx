import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { Popup } from 'react-leaflet';

/**
 * Hook to get the study area static layer.
 *
 * @return {*}  {IStaticLayer}
 */
export const useStudyAreaStaticLayer = (): IStaticLayer => {
  const surveyContext = useSurveyContext();

  const studyAreaStaticLayer: IStaticLayer = {
    layerName: 'Study Areas',
    layerOptions: {
      color: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR,
      fillColor: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR
    },
    features:
      surveyContext.surveyDataLoader.data?.surveyData.locations.flatMap((location) => {
        return location.geojson.map((feature) => {
          return {
            id: location.survey_location_id,
            key: `study-area-${location.survey_location_id}`,
            geoJSON: feature
          };
        });
      }) ?? [],
    popup: (feature) => {
      const location = surveyContext.surveyDataLoader.data?.surveyData.locations.find(
        (item) => item.survey_location_id === feature.id
      );

      const metadata = [];

      if (location) {
        metadata.push({
          label: 'Name',
          value: location.name
        });

        metadata.push({
          label: 'Description',
          value: location.description
        });
      }

      return (
        <Popup keepInView={false} closeButton={true} autoPan={true}>
          <SurveyMapPopup
            title="Study Area"
            metadata={metadata}
            isLoading={false}
            key={`study-area-popup-${feature.id}`}
          />
        </Popup>
      );
    },
    tooltip: (feature) => <SurveyMapTooltip title="Study Area" key={`study-area-tooltip-${feature.id}`} />
  };

  return studyAreaStaticLayer;
};
