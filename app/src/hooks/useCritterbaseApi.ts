import { useXrefApi } from 'hooks/cb_api/useXrefApi';
import { useConfigContext } from 'hooks/useContext';
import { useMemo } from 'react';
import useAxios from './api/useAxios';
import { useCaptureApi } from './cb_api/useCaptureApi';
import { useCollectionUnitApi } from './cb_api/useCollectionUnitApi';
import { useCritterApi } from './cb_api/useCritterApi';
import { useLookupApi } from './cb_api/useLookupApi';
import { useMarkingApi } from './cb_api/useMarkingApi';
import { useMeasurementApi } from './cb_api/useMeasurementApi';
import { useMortalityApi } from './cb_api/useMortalityApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useCritterbaseApi = () => {
  const config = useConfigContext();
  const apiAxios = useAxios(config.API_HOST);

  const critters = useCritterApi(apiAxios);

  const lookup = useLookupApi(apiAxios);

  const xref = useXrefApi(apiAxios);

  const marking = useMarkingApi(apiAxios);

  const collectionUnit = useCollectionUnitApi(apiAxios);

  const measurement = useMeasurementApi(apiAxios);

  const mortality = useMortalityApi(apiAxios);

  const capture = useCaptureApi(apiAxios);

  return useMemo(
    () => ({
      critters,
      lookup,
      xref,
      marking,
      collectionUnit,
      measurement,
      mortality,
      capture
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiAxios]
  );
};
