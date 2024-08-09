const UsersHandler = require('./handler');
const routes = require('./routes');
const { validateUserPayload } = require('./validator');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service }) => {
    const usersHandler = new UsersHandler(service, { validateUserPayload });
    server.route(routes(usersHandler));
  },
};
