import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw('SET search_path = biohub;');

  const [collection] = await knex('collection')
    .insert({
      name: 'Andrews test collection',
      description: 'A collection of stores I visit for fun',
      parent_collection_id: null,
      create_date: knex.fn.now(),
      create_user: 8,
      update_date: knex.fn.now(),
      update_user: 8,
      revision_count: 1
    })
    .returning(['collection_id']);

  const collectionId = collection.collection_id;

  await knex('collection_links').insert([
    {
      name: 'Canadian Tire',
      description: 'Best hardware store on the planet',
      url: 'https://www.canadiantire.ca',
      collection_id: collectionId,
      create_date: knex.fn.now(),
      create_user: 8
    },
    {
      name: 'Costco',
      description: 'Cheap hotdogs',
      url: 'https://www.costco.ca',
      collection_id: collectionId,
      create_date: knex.fn.now(),
      create_user: 8
    }
  ]);
}
