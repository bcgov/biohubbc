import { render } from '@testing-library/react';
import React from 'react';
import MultiAutocompleteField from './MultiAutocompleteField';
import { Formik } from 'formik';

describe('MultiAutocompleteField', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Formik initialValues={[]} onSubmit={async () => {}}>
        {() => (
          <MultiAutocompleteField
            id="id"
            label="label"
            options={[{ value: 'val', label: 'label' }]}
            required={true}
            filterLimit={1}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
