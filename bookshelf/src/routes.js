import { addBookHandler, updateBookHandler,  getAllBooksHandler, getBookByIdHandler, deleteBookHandler} from './handlers/shelf.js';

const routes = [
    {
        method: 'POST',
        path: '/books',
        handler: addBookHandler,
    },
    {
        method: 'PUT',
        path: '/books/{bookId}',
        handler: updateBookHandler,
    },
    {
        method: 'GET',
        path: '/books/{bookId}',
        handler: getBookByIdHandler,
    },
    {
        method: 'GET',
        path: '/books',
        handler: getAllBooksHandler,
    },
    {
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: deleteBookHandler,
    },
];

export default routes;
