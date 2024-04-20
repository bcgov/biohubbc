import { ISurveySampleMethodData } from 'features/surveys/components/MethodForm';
import { Feature } from 'geojson';

export interface IEditSamplingSiteRequest {
  sampleSite: {
    name: string;
    description: string;
    survey_id: number;
    survey_sample_sites: Feature[]; // extracted list from shape files (used for formik loading)
    geojson?: Feature; // geojson object from map (used for sending to api)
    methods: ISurveySampleMethodData[];
    blocks: number[];
    stratums: number[];
  };
}
