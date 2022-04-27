import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import MultiAutocompleteField from './MultiAutocompleteField';

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
