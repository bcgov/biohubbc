import { LeafletEventHandlerFnMap } from 'leaflet';
import { useMapEvents } from 'react-leaflet';

export interface IEventHandlerProps {
  eventHandlers?: LeafletEventHandlerFnMap;
}

const EventHandler = (props: IEventHandlerProps) => {
  useMapEvents({
    ...props.eventHandlers
  });

  return null;
};

export default EventHandler;
