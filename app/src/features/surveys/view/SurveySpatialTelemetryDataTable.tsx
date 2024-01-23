import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { SurveyContext } from 'contexts/surveyContext';
import dayjs from 'dayjs';
import { useContext, useMemo } from 'react';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { ICritterDeployment } from '../telemetry/ManualTelemetryList';
import SurveySpatialDataTable from './SurveySpatialDataTable';

interface ISurveySpatialTelemetryDataTableProps {
  isLoading: boolean;
}
const SurveySpatialTelemetryDataTable = (props: ISurveySpatialTelemetryDataTableProps) => {
  const surveyContext = useContext(SurveyContext);
  const flattenedCritterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];
    // combine all critter and deployments into a flat list
    surveyContext.deploymentDataLoader.data?.forEach((deployment) => {
      const critter = surveyContext.critterDataLoader.data?.find(
        (critter) => critter.critter_id === deployment.critter_id
      );
      if (critter) {
        data.push({ critter, deployment });
      }
    });
    return data;
  }, [surveyContext.critterDataLoader.data, surveyContext.deploymentDataLoader.data]);

  const mapData = () => {
    return flattenedCritterDeployments.map((item) => {
      return [
        `${item.critter.animal_id}`,
        `${item.deployment.device_id}`,
        `${dayjs(item.deployment.attachment_start).format('YYYY-MM-DD')}`,
        `${dayjs(item.deployment.attachment_end).format('YYYY-MM-DD')}`
      ];
    });
  };

  return (
    <>
      {flattenedCritterDeployments.length > 0 && !props.isLoading && (
        <SurveySpatialDataTable tableHeaders={['Alias', 'Device ID', 'Start', 'End']} tableRows={mapData()} />
      )}

      {props.isLoading && <SkeletonList />}

      {!props.isLoading && flattenedCritterDeployments.length === 0 && (
        <NoSurveySectionData text="No telemetry data available" paperVariant="outlined" />
      )}
    </>
  );
};

export default SurveySpatialTelemetryDataTable;
