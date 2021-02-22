import React from 'react';
import { render } from '@testing-library/react';
import MapContainer from './MapContainer';

describe('MapContainer.test', () => {
  const classes = jest.fn().mockImplementation(() => {
    return jest.fn().mockReturnValue({
      map: {
        height: '100%',
        width: '100%'
      }
    });
  });

  test('MapContainer matches the snapshot', () => {
    const { asFragment } = render(
      <MapContainer mapId="myMap" classes={classes} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
