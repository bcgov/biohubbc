import { AxiosInstance } from 'axios';
import { ICreateCritterMeasurement } from 'features/surveys/view/survey-animals/animal';

const useMeasurementApi = (axios: AxiosInstance) => {
  const createQualitativeMeasurement = async (payload: ICreateCritterMeasurement) => {
    delete payload.measurement_quantitative_id;
    delete payload.value;

    const { data } = await axios.post(`/api/critterbase/measurements/qualitative/create`, payload);
    return data;
  };

  const createQuantitativeMeasurement = async (payload: ICreateCritterMeasurement) => {
    delete payload.measurement_qualitative_id;
    delete payload.qualitative_option_id;

    const { data } = await axios.post(`/api/critterbase/measurements/quantitative/create`, {
      ...payload,
      value: Number(payload.value)
    });
    return data;
  };

  const updateQualitativeMeasurement = async (payload: ICreateCritterMeasurement) => {
    delete payload.value;

    const { data } = await axios.patch(
      `/api/critterbase/measurements/qualitative/${payload.measurement_qualitative_id}`,
      payload
    );
    return data;
  };

  const updateQuantitativeMeasurement = async (payload: ICreateCritterMeasurement) => {
    const { data } = await axios.patch(
      `/api/critterbase/measurements/quantitative/${payload.measurement_quantitative_id}`,
      {
        ...payload,
        value: Number(payload.value)
      }
    );
    return data;
  };

  const deleteQualitativeMeasurement = async (measurementID: string) => {
    const { data } = await axios.delete(`/api/critterbase/measurements/qualitative/${measurementID}`);

    return data;
  };

  const deleteQuantitativeMeasurement = async (measurementID: string) => {
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
