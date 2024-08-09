const routes = (handler) => [
    {
      method: 'POST',
      path: '/albums',
      handler: handler.addAlbum,
      options: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/albums/{id}',
      handler: handler.getAlbumById,
      options: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/albums/{id}',
      handler: handler.editAlbumById,
      options: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/albums/{id}',
      handler: handler.deleteAlbumById,
      options: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/albums/{id}/covers',
      handler: handler.postAlbumCoverHandler,
      options: {
        auth: false,
        payload: {
          allow: 'multipart/form-data',
          multipart: true,
          output: 'stream',
          maxBytes: 512000,
        },
      },
    },
    {
      method: 'POST',
      path: '/albums/{id}/likes',
      handler: handler.postAlbumLikesHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
    {
      method: 'GET',
      path: '/albums/{id}/likes',
      handler: handler.getAlbumLikesHandler,
      options: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/albums/{id}/likes',
      handler: handler.deleteAlbumLikesHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
  ];
  
  module.exports = routes;
  