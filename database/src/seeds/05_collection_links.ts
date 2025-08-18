import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw('SET search_path = biohub;');

  const [collection] = await knex('collection')
    .insert({
      name: 'Test collection',
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit',
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
      name: 'BC Gov',
      description: 'BC Gov Homepage',
      url: 'https://www2.gov.bc.ca/gov/content/governments/government-id',
      collection_id: collectionId,
      create_date: knex.fn.now(),
      create_user: 8
    },
    {
      name: 'Species & Ecosystems Data & Information Security',
      description: 'The policy and procedures explain how secure species and ecosystems data and information will be handled, protected and distributed.',
      url: 'https://www2.gov.bc.ca/gov/content/governments/government-id',
      collection_id: collectionId,
      create_date: knex.fn.now(),
      create_user: 8
    }
  ]);
}
