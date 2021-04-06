import { render } from '@testing-library/react';
import React from 'react';
import DollarAmountField from './DollarAmountField';
import { Formik } from 'formik';

describe('DollarAmountField', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Formik initialValues={[]} onSubmit={async () => {}}>
        {() => <DollarAmountField id="id" label="label" required={true} name="name" />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
