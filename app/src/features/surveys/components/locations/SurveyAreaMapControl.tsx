import MapContainer from 'components/map/MapContainer';
import { FormikContextType } from 'formik';
import { LatLngBoundsExpression } from 'leaflet';
import { useState } from 'react';
import { ISurveyLocationForm } from '../StudyAreaForm';

export interface ISurveyAreMapControlProps {
  map_id: string;
  title: string;
  formik_key: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const { map_id } = props;
  const [updatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  return (
    <>
      <MapContainer
        mapId={map_id}
        staticLayers={[
          {
            layerName: 'Sample Layer',
            features: []
          }
        ]}
        bounds={updatedBounds}
      />
    </>
  );
};
