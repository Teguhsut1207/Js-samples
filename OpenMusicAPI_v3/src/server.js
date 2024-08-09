const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/clientError');
const ValidationError = require('./exceptions/validationError');
const AuthorizationError = require('./exceptions/authError');
const path = require('path');
const fs = require('fs');
const Inert = require('@hapi/inert');

// Import plugins
const songsPlugin = require('./api/songs');
const albumsPlugin = require('./api/albums');
const usersPlugin = require('./api/users');
const authPlugin = require('./api/authentications');
const playlistsPlugin = require('./api/playlists');
const collaborationsPlugin = require('./api/collaborations');
const exportPlugin = require('./api/export');

// Import services
const SongService = require('./services/songService');
const AlbumService = require('./services/albumService');
const UserService = require('./services/userService');
const AuthService = require('./services/authService');
const PlaylistService = require('./services/playlistService');
const TokenManager = require('./tokenize/tokenManager');
const CollaborationService = require('./services/collaborationService');
const RabbitMQService = require('./services/rabbitmqService');
const CacheService = require('./services/cacheService');

// Initialize services
const cacheService = new CacheService();
const songService = new SongService();
const albumService = new AlbumService(cacheService);
const userService = new UserService();
const authService = new AuthService();
const playlistService = new PlaylistService();
const collaborationService = new CollaborationService();


const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
  });

  await server.register([Inert,Jwt]);

  server.route({
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../uploads'),
        listing: false,
        index: false,
      },
    },
    options: {
      auth: false, 
    },
  });

  //create uploads folder if needed
  const upload_dir = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(upload_dir)) {
    fs.mkdirSync(upload_dir); 
  }
  const rabbitMQService = new RabbitMQService();
  await rabbitMQService.init();

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: async (artifacts) => {
      const { id } = artifacts.decoded.payload;
      const user = await userService.getUserById(id);

      if (!user) {
        throw new Error('Invalid token');
      }

      return {
        isValid: true,
        credentials: { id: user.id },
      };
    },
  });

  server.auth.default('openmusic_jwt');

  // Register plugins
  await server.register([
    {
      plugin: songsPlugin,
      options: { service: songService },
    },
    {
      plugin: albumsPlugin,
      options: { service: albumService, songService: songService,cacheService},
    },
    {
      plugin: usersPlugin,
      options: { service: userService },
    },
    {
      plugin: authPlugin,
      options: { service: authService, tokenManager: TokenManager, userService: userService },
    },
    {
      plugin: playlistsPlugin,
      options: { service: playlistService },
    },
    {
      plugin: collaborationsPlugin,
      options: { collaborationService, playlistService, userService },
    },
    {
      plugin: exportPlugin,
      options: {playlistService, producerService: rabbitMQService},
    },
  ]);
  
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response.isBoom) {
      console.error('Error details:', response);
      if (response instanceof ClientError || response instanceof ValidationError || response instanceof AuthorizationError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode || response.output.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

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
