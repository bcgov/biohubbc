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
  sites: Omit<IPostSurveySampleSite, 'geojson'>[];
}

/**
 * Returns a form for creating and editing which survey blocks are associated to a sampling site
 *
 * @returns
 */
export const SamplingBlockForm = (props: ISamplingBlockFormProps) => {
  const { assignment_id, sites } = props;

  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();

  const handleAddBlock = (block: IAutocompleteFieldOption<string>) => {
    const newAssignment = { block_assignment_id: block.value, site_assignment_id: assignment_id };

    setFieldValue(`site_block_assignments`, [...new Set([...values.site_block_assignments, newAssignment])]);
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
    value: site.site_assignment_id,
    label: site.name,
    description: site.description
  }));

  // const selectedSites = sites
  //   .filter((site) =>
  //     values.site_block_assignments.some((assignment) => assignment.site_assignment_id === site.assignment_id)
  //   )
  //   .map((site) => ({
  //     value: site.assignment_id,
  //     label: site.name,
  //     description: site.description
  //   }));

  /**
   * Get blocks assigned to this site
   */
  const selectedSites = values.site_block_assignments
    // Filters for the current block
    .filter((assignment) => assignment.block_assignment_id === assignment_id)
    .map((assignment) => {
      const block = sites.find((s) => s.site_assignment_id === assignment.site_assignment_id);
      return block ? { value: block.site_assignment_id, label: block.name } : null;
    })
    .filter((block): block is IAutocompleteFieldOption<string> => block !== null);

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
