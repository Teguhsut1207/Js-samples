const AlbumsHandler = require('./albumsHandler');
const routes = require('./albumsRoutes');

exports.plugin = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, songService }) => {
    const albumsHandler = new AlbumsHandler(service, songService);
    server.route(routes(albumsHandler));
  },
};
