const routes = (handler) => [
    {
      method: 'POST',
      path: '/songs',
      handler: handler.addSong,
      options: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/songs',
      handler: handler.getSongs,
      options: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/songs/{id}',
      handler: handler.getSongById,
      options: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/songs/{id}',
      handler: handler.editSongById,
      options: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/songs/{id}',
      handler: handler.deleteSongById,
      options: {
        auth: false,
      },
    },
  ];
  
  module.exports = routes;
  