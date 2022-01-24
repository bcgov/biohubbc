import { render } from '@testing-library/react';
import React from 'react';
import DollarAmountField from './DollarAmountField';
import { Formik } from 'formik';

describe('DollarAmountField', () => {
  it('matches the snapshot without error', () => {
    const { asFragment } = render(
      <Formik initialValues={{}} onSubmit={async () => {}}>
        {() => <DollarAmountField id="amount" label="amount" name="amount" required={true} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches the snapshot with error', () => {
    const { asFragment } = render(
      <Formik
        initialValues={{
          amount: ''
        }}
        onSubmit={async () => {}}
        initialErrors={{ amount: 'error is here' }}
        initialTouched={{ amount: true }}>
        {() => <DollarAmountField id="amount" label="amount" name="amount" required={true} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
