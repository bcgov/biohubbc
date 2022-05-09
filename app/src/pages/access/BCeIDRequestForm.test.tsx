import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import BCeIDRequestForm, { BCeIDRequestFormInitialValues, BCeIDRequestFormYupSchema } from './BCeIDRequestForm';

describe('BCeIDRequestForm', () => {
  it('matches the snapshot', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={BCeIDRequestFormInitialValues}
        validationSchema={BCeIDRequestFormYupSchema}
        onSubmit={async () => {}}>
        {() => <BCeIDRequestForm />}
      </Formik>
    );

    expect(getByTestId('company')).toBeVisible();
    expect(getByTestId('reason')).toBeVisible();
  });
});
