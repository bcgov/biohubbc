import { mdiEye, mdiPaw, mdiPineTree, mdiWifiMarker } from '@mdi/js';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { SurveySpatialAnimal } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimal';
import { SurveySpatialHabitatFeature } from 'features/surveys/view/survey-spatial/components/habitat-feature/SurveySpatialHabitatFeature';
import { useSamplingSiteStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import { useStudyAreaStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useStudyAreaStaticLayer';
import { SurveySpatialObservation } from 'features/surveys/view/survey-spatial/components/observation/SurveySpatialObservation';
import {
  SurveySpatialDatasetViewEnum,
  SurveySpatialToolbar
} from 'features/surveys/view/survey-spatial/components/SurveySpatialToolbar';
import { SurveySpatialTelemetry } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetry';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';

interface ICollectionDataContainerProps {
  collection: ICollection;
}

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (observations, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const CollectionDataContainer = (props: ICollectionDataContainerProps): JSX.Element => {
  const { collection } = props;

  const taxonomyContext = useTaxonomyContext();

  const biohubApi = useBiohubApi();

  const observationsDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.collection.getObservations(collection.collection_id, pagination)
  );

  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

  const studyAreaStaticLayer = useStudyAreaStaticLayer();
  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const staticLayers = useMemo(
    () => [studyAreaStaticLayer, samplingSiteStaticLayer],
    [samplingSiteStaticLayer, studyAreaStaticLayer]
  );

  useEffect(() => {
    // Load the observations data
    observationsDataLoader.load();
  }, [observationsDataLoader]);

  // Fetch and cache all taxonomic data required for the observations.
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsDataLoader.data) {
        // Fetch all unique ITIS TSNs from observations to retrieve taxonomic names
        const taxonomicIds = [
          ...new Set(observationsDataLoader.data.surveyObservations.map((item) => item.itis_tsn))
        ].filter((tsn): tsn is number => tsn !== null);

        if (!taxonomicIds.length) {
          return;
        }

        await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
      }
    };

    cacheTaxonomicData();
    // Should not re-run this effect on `taxonomyContext` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsDataLoader.data]);

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
