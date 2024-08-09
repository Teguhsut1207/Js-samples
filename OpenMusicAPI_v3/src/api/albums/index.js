const AlbumsHandler = require('./albumsHandler');
const routes = require('./albumsRoutes');

exports.plugin = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, songService, cacheService }) => {
    const albumsHandler = new AlbumsHandler(service, songService, cacheService);
    server.route(routes(albumsHandler));
  },
};
