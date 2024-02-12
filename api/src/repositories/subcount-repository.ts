import { z } from 'zod';
import { BaseRepository } from './base-repository';

export const ObservationSubCountRecord = z.object({
  observation_subcount_id: z.number(),
  survey_observation_id: z.number(),
  subcount: z.number().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountRecord = z.infer<typeof ObservationSubCountRecord>;
export type InsertObservationSubCount = Pick<
  ObservationSubCountRecord,
  'observation_subcount_id' | 'survey_observation_id' | 'subcount'
>;

export const SubCountAttributeRecord = z.object({
  subcount_attribute_id: z.number(),
  observation_subcount_id: z.number(),
  critterbase_event_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SubCountAttributeRecord = z.infer<typeof SubCountAttributeRecord>;
export type InsertSubCountAttribute = Pick<SubCountAttributeRecord, 'observation_subcount_id' | 'critterbase_event_id'>;

export class SubCountRepository extends BaseRepository {
  async insertObservationSubCount(record: InsertObservationSubCount) {}

  async insertSubCountAttribute(observationSubCountId: number, records: InsertSubCountAttribute[]) {}
}
