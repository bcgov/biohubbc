import Box from '@mui/material/Box';
import CustomTextField from 'components/fields/CustomTextField';
import { Feature } from 'geojson';

export interface ISurveyLocation {
  survey_location_id?: number;
  name: string;
  description: string;
  geojson: Feature[];
  revision_count?: number;
  // This is an id meant for the front end only. This is is set if the geojson was drawn by the user (on the leaflet map) vs imported (file upload or region selector)
  // Locations drawn by the user should be editable in the leaflet map using the draw tools available
  // Any uploaded or selected regions should not be editable and be placed in the 'static' layer on the map
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
}

export const SurveyLocationsForm = () => {
  return (
    <form>
      <Box mb={3}>
        <CustomTextField
          name="name"
          label="Name"
          maxLength={100}
          other={{ placeholder: 'Maximum 100 characters', required: true }}
        />
      </Box>
      <CustomTextField
        name="description"
        label="Description"
        maxLength={250}
        other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
      />
    </form>
  );
};

export default SurveyLocationsForm;
