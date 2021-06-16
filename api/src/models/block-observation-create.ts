/**
 * Processes all POST /project/{projectId}/survey/{surveyId}/observations/create request data.
 *
 * @export
 * @class PostBlockObservationObject
 */
export class PostBlockObservationObject {
  block_name: number;
  block_size: number;
  strata: string;
  date: string;
  start_time: string;
  end_time: string;
  pilot_name: string;
  navigator: string;
  rear_left_observer: string;
  rear_right_observer: string;
  visibility: string;
  light: string;
  cloud_cover: number;
  temperature: number;
  precipitation: string;
  wind_speed: number;
  snow_cover: number;
  snow_depth: number;
  days_since_snowfall: number;
  weather_description: string;
  description_of_habitat: string;
  aircraft_company: string;
  aircraft_type: string;
  aircraft_registration_number: number;
  aircraft_gps_model: string;
  aircraft_gps_datum: string;
  aircraft_gps_readout: string;
  tableData: string;

  constructor(obj?: any) {
    this.block_name = obj?.data.metaData.block_name || null;
    this.block_size = obj?.data.metaData.block_size || null;
    this.strata = obj?.data.metaData.strata || null;
    this.date = obj?.data.metaData.date || null;
    this.start_time = obj?.data.metaData.start_time || null;
    this.end_time = obj?.data.metaData.end_time || null;
    this.pilot_name = obj?.data.metaData.pilot_name || null;
    this.navigator = obj?.data.metaData.navigator || null;
    this.rear_left_observer = obj?.data.metaData.rear_left_observer || null;
    this.rear_right_observer = obj?.data.metaData.rear_right_observer || null;
    this.visibility = obj?.data.metaData.visibility || null;
    this.light = obj?.data.metaData.light || null;
    this.cloud_cover = obj?.data.metaData.cloud_cover || null;
    this.temperature = obj?.data.metaData.temperature || null;
    this.precipitation = obj?.data.metaData.precipitation || null;
    this.wind_speed = obj?.data.metaData.wind_speed || null;
    this.snow_cover = obj?.data.metaData.snow_cover || null;
    this.snow_depth = obj?.data.metaData.snow_depth || null;
    this.days_since_snowfall = obj?.data.metaData.days_since_snowfall || null;
    this.weather_description = obj?.data.metaData.weather_description || null;
    this.description_of_habitat = obj?.data.metaData.description_of_habitat || null;
    this.aircraft_company = obj?.data.metaData.aircraft_company || null;
    this.aircraft_type = obj?.data.metaData.aircraft_type || null;
    this.aircraft_registration_number = obj?.data.metaData.aircraft_registration_number || null;
    this.aircraft_gps_model = obj?.data.metaData.aircraft_gps_model || null;
    this.aircraft_gps_datum = obj?.data.metaData.aircraft_gps_datum || null;
    this.aircraft_gps_readout = obj?.data.metaData.aircraft_gps_readout || null;
    this.tableData = obj?.data.tableData.data || null;
  }
}
