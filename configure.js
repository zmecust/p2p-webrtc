const API_PORT = '3000';

const API_ROOT = `http://localhost:${API_PORT}`;

const DEFAULT_ICE_SERVER = {
  url: 'turn:47.52.156.68:3478',
  credential: 'zmecust',
  username: 'zmecust',
};

module.exports = { API_PORT, API_ROOT, DEFAULT_ICE_SERVER };
