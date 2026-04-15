export const createUserRequest = {
  username: { type: 'string', required: true, min: 2, max: 20, example: 'testuser' },
  password: { type: 'string', required: true, min: 6, example: '123456' },
};

export const userResponse = {
  id: { type: 'number', required: true, example: 1 },
  username: { type: 'string', required: true, example: 'testuser' },
  createdAt: { type: 'string', required: true, example: '2024-01-01T00:00:00.000Z' },
};