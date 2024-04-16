import { ConfigureColumnsViewEnum } from '../../ConfigureColumnsContainer';
import ConfigureMeasurements from '../measurements/ConfigureMeasurements';

interface IConfigureColumnsContentContainerProps {
  activeView: ConfigureColumnsViewEnum;
}

const ConfigureColumnsContent = (props: IConfigureColumnsContentContainerProps) => {
  return <>{props.activeView == 'MEASUREMENTS' && <ConfigureMeasurements />}</>;
};
export default ConfigureColumnsContent;
