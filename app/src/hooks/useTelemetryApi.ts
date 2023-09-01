import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAxios from './api/useAxios';

// TODO: Add a telemetry device api for device deployments etc.
export const useTelemetryApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.API_HOST);
  const devices = useDeviceApi(apiAxios);
  return { devices };
};

type TelemetryApiReturnType = ReturnType<typeof useTelemetryApi>;

export type TelemetryApiLookupFunctions = TelemetryApiReturnType['devices']['getCollarVendors']; // TODO: Add more options as needed.
