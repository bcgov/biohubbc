import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import MultiAutocompleteField, {
  IMultiAutocompleteFieldOption,
  sortAutocompleteOptions
} from './MultiAutocompleteField';

describe('MultiAutocompleteField', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Formik initialValues={[]} onSubmit={async () => {}}>
        {() => (
          <MultiAutocompleteField
            id="id"
            label="label"
            options={[{ value: 'val', label: 'label', description: null }]}
            required={true}
            filterLimit={1}
          />
        )}
      </Formik>
    );

    expect(getByText('label')).toBeVisible();
  });

  describe('handleSortSelectedOption', () => {
    it('retains selected options if no remaining options are given', () => {
      const selected: IMultiAutocompleteFieldOption[] = [
        { value: 'value1', label: 'Value_1', description: null },
        { value: 'value2', label: 'Value_2', description: null },
        { value: 'value3', label: 'Value_3', description: null }
      ];

      const sorted = sortAutocompleteOptions(selected, []);
      expect(sorted.length).toEqual(3);
    });

    it('combines selected and given options in sorted order', () => {
      const selected: IMultiAutocompleteFieldOption[] = [
        { value: 'value1', label: 'Value_1', description: null },
        { value: 'value2', label: 'Value_2', description: null },
        { value: 'value3', label: 'Value_3', description: null }
      ];

      const optionsLeft: IMultiAutocompleteFieldOption[] = [
        { value: 'value4', label: 'Value_4', description: null },
        { value: 'value5', label: 'Value_5', description: null }
      ];

      const sorted = sortAutocompleteOptions(selected, optionsLeft);
      expect(sorted.length).toEqual(5);
      expect(sorted[0].value).toEqual('value1');
    });

    it('removes duplicate options from selected and given options', () => {
      const selected: IMultiAutocompleteFieldOption[] = [
        { value: 'value1', label: 'Value_1', description: null },
        { value: 'value2', label: 'Value_2', description: null },
        { value: 'value3', label: 'Value_3', description: null }
      ];

      const optionsLeft: IMultiAutocompleteFieldOption[] = [
        { value: 'value2', label: 'Value_2', description: null },
        { value: 'value3', label: 'Value_3', description: null },
        { value: 'value4', label: 'Value_4', description: null }
      ];

      const sorted = sortAutocompleteOptions(selected, optionsLeft);
      expect(sorted.length).toEqual(4);
    });

    it('returns all given options if none are selected', () => {
      const optionsLeft: IMultiAutocompleteFieldOption[] = [
        { value: 'value2', label: 'Value_2', description: null },
        { value: 'value3', label: 'Value_3', description: null },
        { value: 'value4', label: 'Value_4', description: null }
      ];

      const sorted = sortAutocompleteOptions([], optionsLeft);
      expect(sorted.length).toEqual(3);
      expect(sorted[0].value).toEqual('value2');
    });
  });
});
