import { Operation } from 'express-openapi';
import { Request, Response } from 'express';
import { getAPIUserDBConnection } from '../../database/db';
import { CollectionService } from '../../services/collection-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/collections');

const collectionService = new CollectionService();

/**
 * GET /api/collection
 * Fetch all collections.
 */
export const GET: Operation = async (req: Request, res: Response) => {
  const connection = getAPIUserDBConnection();

  try {
    await connection.open();

    const collections = await collectionService.getAllCollections(connection);

    await connection.commit();

    res.status(200).json(collections);
  } catch (error) {
    defaultLog.error({ label: 'GET /api/collection', message: 'error', error });
    connection.rollback();
    res.status(500).json({ error: 'Failed to fetch collections' });
  } finally {
    connection.release();
  }
};

GET.apiDoc = {
  description: 'Fetch all collections.',
  tags: ['collection'],
  responses: {
    200: {
      description: 'List of collections.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                collection_id: { type: 'integer' },
                name: { type: 'string' },
                objectives: { type: 'string' }
              }
            }
          }
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

/**
 * POST /api/collection
 * Create a new collection.
 */
export const POST: Operation = async (req: Request, res: Response) => {
  const connection = getAPIUserDBConnection();

  try {
    await connection.open();

    const newCollection = await collectionService.createCollection(connection, req.body);

    await connection.commit();

    res.status(201).json(newCollection);
  } catch (error) {
    defaultLog.error({ label: 'POST /api/collection', message: 'error', error });
    connection.rollback();
    res.status(500).json({ error: 'Failed to create collection' });
  } finally {
    connection.release();
  }
};

POST.apiDoc = {
  description: 'Create a new collection.',
  tags: ['collection'],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name', 'objectives'],
          properties: {
            name: { type: 'string' },
            objectives: { type: 'string' }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Collection created successfully.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              collection_id: { type: 'integer' },
              name: { type: 'string' },
              objectives: { type: 'string' }
            }
          }
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

/**
 * GET /api/collection/{collection_id}
 * Fetch a collection by ID.
 */
export const GET_BY_ID: Operation = async (req: Request, res: Response) => {
  const connection = getAPIUserDBConnection();

  try {
    await connection.open();

    const collection = await collectionService.getCollectionById(connection, Number(req.params.collection_id));

    await connection.commit();

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.status(200).json(collection);
  } catch (error) {
    defaultLog.error({ label: 'GET /api/collection/{collection_id}', message: 'error', error });
    connection.rollback();
    res.status(500).json({ error: 'Failed to fetch collection' });
  } finally {
    connection.release();
  }
};

GET_BY_ID.apiDoc = {
  description: 'Fetch a collection by ID.',
  tags: ['collection'],
  parameters: [
    {
      in: 'path',
      name: 'collection_id',
      required: true,
      schema: {
        type: 'integer'
      }
    }
  ],
  responses: {
    200: {
      description: 'Collection details.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              collection_id: { type: 'integer' },
              name: { type: 'string' },
              objectives: { type: 'string' }
            }
          }
        }
      }
    },
    404: {
      description: 'Collection not found.'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

/**
 * PUT /api/collection/{collection_id}
 * Update a collection by ID.
 */
export const PUT: Operation = async (req: Request, res: Response) => {
  const connection = getAPIUserDBConnection();

  try {
    await connection.open();

    const updatedCollection = await collectionService.updateCollection(
      connection,
      Number(req.params.collection_id),
      req.body
    );

    await connection.commit();

    if (!updatedCollection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.status(200).json(updatedCollection);
  } catch (error) {
    defaultLog.error({ label: 'PUT /api/collection/{collection_id}', message: 'error', error });
    connection.rollback();
    res.status(500).json({ error: 'Failed to update collection' });
  } finally {
    connection.release();
  }
};

PUT.apiDoc = {
  description: 'Update a collection by ID.',
  tags: ['collection'],
  parameters: [
    {
      in: 'path',
      name: 'collection_id',
      required: true,
      schema: {
        type: 'integer'
      }
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            objectives: { type: 'string' }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Collection updated successfully.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              collection_id: { type: 'integer' },
              name: { type: 'string' },
              objectives: { type: 'string' }
            }
          }
        }
      }
    },
    404: {
      description: 'Collection not found.'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

/**
 * DELETE /api/collection/{collection_id}
 * Delete a collection by ID.
 */
export const DELETE: Operation = async (req: Request, res: Response) => {
  const connection = getAPIUserDBConnection();

  try {
    await connection.open();

    const deleted = await collectionService.deleteCollection(connection, Number(req.params.collection_id));

    await connection.commit();

    if (!deleted) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    defaultLog.error({ label: 'DELETE /api/collection/{collection_id}', message: 'error', error });
    connection.rollback();
    res.status(500).json({ error: 'Failed to delete collection' });
  } finally {
    connection.release();
  }
};

DELETE.apiDoc = {
  description: 'Delete a collection by ID.',
  tags: ['collection'],
  parameters: [
    {
      in: 'path',
      name: 'collection_id',
      required: true,
      schema: {
        type: 'integer'
      }
    }
  ],
  responses: {
    204: {
      description: 'Collection deleted successfully.'
    },
    404: {
      description: 'Collection not found.'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};