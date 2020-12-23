export const tags = {
  description: 'Tags to idenfity the record',
  type: 'array',
  items: {
    type: 'string',
    enum: ['plant', 'animal', 'aquatic', 'terrestrial', 'invasive']
  },
  minItems: 2
};
