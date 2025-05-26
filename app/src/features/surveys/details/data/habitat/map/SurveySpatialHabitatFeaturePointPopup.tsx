import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SurveyHabitatFeature } from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { Popup } from 'react-leaflet';
import { getFormattedDate } from 'utils/Utils';

interface ISurveySpatialHabitatFeaturePointPopupProps {
  feature: IStaticLayerFeature;
}

/**
 * Renders a popup for habitat feature data on the map.
 *
 * @param {ISurveySpatialHabitatFeaturePointPopupProps} props
 * @return {*}
 */
export const SurveySpatialHabitatFeaturePointPopup = (props: ISurveySpatialHabitatFeaturePointPopupProps) => {
  const { feature } = props;

  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const habitatFeatureDataLoader = useDataLoader((surveyHabitatFeatureId: number) =>
    biohubApi.habitatFeature.getSurveyHabitatFeatureWithSupplementaryData(
      surveyContext.surveyId,
      surveyHabitatFeatureId
    )
  );

  const getHabitatFeatureMetadata = (habitatFeature: SurveyHabitatFeature) => {
    return [
      { label: 'Type', value: String(habitatFeature.habitat_feature_type_id) },
      { label: 'Count', value: String(habitatFeature.count) },
      {
        label: 'Coords',
        value: [habitatFeature.latitude, habitatFeature.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      {
        label: 'Date',
        value: getFormattedDate(
          habitatFeature.observed_time ? DATE_FORMAT.LongDateTimeFormat : DATE_FORMAT.MediumDateFormat,
          `${habitatFeature.observed_date} ${habitatFeature.observed_time}`
        )
      }
    ];
  };

  return (
    <Popup
      keepInView={false}
      closeButton={true}
      autoPan={true}
      eventHandlers={{
        add: () => {
          habitatFeatureDataLoader.load(Number(feature.id));
        }
      }}>
      <SurveyMapPopup
        isLoading={habitatFeatureDataLoader.isLoading || !habitatFeatureDataLoader.isReady}
        title="Habitat Feature"
        metadata={
          habitatFeatureDataLoader.data
            ? getHabitatFeatureMetadata(habitatFeatureDataLoader.data.surveyHabitatFeature)
            : []
        }
        key={`habitat-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
