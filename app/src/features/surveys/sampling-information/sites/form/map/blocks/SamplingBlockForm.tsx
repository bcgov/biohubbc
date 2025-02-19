import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { AutocompleteWithList } from 'features/surveys/sampling-information/sites/components/autocomplete/AutocompleteWithList';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useMemo } from 'react';
import yup from 'utils/YupSchema';
import { IPostSiteBlockAssignment, IPostSurveyBlock } from '../../../create/CreateSamplingSitePage.interface';
import { BlockStratumCard } from '../../components/BlockStratumCard';

export const SiteBlockAssignmentYupSchema = yup.array(
  yup.object({
    site_assignment_id: yup.string(),
    block_assignment_id: yup.string()
  })
);

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
 * Form for assigning a sampling site to one or more blocks
 *
 * NOTE: This form is for a single sampling site
 *
 * @param {ISamplingBlockFormProps} props
 * @returns
 */
export const SamplingBlockForm = (props: ISamplingBlockFormProps) => {
  const { site_assignment_id, blocks } = props;

  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();

  // Adds a site-block assignment to formik
  const handleAddBlock = (block: IAutocompleteFieldOption<string>) => {
    const newAssignment: IPostSiteBlockAssignment = {
      site_assignment_id: site_assignment_id,
      block_assignment_id: block.value
    };

    setFieldValue('site_block_assignments', [...new Set([...values.site_block_assignments, newAssignment])]);
  };

  // Removes a site-block assignment from formik
  const handleRemoveBlock = (block: IAutocompleteFieldOption<string>) => {
    setFieldValue(
      'site_block_assignments',
      values.site_block_assignments.filter(
        (assignment) =>
          !(assignment.site_assignment_id === site_assignment_id && assignment.block_assignment_id === block.value)
      )
    );
  };

  // Available blocks formatted as options
  const blockOptions: IAutocompleteFieldOption<string>[] = blocks.map((block) => ({
    value: block.block_assignment_id,
    label: block.name,
    description: block.description
  }));

  // Get blocks assigned to this site to display
  const selectedBlocks = useMemo(
    () =>
      values.site_block_assignments
        .filter((assignment) => assignment.site_assignment_id === site_assignment_id)
        .map((assignment) => {
          console.log('blocks for searching', blocks);
          const block = blocks.find((b) => b.block_assignment_id === assignment.block_assignment_id);
          console.log('block found', block);
          return block ? { value: block.block_assignment_id, label: block.name } : null;
        })
        .filter((block): block is IAutocompleteFieldOption<string> => block !== null),
    [values.site_block_assignments, site_assignment_id]
  );

  return (
    <AutocompleteWithList
      options={blockOptions}
      selectedItems={selectedBlocks}
      handleSelect={handleAddBlock}
      handleRemove={handleRemoveBlock}
      getOptionLabel={(option) => option.label}
      renderOptionDetails={(option) => <BlockStratumCard label={option.label} description={option.description || ''} />}
      placeholder="Select blocks"
      noOptionsText="No blocks found"
    />
  );
};
