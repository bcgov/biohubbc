import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MapContainer } from 'react-leaflet';
import { MapBounds } from './MapContainer';
import WFSFeatureGroup from './WFSFeatureGroup';

describe('WFSFeatureGroup', () => {
  test('matches the snapshot with wildlife management units layer showing', async () => {
    const initialBounds: any[] = [
      [48.25443233, -123.88613849],
      [49.34875907, -123.00382943]
    ];

    const onSelectGeometry = jest.fn();

    const { asFragment } = render(
      <MapContainer id={'test-map'} style={{ height: '100%' }} center={[55, -128]} zoom={10} scrollWheelZoom={false}>
        <MapBounds bounds={initialBounds} />
          <WFSFeatureGroup
            name="Wildlife Management Units"
            typeName="pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW"
            onSelectGeometry={onSelectGeometry}
            existingGeometry={[]}
          />
      </MapContainer>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
