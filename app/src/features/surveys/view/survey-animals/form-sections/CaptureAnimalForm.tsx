import { Checkbox, FormControlLabel, Grid, Tab, Tabs } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useState } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalCapture } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';
/**
 * Renders the Capture section for the Individual Animal form
 *
 * Note A: Using <FieldArray/> the name properties must stay in sync with
 * values object and nested arrays.
 * ie: values = { capture: [{id: 'test'}] };  name = 'capture.[0].id';
 *
 * Note B: FormSectionWrapper uses a Grid container to render children elements.
 * Children of FormSectionWrapper can use Grid items to organize inputs.
 *
 * Returns {*}
 */

//type CaptureTabState = 'form' | 'map';

const CaptureAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'capture';
  const newCapture: IAnimalCapture = {
    capture_latitude: '' as unknown as number,
    capture_longitude: '' as unknown as number,
    capture_comment: '',
    capture_timestamp: '' as unknown as Date,
    release_latitude: '' as unknown as number,
    release_longitude: '' as unknown as number,
    release_comment: '',
    release_timestamp: '' as unknown as Date
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalCaptureTitle}
            titleHelp={SurveyAnimalsI18N.animalCaptureHelp}
            btnLabel={SurveyAnimalsI18N.animalCaptureAddBtn}
            handleAddSection={() => push(newCapture)}
            handleRemoveSection={remove}>
            {values.capture.map((_cap, index) => (
              <CaptureAnimalFormContent key={`${name}-${index}-inputs`} name={name} index={index} />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface CaptureAnimalFormContentProps {
  name: keyof IAnimal;
  index: number;
}

const CaptureAnimalFormContent = ({ name, index }: CaptureAnimalFormContentProps) => {
  const [showRelease, setShowRelease] = useState(false);
  const [tabState, setTabState] = useState(0);
  return (
    <>
      <Grid item xs={12}>
        <Tabs
          value={tabState}
          onChange={(e, newVal) => {
            setTabState(newVal);
          }}>
          <Tab label="Forms" />
          <Tab label="Map" />
        </Tabs>
      </Grid>
      <Grid item xs={6}>
        <CustomTextField
          other={{ required: true, size: 'small' }}
          label="Capture Latitude"
          name={getAnimalFieldName<IAnimalCapture>(name, 'capture_latitude', index)}
        />
      </Grid>
      <Grid item xs={6}>
        <CustomTextField
          other={{ required: true, size: 'small' }}
          label="Capture Longitude"
          name={getAnimalFieldName<IAnimalCapture>(name, 'capture_longitude', index)}
        />
      </Grid>
      <Grid item xs={6}>
        <CustomTextField
          other={{ required: true, size: 'small' }}
          label="Temp Capture Timestamp"
          name={getAnimalFieldName<IAnimalCapture>(name, 'capture_timestamp', index)}
        />
      </Grid>
      <Grid item />
      <Grid item xs={6}>
        <TextInputToggle label="Add comment about this Capture">
          <CustomTextField
            other={{ required: true, size: 'small' }}
            label="Capture Comment"
            name={getAnimalFieldName<IAnimalCapture>(name, 'capture_comment', index)}
          />
        </TextInputToggle>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={<Checkbox checked={showRelease} onChange={() => setShowRelease((s) => !s)} />}
          label={SurveyAnimalsI18N.animalCaptureReleaseRadio}
        />
      </Grid>
      {showRelease ? (
        <>
          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Release Latitude"
              name={getAnimalFieldName<IAnimalCapture>(name, 'release_latitude', index)}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Release Longitude"
              name={getAnimalFieldName<IAnimalCapture>(name, 'release_longitude', index)}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Temp Release Timestamp"
              name={getAnimalFieldName<IAnimalCapture>(name, 'release_timestamp', index)}
            />
          </Grid>
          <Grid item />
          <Grid item xs={6}>
            <TextInputToggle label="Add comment about this Release">
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label="Release Comment"
                name={getAnimalFieldName<IAnimalCapture>(name, 'release_comment', index)}
              />
            </TextInputToggle>
          </Grid>
        </>
      ) : null}
    </>
  );
};

export default CaptureAnimalForm;
