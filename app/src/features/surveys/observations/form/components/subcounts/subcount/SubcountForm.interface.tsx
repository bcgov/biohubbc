import { SubcountMeasurementsForm } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountMeasurementsForm';

export type SubcountFormData = {
  /**
   * Unique id for react keys.
   */
  _id?: string;
  /**
   * The subcount record id.
   *
   * Will be null when creating a new subcount record, and will be non-null when editing an existing subcount record.
   */
  observation_subcount_id: number | null;
  /**
   * The count value for the subcount record.
   *
   * Ex: How many of the species were observed.
   */
  subcount: number | null;
  /**
   * The comment for the subcount record.
   */
  comment: string | null;
  /**
   * The markings for the subcount record.
   *
   * // TODO - future enhancement
   */
  markings?: never[];
} & SubcountMeasurementsForm;
