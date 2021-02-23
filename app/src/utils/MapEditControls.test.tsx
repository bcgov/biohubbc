import React from 'react';
import { render, waitFor } from '@testing-library/react';
import MapEditControls from './MapEditControls';
import { FeatureGroup, MapContainer } from 'react-leaflet';

describe('MapEditControls.test', () => {
  const alert = jest.fn();

  test('MapEditControls matches the snapshot', async () => {
    render(
      <MapContainer>
        <FeatureGroup>
          <MapEditControls position="topright" onMounted={() => alert('mounted')} />
        </FeatureGroup>
      </MapContainer>
    );

    await waitFor(() => {});

    expect(alert).toHaveBeenCalledWith('mounted');
  });
});
