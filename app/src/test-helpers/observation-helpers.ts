import { IGetObservationResponse } from 'interfaces/useObservationApi.interface';

export const getObservationForUpdateResponse: IGetObservationResponse = {
  id: 1,
  data: {
    metaData: {
      block_name: 1,
      block_size: 20,
      strata: 'Medium',
      date: '2020/04/04',
      start_time: '11:00',
      end_time: '11:00',
      pilot_name: 'Anissa',
      navigator: 'Agahchen',
      rear_left_observer: 'Shreyas',
      rear_right_observer: 'Deva',
      visibility: 'Moderate',
      light: 'Bright',
      cloud_cover: 20,
      temperature: 30,
      precipitation: 'Fog',
      wind_speed: 22,
      snow_cover: 12,
      snow_depth: 122,
      days_since_snowfall: 11,
      weather_description: 'Awesome weather',
      description_of_habitat: 'Habitat',
      aircraft_company: 'Boeing',
      aircraft_type: 'Jet',
      aircraft_registration_number: 123,
      aircraft_gps_model: 'Model',
      aircraft_gps_datum: 'NAD27',
      aircraft_gps_readout: 'UTM'
    },
    tableData: [[null, 1, 1, null, null, null, null, null, null, null, null, null, null, null]]
  }
};
