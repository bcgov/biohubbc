import { AxiosInstance } from 'axios';
import { v4 } from 'uuid';
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

export const useTelemetryApi = (axios: AxiosInstance) => {
  const devices = useDeviceApi(axios);

  const getCritterAndDeployments = (projectId: number, surveyId: number): Promise<ICritterDeploymentResponse[]> => {
    // This endpoint will fetch a list of critters and their deployments
    // const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/critters/deployments`);
    // return data;
    return Promise.resolve([
      {
        critter_id: v4().toString(),
        device_id: 123,
        deployment_id: v4().toString(),
        survey_critter_id: '',
        alias: 'Jingles the moose',
        attachment_start: '2023-01-01T08:00:00.000Z',
        attachment_end: undefined,
        taxon: 'Moose'
      },
      {
        critter_id: v4().toString(),
        device_id: 12333,
        deployment_id: v4().toString(),
        survey_critter_id: '',
        alias: 'Big Tom',
        attachment_start: '2023-02-01T08:00:00.000Z',
        attachment_end: undefined,
        taxon: 'Moose'
      },
      {
        critter_id: v4().toString(),
        device_id: 5544,
        deployment_id: v4().toString(),
        survey_critter_id: '',
        alias: 'Little Timmy',
        attachment_start: '2023-02-015T08:00:00.000Z',
        attachment_end: undefined,
        taxon: 'Caribou'
      }
    ]);
  };

  return { devices, getCritterAndDeployments };
};

type TelemetryApiReturnType = ReturnType<typeof useTelemetryApi>;

export type TelemetryApiLookupFunctions = keyof TelemetryApiReturnType['devices']; // Add more options as needed.
