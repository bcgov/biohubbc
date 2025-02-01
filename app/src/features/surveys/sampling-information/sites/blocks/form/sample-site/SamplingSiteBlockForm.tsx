import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { AutocompleteWithList } from 'features/surveys/sampling-information/sites/components/autocomplete/AutocompleteWithList';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { IPostSurveySampleSite } from '../../../create/CreateSamplingSitePage.interface';
import { BlockStratumCard } from '../../../create/form/components/BlockStratumCard';

interface ISamplingBlockFormProps {
  /**
   * Assignment id of the site
   */
  assignment_id: string;
  /**
   * Survey blocks
   */
  sites: IPostSurveySampleSite[];
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

  const siteOptions: IAutocompleteFieldOption<string>[] = props.sites.map((site) => ({
    value: site.assignment_id,
    label: site.name,
    description: site.description
  }));

  const selectedSites = values.survey_sample_sites
    .filter((site) =>
      values.site_block_assignments.some((assignment) => assignment.site_assignment_id === site.assignment_id)
    )
    .map((site) => ({
      value: site.assignment_id,
      label: site.name,
      description: site.description
    }));
  console.log(selectedSites, 'selected');

  return (
    <AutocompleteWithList
      options={siteOptions}
      selectedItems={selectedSites}
      handleSelect={handleAddBlock}
      handleRemove={handleRemoveItem}
      getOptionLabel={(option) => option.label}
      renderOptionDetails={(option) => <BlockStratumCard label={option.label} description={option.description || ''} />}
      placeholder="Select sampling sites"
      noOptionsText="No records found"
    />
  );
};
