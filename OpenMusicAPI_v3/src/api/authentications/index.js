const AuthenticationsHandler = require('./handler');
const routes = require('./routes');
const validator = require('./validator');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, { service, tokenManager, userService }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      service,
      userService,
      tokenManager,
      validator
    );
    server.route(routes(authenticationsHandler));
  },
};
