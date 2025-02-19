import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { AutocompleteWithList } from 'features/surveys/sampling-information/sites/components/autocomplete/AutocompleteWithList';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { IPostSiteBlockAssignment, IPostSurveySampleSite } from '../../../create/CreateSamplingSitePage.interface';
import { BlockStratumCard } from '../../../form/components/BlockStratumCard';

interface ISamplingBlockFormProps {
  /**
   * Assignment id of the site (Block ID)
   */
  block_assignment_id: string;
  /**
   * Survey sites available to be assigned to the block
   */
  sites: Omit<IPostSurveySampleSite, 'geojson'>[];
}

/**
 * Form to manage the assignment of sites to a specific block
 */
export const SamplingBlockForm = ({ block_assignment_id, sites }: ISamplingBlockFormProps) => {
  const { setFieldValue, values } = useFormikContext<ICreateSamplingSiteRequest>();

  /**
   * Adds a site-block assignment to the form state
   */
  const handleAddSite = (site: IAutocompleteFieldOption<string>) => {
    const newAssignment: IPostSiteBlockAssignment = {
      site_assignment_id: site.value,
      block_assignment_id,
    };

    // Adding the new site-block assignment, ensuring no duplicates
    setFieldValue('site_block_assignments', [
      ...values.site_block_assignments.filter(
        (assignment) => !(assignment.site_assignment_id === site.value && assignment.block_assignment_id === block_assignment_id)
      ),
      newAssignment,
    ]);
  };

  /**
   * Removes a site-block assignment from formik
   */
  const handleRemoveSite = (site: IAutocompleteFieldOption<string>) => {
    setFieldValue(
      'site_block_assignments',
      values.site_block_assignments.filter(
        (assignment) =>
          !(assignment.site_assignment_id === site.value && assignment.block_assignment_id === block_assignment_id)
      )
    );
  };

  /**
   * Available sites formatted as options
   */
  const siteOptions: IAutocompleteFieldOption<string>[] = sites.map((site) => ({
    value: site.site_assignment_id,
    label: site.name,
    description: site.description,
  }));

  /**
   * Get the sites that are already assigned to this block
   */
  const selectedSites = values.site_block_assignments
    .filter((assignment) => assignment.block_assignment_id === block_assignment_id) // Corrected comparison
    .map((assignment) => {
      const site = sites.find((s) => s.site_assignment_id === assignment.site_assignment_id);
      return site ? { value: site.site_assignment_id, label: site.name } : null;
    })
    .filter((site): site is IAutocompleteFieldOption<string> => site !== null);

  return (
    <AutocompleteWithList
      options={siteOptions}
      selectedItems={selectedSites}
      handleSelect={handleAddSite}
      handleRemove={handleRemoveSite}
      getOptionLabel={(option) => option.label}
      renderOptionDetails={(option) => <BlockStratumCard label={option.label} description={option.description || ''} />}
      placeholder="Select sampling sites"
      noOptionsText="No records found"
    />
  );
};
