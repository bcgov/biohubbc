import { render } from '@testing-library/react';
import React from 'react';
import DollarAmountField from './DollarAmountField';
import { Formik } from 'formik';

describe('DollarAmountField', () => {
  it('matches the snapshot without error', () => {
    const { asFragment } = render(
      <Formik initialValues={{}} onSubmit={async () => {}}>
        {() => <DollarAmountField id="id" label="label" required={true} name="name" />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches the snapshot with error', () => {
    const { asFragment } = render(
      <Formik
        initialValues={{
          id: 'id',
          label: 'label',
          name: 'name'
        }}
        onSubmit={async () => {}}
        initialErrors={{ id: 'error is here' }}
        initialTouched={{ id: true }}>
        {() => <DollarAmountField id="id" label="label" required={true} name="name" />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
