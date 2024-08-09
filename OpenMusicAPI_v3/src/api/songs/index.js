const SongsHandler = require('./songsHandler');
const routes = require('./songsRoutes');

exports.plugin = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service }) => {
    const songsHandler = new SongsHandler(service);
    server.route(routes(songsHandler));
  },
};
