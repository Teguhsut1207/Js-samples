const PlaylistsHandler = require('./handler');
const routes = require('./routes');
const { validatePlaylistPayload, validateSongPayload } = require('./validator');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service}) => {
    const playlistsHandler = new PlaylistsHandler(service, { validatePlaylistPayload, validateSongPayload });
    server.route(routes(playlistsHandler));
  },
};
