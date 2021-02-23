import { WidgetProps } from '@rjsf/core';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import MultiSelectAutoComplete from './MultiSelectAutoComplete';

const renderContainer = (props: WidgetProps) => {
  return render(<MultiSelectAutoComplete {...props} />);
};

describe('MultiSelectAutoComplete', () => {
  afterEach(() => {
    cleanup();
  });

  describe('with no previously selected values', () => {
    const props: WidgetProps = {
      id: '123',
      options: {
        enumOptions: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
          { label: 'Option 3', value: 3 }
        ]
      },
      schema: {
        type: 'array',
        title: 'Multi Select Field Title',
        items: {
          type: 'number',
          anyOf: [
            {
              type: 'number',
              title: 'Option 1',
              enum: [1]
            },
            {
              type: 'number',
              title: 'Option 2',
              enum: [2]
            },
            {
              type: 'number',
              title: 'Option 3',
              enum: [3]
            }
          ]
        },
        uniqueItems: true
      },
      uiSchema: {
        'ui:widget': 'multi-select-autocomplete'
      },
      value: [], // No previous value(s) selected
      label: '',
      required: true,
      disabled: false,
      readonly: false,
      autofocus: false,
      formContext: {},
      multiple: true,
      rawErrors: [],
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {}
    };

    it('renders the form control', async () => {
      await act(async () => {
        const { findByText } = renderContainer(props);
        const formControl = await findByText('Multi Select Field Title');

        expect(formControl).toBeVisible();
      });
    });
  });

  describe('with previously selected values', () => {
    const props: WidgetProps = {
      id: 'root_multi_select_test',
      options: {
        enumOptions: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
          { label: 'Option 3', value: 3 }
        ]
      },
      schema: {
        type: 'array',
        title: 'Multi Select Field Title',
        items: {
          type: 'number',
          anyOf: [
            {
              type: 'number',
              title: 'Option 1',
              enum: [1]
            },
            {
              type: 'number',
              title: 'Option 2',
              enum: [2]
            },
            {
              type: 'number',
              title: 'Option 3',
              enum: [3]
            }
          ]
        },
        uniqueItems: true
      },
      uiSchema: {
        'ui:widget': 'multi-select-autocomplete'
      },
      value: [2, 3], // 2 Previous values selected (the 2nd and 3rd options)
      label: '',
      required: true,
      disabled: false,
      readonly: false,
      autofocus: false,
      formContext: {},
      multiple: true,
      rawErrors: [],
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {}
    };

    it('renders the form control', async () => {
      await act(async () => {
        const { findByText } = renderContainer(props);
        const formControl = await findByText('Multi Select Field Title');

        expect(formControl).toBeVisible();
      });
    });

    it('shows the previously selected values', async () => {
      await act(async () => {
        const { findByText } = renderContainer(props);
        const previousValue2 = await findByText('Option 2');
        const previousValue3 = await findByText('Option 3');

        expect(previousValue2).toBeVisible();
        expect(previousValue3).toBeVisible();
      });
    });
  });
});
