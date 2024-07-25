const Hapi = require('@hapi/hapi');
const SongService = require('./services/songService');
const AlbumService = require('./services/albumService');
const songsPlugin = require('./api/songs/');
const albumsPlugin = require('./api/albums');
const ClientError = require('./exceptions/clientError');
const ValidationError = require('./exceptions/validationError');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
  });

  const songService = new SongService();
  const albumService = new AlbumService();

  // Register plugins
  await server.register([
    {
      plugin: songsPlugin,
      options: { service: songService },
    },
    {
      plugin: albumsPlugin,
      options: { service: albumService, songService: songService },
    },
  ]);

  // Centralized error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response.isBoom) {
      if (response instanceof ClientError || response instanceof ValidationError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // General server errors
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
