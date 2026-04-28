import { mdiEye, mdiPaw, mdiPineTree, mdiWifiMarker } from '@mdi/js';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { SurveySpatialAnimal } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimal';
import { SurveySpatialObservation } from 'features/surveys/view/survey-spatial/components/observation/SurveySpatialObservation';
import {
  SurveySpatialDatasetViewEnum,
  SurveySpatialToolbar
} from 'features/surveys/view/survey-spatial/components/SurveySpatialToolbar';
import { SurveySpatialTelemetry } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetry';
import { useMemo, useState } from 'react';
import { SurveySpatialHabitatFeature } from './components/habitat-feature/SurveySpatialHabitatFeature';
import { useSamplingSiteStaticLayer } from './components/map/useSamplingSiteStaticLayer';
import { useStudyAreaStaticLayer } from './components/map/useStudyAreaStaticLayer';

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (observations, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialContainer = (): JSX.Element => {
  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

  const studyAreaStaticLayer = useStudyAreaStaticLayer();
  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const staticLayers = useMemo(
    () => [studyAreaStaticLayer, samplingSiteStaticLayer],
    [samplingSiteStaticLayer, studyAreaStaticLayer]
  );

  return (
    <>
      {/* Toolbar for switching between different dataset views */}
      <SurveySpatialToolbar
        activeView={activeView}
        setActiveView={setActiveView}
        views={[
          { value: SurveySpatialDatasetViewEnum.OBSERVATIONS, label: 'Observations', icon: mdiEye, to: 'observations' },
          { value: SurveySpatialDatasetViewEnum.ANIMALS, label: 'Animals', icon: mdiPaw, to: 'animals' },
          { value: SurveySpatialDatasetViewEnum.TELEMETRY, label: 'Telemetry', icon: mdiWifiMarker, to: 'telemetry' },
          {
            value: SurveySpatialDatasetViewEnum.HABITAT_FEATURES,
            label: 'Habitat Features',
            icon: mdiPineTree,
            to: 'habitat-features'
          }
        ]}
      />

      <ComponentSwitch
        switch={activeView}
        components={{
          [SurveySpatialDatasetViewEnum.OBSERVATIONS]: <SurveySpatialObservation staticLayers={staticLayers} />,
          [SurveySpatialDatasetViewEnum.TELEMETRY]: <SurveySpatialTelemetry staticLayers={staticLayers} />,
          [SurveySpatialDatasetViewEnum.ANIMALS]: <SurveySpatialAnimal staticLayers={staticLayers} />,
          [SurveySpatialDatasetViewEnum.HABITAT_FEATURES]: <SurveySpatialHabitatFeature staticLayers={staticLayers} />
        }}
      />
    </>
  );
};
