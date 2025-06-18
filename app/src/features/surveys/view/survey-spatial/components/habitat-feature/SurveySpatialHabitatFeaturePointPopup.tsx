import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SurveyHabitatFeature } from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { useEffect } from 'react';
import { Popup } from 'react-leaflet';
import { getCodesName } from 'utils/Utils';

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

  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const habitatFeatureDataLoader = useDataLoader((surveyHabitatFeatureId: number) =>
    biohubApi.habitatFeature.getSurveyHabitatFeatureWithSupplementaryData(
      surveyContext.projectId,
      surveyContext.surveyId,
      surveyHabitatFeatureId
    )
  );

  const getHabitatFeatureMetadata = (habitatFeature: SurveyHabitatFeature) => {
    return [
      {
        label: 'Type',
        value:
          getCodesName(
            codesContext.codesDataLoader.data,
            'habitat_feature_types',
            habitatFeature.habitat_feature_type_id
          ) ?? ''
      },
      { label: 'Count', value: String(habitatFeature.count) },
      {
        label: 'Location',
        value: [habitatFeature.latitude, habitatFeature.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      {
        label: 'Date',
        value: dayjs(habitatFeature.observed_date).format(DATE_FORMAT.MediumDateFormat)
      },
      {
        label: 'Time',
        value: habitatFeature.observed_time
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
