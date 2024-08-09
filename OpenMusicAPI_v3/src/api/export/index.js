const ExportHandler = require('./handler');
const { validateExportPlaylistPayload } = require('./validator');

module.exports = {
  name: 'export',
  version: '1.0.0',
  register: async (server, { playlistService, producerService }) => {
    const exportHandler = new ExportHandler(playlistService, producerService, { validateExportPlaylistPayload });
    server.route([
      {
        method: 'POST',
        path: '/export/playlists/{playlistId}',
        handler: exportHandler.postExportPlaylistHandler,
        options: {
          auth: 'openmusic_jwt',
        },
      },
    ]);
  },
};
