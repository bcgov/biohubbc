import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ObservationRecord } from 'interfaces/useObservationApi.interface';
import { Popup } from 'react-leaflet';
import { getFormattedDate } from 'utils/Utils';

interface ISurveySpatialObservationPointPopupProps {
  feature: IStaticLayerFeature;
}

/**
 * Renders a popup for observation data on the map.
 *
 * @param {ISurveySpatialObservationPointPopupProps} props
 * @return {*}
 */
export const SurveySpatialObservationPointPopup = (props: ISurveySpatialObservationPointPopupProps) => {
  const { feature } = props;

  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const observationDataLoader = useDataLoader((observationId: number) =>
    biohubApi.observation.getObservationRecord(surveyContext.projectId, surveyContext.surveyId, observationId)
  );

  const getObservationMetadata = (observation: ObservationRecord) => {
    return [
      { label: 'Taxon ID', value: String(observation.itis_tsn) },
      { label: 'Count', value: String(observation.count) },
      {
        label: 'Coords',
        value: [observation.latitude, observation.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      {
        label: 'Date',
        value: getFormattedDate(
          observation.observation_time ? DATE_FORMAT.LongDateTimeFormat : DATE_FORMAT.MediumDateFormat,
          `${observation.observation_date} ${observation.observation_time}`
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
          observationDataLoader.load(Number(feature.id));
        },
        remove: () => {
          observationDataLoader.clearData();
        }
      }}>
      <SurveyMapPopup
        isLoading={observationDataLoader.isLoading || !observationDataLoader.isReady}
        title="Observation"
        metadata={observationDataLoader.data ? getObservationMetadata(observationDataLoader.data) : []}
        key={`observation-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
