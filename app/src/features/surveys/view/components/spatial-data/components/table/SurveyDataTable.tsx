import { SurveySpatialDatasetViewEnum } from "../SurveySpatialToolbar";
import SurveyAnimalsDataTable from "./animal/SurveyAnimalsDataTable";
import SurveySpatialObservationDataTable from "./observation/SurveySpatialObservationDataTable";
import SurveySpatialTelemetryDataTable from "./telemetry/SurveySpatialTelemetryDataTable";

interface ISurveyDataTableProps {
  activeView: SurveySpatialDatasetViewEnum;
  isLoading: boolean;
}

const SurveyDataTable = (props: ISurveyDataTableProps) => {
  const { activeView, isLoading } = props;

  switch (activeView) {
    case SurveySpatialDatasetViewEnum.OBSERVATIONS:
      return <SurveySpatialObservationDataTable isLoading={isLoading} />;
    case SurveySpatialDatasetViewEnum.ANIMALS:
      return <SurveyAnimalsDataTable isLoading={isLoading} />;
    case SurveySpatialDatasetViewEnum.TELEMETRY:
      return <SurveySpatialTelemetryDataTable isLoading={isLoading} />;
    default:
      return null;
  }
};

export default SurveyDataTable;
