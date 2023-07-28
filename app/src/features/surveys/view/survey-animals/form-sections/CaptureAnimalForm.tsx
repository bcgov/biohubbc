import { Box, Grid, Tab, Tabs } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment, useState } from 'react';
import { IAnimal, IAnimalCapture } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

type CaptureTabState = 'form' | 'map';

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

  const [tabState, setTabState] = useState<CaptureTabState[]>([]);
  const handleAdd = (pushfunc: (a: any) => void) => {
    pushfunc(newCapture);
    setTabState([...tabState, 'form']);
  };
  const handleRemove = (a: number, removeFunc: (a: number) => void) => {
    removeFunc(a);
    setTabState([...tabState.slice(0, a), ...tabState.slice(a + 1)]);
  };
  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalCaptureTitle}
            titleHelp={SurveyAnimalsI18N.animalCaptureHelp}
            btnLabel={SurveyAnimalsI18N.animalCaptureAddBtn}
            handleAddSection={() => handleAdd(push)}
            handleRemoveSection={(a) => handleRemove(a, remove)}>
            {values.capture.map((_cap, index) => (
              <Fragment key={`${name}-${index}-inputs`}>
                <Box>
                  <Tabs
                    value={tabState[index] === 'form' ? 0 : 1}
                    onChange={(e, newVal) => {
                      console.log(newVal);
                      setTabState([
                        ...tabState.slice(0, index),
                        newVal === 0 ? 'form' : 'map',
                        ...tabState.slice(index + 1)
                      ]);
                    }}>
                    <Tab label="Forms" />
                    <Tab label="Map" />
                  </Tabs>
                </Box>
                {tabState[index] === 'form' && (
                  <>
                    <Grid item xs={6}>
                      <CustomTextField
                        other={{ required: true, size: 'small' }}
                        label="Latitude"
                        name={`${name}.${index}.capture_latitude`}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomTextField
                        other={{ required: true, size: 'small' }}
                        label="Longitude"
                        name={`${name}.${index}.capture_longitude`}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomTextField
                        other={{ required: true, size: 'small' }}
                        label="Temp Capture Timestamp"
                        name={`${name}.${index}.capture_timestamp`}
                      />
                    </Grid>
                  </>
                )}
                {tabState[index] === 'map' && (
                  <Box>
                    <p>Map placeholder</p>
                  </Box>
                )}
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default CaptureAnimalForm;
