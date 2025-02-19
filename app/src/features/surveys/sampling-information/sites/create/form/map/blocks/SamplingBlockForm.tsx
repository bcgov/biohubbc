import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { AutocompleteWithList } from 'features/surveys/sampling-information/sites/components/autocomplete/AutocompleteWithList';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { IPostSiteBlockAssignment, IPostSurveyBlock } from '../../../CreateSamplingSitePage.interface';
import { BlockStratumCard } from '../../components/BlockStratumCard';

interface ISamplingBlockFormProps {
  /**
   * Assignment ID of the block
   */
  site_assignment_id: string;
  /**
   * Available survey blocks
   */
  blocks: IPostSurveyBlock[];
}

/**
 * Form for associating survey blocks with sampling sites
 * @param {ISamplingBlockFormProps} props
 * @returns
 */
export const SamplingBlockForm = (props: ISamplingBlockFormProps) => {
  const { site_assignment_id, blocks } = props;

  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();

  /**
   * Adds a site-block assignment to the form state
   */
  const handleAddBlock = (block: IAutocompleteFieldOption<string>) => {
    const newAssignment: IPostSiteBlockAssignment = {
      site_assignment_id: site_assignment_id,
      block_assignment_id: block.value
    };

    setFieldValue('site_block_assignments', [...new Set([...values.site_block_assignments, newAssignment])]);
  };

  console.log(values.site_block_assignments, 'assignments');

  /**
   * Removes a site-block assignment from formik
   */
  const handleRemoveBlock = (block: IAutocompleteFieldOption<string>) => {
    setFieldValue(
      'site_block_assignments',
      values.site_block_assignments.filter(
        (assignment) =>
          !(
            assignment.site_assignment_id === site_assignment_id &&
            assignment.block_assignment_id === block.value
          )
      )
    );
  };

  /**
   * Available blocks formatted as options
   */
  const blockOptions: IAutocompleteFieldOption<string>[] = blocks.map((block) => ({
    value: block.block_assignment_id,
    label: block.name,
    description: block.description
  }));

  console.log(values.site_block_assignments, 'existing assignments');

  /**
   * Get blocks assigned to this site
   */
  const selectedBlocks = values.site_block_assignments
    .filter((assignment) => assignment.site_assignment_id === site_assignment_id)
    .map((assignment) => {
      console.log('blocks for searching', blocks);
      const block = blocks.find((b) => b.block_assignment_id === assignment.block_assignment_id);
      console.log('block found', block);
      return block ? { value: block.block_assignment_id, label: block.name } : null;
    })
    .filter((block): block is IAutocompleteFieldOption<string> => block !== null);

  console.log(selectedBlocks, 'selectedBlocks');

  return (
    <AutocompleteWithList
      options={blockOptions}
      selectedItems={selectedBlocks}
      handleSelect={handleAddBlock}
      handleRemove={handleRemoveBlock}
      getOptionLabel={(option) => option.label}
      renderOptionDetails={(option) => <BlockStratumCard label={option.label} description={option.description || ''} />}
      placeholder="Select blocks"
      noOptionsText="No records found"
    />
  );
};
