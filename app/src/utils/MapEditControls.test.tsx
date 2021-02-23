import React from 'react';
import { render } from '@testing-library/react';
import MapEditControls from './MapEditControls';
import { FeatureGroup, MapContainer } from 'react-leaflet';

describe('MapEditControls.test', () => {
  const alert = jest.fn();

  test('MapEditControls successfully mounts the controls', () => {
    render(
      <MapContainer>
        <FeatureGroup>
          <MapEditControls position="topright" onMounted={() => alert('mounted')} />
        </FeatureGroup>
      </MapContainer>
    );

    expect(alert).toHaveBeenCalledWith('mounted');
  });
});
