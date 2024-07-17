import { AxiosInstance } from 'axios';
import { ICreateCritterMeasurement } from 'features/surveys/view/survey-animals/animal';
import { IQualitativeMeasurementResponse, IQuantitativeMeasurementResponse } from 'interfaces/useCritterApi.interface';

export type CreateQualitativeMeasurement = Omit<ICreateCritterMeasurement, 'measurement_quantitative_id' | 'value'>;
export type CreateQuantitativeMeasurement = Omit<
  ICreateCritterMeasurement,
  'measurement_qualitative_id' | 'qualitative_option_id'
>;

const useMeasurementApi = (axios: AxiosInstance) => {
  /**
   * Create critter qualitative measurement.
   *
   * @async
   * @param {CreateQualitativeMeasurement} payload - Create qualitative measurement payload.
   * @returns {Promise<IQualitativeMeasurementResponse>} The created qualitative measurement.
   */
  const createQualitativeMeasurement = async (
    payload: CreateQualitativeMeasurement
  ): Promise<IQualitativeMeasurementResponse> => {
    const { data } = await axios.post(`/api/critterbase/measurements/qualitative/create`, payload);
    return data;
  };

  /**
   * Create critter quantitative measurement.
   *
   * @async
   * @param {CreateQuantitativeMeasurement} payload - Create quantitative measurement payload.
   * @returns {Promise<IQuantitativeMeasurementResponse>} The created quantitative measurement.
   */
  const createQuantitativeMeasurement = async (
    payload: CreateQuantitativeMeasurement
  ): Promise<IQuantitativeMeasurementResponse> => {
    const { data } = await axios.post(`/api/critterbase/measurements/quantitative/create`, payload);
    return data;
  };

  /**
   * Update critter qualitative measurement.
   *
   * @async
   * @param {CreateQualitativeMeasurement} payload - Create quantitative measurement payload.
   * @returns {Promise<IQualitativeMeasurementResponse>} The updated qualitative measurement.
   */
  const updateQualitativeMeasurement = async (
    payload: CreateQualitativeMeasurement
  ): Promise<IQualitativeMeasurementResponse> => {
    const { data } = await axios.patch(
      `/api/critterbase/measurements/qualitative/${payload.measurement_qualitative_id}`,
      payload
    );
    return data;
  };

  /**
   * Update critter quantitative measurement.
   *
   * @async
   * @param {CreateQuantitativeMeasurement} payload - Update quantitative measurement payload.
   * @returns {Promise<IQuantitativeMeasurementResponse>} The updated qualitative measurement.
   */
  const updateQuantitativeMeasurement = async (
    payload: CreateQuantitativeMeasurement
  ): Promise<IQuantitativeMeasurementResponse> => {
    const { data } = await axios.patch(
      `/api/critterbase/measurements/quantitative/${payload.measurement_quantitative_id}`,
      payload
    );
    return data;
  };

  /**
   * Delete critter qualitative measurement.
   *
   * @async
   * @param {string} measurementID - taxon_measurement_id.
   * @returns {Promise<IQualitativeMeasurementResponse>} The deleted qualitative measurement.
   */
  const deleteQualitativeMeasurement = async (measurementID: string): Promise<IQualitativeMeasurementResponse> => {
    const { data } = await axios.delete(`/api/critterbase/measurements/qualitative/${measurementID}`);

    return data;
  };

  /**
   * Delete critter quantitative measurement.
   *
   * @async
   * @param {string} measurementID - taxon_measurement_id.
   * @returns {Promise<IQualitativeMeasurementResponse>} The deleted quantitative measurement.
   */
  const deleteQuantitativeMeasurement = async (measurementID: string): Promise<IQuantitativeMeasurementResponse> => {
    const { data } = await axios.delete(`/api/critterbase/measurements/quantitative/${measurementID}`);

    return data;
  };

  return {
    createQualitativeMeasurement,
    createQuantitativeMeasurement,
    updateQualitativeMeasurement,
    updateQuantitativeMeasurement,
    deleteQuantitativeMeasurement,
    deleteQualitativeMeasurement
  };
};

export { useMeasurementApi };
