import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { AutocompleteWithList } from 'features/surveys/sampling-information/sites/components/autocomplete/AutocompleteWithList';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { IPostSurveyBlock } from '../../../CreateSamplingSitePage.interface';
import { BlockStratumCard } from '../../components/BlockStratumCard';

interface ISamplingBlockFormProps {
  /**
   * Assignment id of the site
   */
  assignment_id: string;
  /**
   * Survey blocks
   */
  blocks: IPostSurveyBlock[];
}

/**
 * Returns a form for creating and editing which survey blocks are associated to a sampling site
 *
 * @returns
 */
export const SamplingBlockForm = (props: ISamplingBlockFormProps) => {
  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();

  const handleAddBlock = (block: IAutocompleteFieldOption<string>) => {
    setFieldValue(`site_block_assignments`, [
      ...values.site_block_assignments,
      { block_assignment_id: block.value, site_assignment_id: props.assignment_id }
    ]);
  };

  const handleRemoveItem = (block: IAutocompleteFieldOption<string>) => {
    setFieldValue(
      `site_block_assignments`,
      values.site_block_assignments.filter(
        (site_block_assignment) => site_block_assignment.block_assignment_id !== block.value
      )
    );
  };

  const blockOptions: IAutocompleteFieldOption<string>[] = props.blocks.map((block) => ({
    value: block.assignment_id,
    label: block.name,
    description: block.description
  }));

  console.log(blockOptions)
  console.log(values, 'vals')

  return (
    <AutocompleteWithList
      options={blockOptions}
      selectedItems={values.blocks
        .filter((block) =>
          values.site_block_assignments.some((assignment) => assignment.block_assignment_id === block.assignment_id)
        )
        .map((block) => ({
          value: block.assignment_id,
          label: block.name,
          description: block.description
        }))}
      handleSelect={handleAddBlock}
      handleRemove={handleRemoveItem}
      getOptionLabel={(option) => option.label}
      renderOptionDetails={(option) => <BlockStratumCard label={option.label} description={option.description || ''} />}
      placeholder="Select blocks"
      noOptionsText="No records found"
    />
  );
};
