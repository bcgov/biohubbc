import { ConfigureColumnsViewEnum } from './ConfigureColumnsButton';
import ConfigureMeasurements from './ConfigureMeasurements';

interface IConfigureColumnsContentContainerProps {
  activeView: ConfigureColumnsViewEnum;
}

const ConfigureColumnsContentContainer = (props: IConfigureColumnsContentContainerProps) => {
  return <>{props.activeView == 'MEASUREMENTS' && <ConfigureMeasurements />}</>;
};
export default ConfigureColumnsContentContainer;
