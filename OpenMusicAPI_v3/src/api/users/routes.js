const routes = (handler) => [
    {
      method: 'POST',
      path: '/users',
      handler: handler.postUserHandler,
      options: {
        auth: false, 
      },
    },
    {
      method: 'GET',
      path: '/users/{id}',
      handler: handler.getUserByIdHandler,
    },
  ];
   
  module.exports = routes;