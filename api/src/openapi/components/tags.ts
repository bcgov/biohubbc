export const tags = {
  description: 'Tags to idenfity the record',
  type: 'array',
  items: {
    type: 'string',
    enum: ['project', 'plant', 'animal', 'aquatic', 'terrestrial', 'invasive']
  }
};
