import { render } from '@testing-library/react';
import React from 'react';
import WrapIfAdditional from './WrapIfAdditional';

describe('WrapIfAdditional', () => {
  it('matches the snapshot when no additional property flag', () => {
    const jsonSchema = { $schema: 'http://json-schema.org/schema#' };

    const { asFragment } = render(
      <WrapIfAdditional
        classNames="test-class"
        disabled={false}
        id="1"
        label="label"
        readonly={false}
        required={false}
        schema={jsonSchema}
        onDropPropertyClick={jest.fn()}
        onKeyChange={jest.fn()}>
        <p>This is wrap if additional component</p>
      </WrapIfAdditional>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches the snapshot when there is the additional property flag and not readonly', () => {
    const jsonSchema = { $schema: 'http://json-schema.org/schema#', __additional_property: true };

    const { asFragment } = render(
      <WrapIfAdditional
        classNames="test-class"
        disabled={false}
        id="1"
        label="label"
        readonly={false}
        required={false}
        schema={jsonSchema}
        onDropPropertyClick={jest.fn()}
        onKeyChange={jest.fn()}>
        <p>This is wrap if additional component</p>
      </WrapIfAdditional>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches the snapshot when there is the additional property flag and readonly', () => {
    const jsonSchema = { $schema: 'http://json-schema.org/schema#', __additional_property: true };

    const { asFragment } = render(
      <WrapIfAdditional
        classNames="test-class"
        disabled={false}
        id="1"
        label="label"
        readonly={true}
        required={false}
        schema={jsonSchema}
        onDropPropertyClick={jest.fn()}
        onKeyChange={jest.fn()}>
        <p>This is wrap if additional component</p>
      </WrapIfAdditional>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
