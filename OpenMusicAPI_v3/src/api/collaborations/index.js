const CollaborationsHandler = require('./handler');
const collaborationsRoutes = require('./routes');
const { validateCollaborationPayload } = require('./validator');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationService, playlistService, userService }) => {    
    const collaborationsHandler = new CollaborationsHandler(
      collaborationService,
      playlistService,
      userService,
      { validateCollaborationPayload }
    );
    server.route(collaborationsRoutes(collaborationsHandler));
  },
};

