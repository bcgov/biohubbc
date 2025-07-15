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

  // Get user IDs for Annika and Macgregor
  const [annikaUser] = await knex('system_user')
    .select('system_user_id')
    .where('user_identifier', 'ameijer');
    
  const [macgregorUser] = await knex('system_user')
    .select('system_user_id')
    .where('user_identifier', 'mauberti');

  // Add collection members
  await knex('collection_member').insert([
    {
      collection_id: collectionId,
      system_user_id: annikaUser.system_user_id,
      collection_role_id: 2, // Member role
      create_date: knex.fn.now(),
      create_user: 8
    },
    {
      collection_id: collectionId,
      system_user_id: macgregorUser.system_user_id,
      collection_role_id: 2, // Member role
      create_date: knex.fn.now(),
      create_user: 8
    }
  ]);
}
