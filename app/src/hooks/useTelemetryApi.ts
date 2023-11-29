import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAxios from './api/useAxios';
import { useDeviceApi } from './telemetry/useDeviceApi';

export interface ICritterDeploymentResponse {
  critter_id: string;
  device_id: number;
  deployment_id: string;
  survey_critter_id: string;
  alias: string;
  attachment_start: string;
  attachment_end?: string;
  taxon: string;
}

export interface ICreateManualTelemetry {
  deployment_id: string;
  latitude: number;
  longitude: number;
  date: string;
}

export interface IManualTelemetry extends ICreateManualTelemetry {
  telemetry_manual_id: string;
}

export const useTelemetryApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.API_HOST);
  const devices = useDeviceApi(apiAxios);

  const getVendorTelemetry = async (): Promise<IManualTelemetry[]> => {
    // const { data } = await apiAxios.get<IManualTelemetry[]>('/api/telemetry');
    return [];
  };

  const getManualTelemetry = async (): Promise<IManualTelemetry[]> => {
    const { data } = await apiAxios.get<IManualTelemetry[]>('/api/telemetry');
    return data;
  };

  const createManualTelemetry = async (postData: ICreateManualTelemetry[]): Promise<ICreateManualTelemetry[]> => {
    const { data } = await apiAxios.post<IManualTelemetry[]>('/api/telemetry', postData);
    return data;
  };

  const updateManualTelemetry = async (updateData: IManualTelemetry[]) => {
    const { data } = await apiAxios.patch<IManualTelemetry[]>('/api/telemetry', updateData);
    return data;
  };

  return { devices, getManualTelemetry, createManualTelemetry, updateManualTelemetry, getVendorTelemetry };
};

type TelemetryApiReturnType = ReturnType<typeof useTelemetryApi>;

export type TelemetryApiLookupFunctions = keyof TelemetryApiReturnType['devices']; // Add more options as needed.
