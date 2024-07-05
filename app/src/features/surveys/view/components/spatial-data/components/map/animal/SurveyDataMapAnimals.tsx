import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';

interface ISurveyDataMapAnimalsProps {
  captures: ICaptureResponse[];
  mapLayers: IStaticLayer[];
  isLoading?: boolean;
}

export const SurveyDataMapAnimals = (props: ISurveyDataMapAnimalsProps) => {
  const supplementaryLayer: IStaticLayer = {
    layerName: 'Animal Captures',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.ANIMAL_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.ANIMAL_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: []
  };

  const staticLayers = [...props.mapLayers, supplementaryLayer];

  return <SurveyMap staticLayers={staticLayers} supplementaryLayers={[]} isLoading={props.isLoading ?? false} />;
};
