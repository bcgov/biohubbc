import { ConfigureColumnsViewEnum } from '../../ConfigureColumnsContainer';
import ConfigureMeasurements from '../measurements/ConfigureMeasurementColumns';

interface IConfigureColumnsContentContainerProps {
  activeView: ConfigureColumnsViewEnum;
}

const ConfigureColumnsContent = (props: IConfigureColumnsContentContainerProps) => {
  return <>{props.activeView == 'MEASUREMENTS' && <ConfigureMeasurements quantitative={[]} qualitative={[]} />}</>;
};
export default ConfigureColumnsContent;
