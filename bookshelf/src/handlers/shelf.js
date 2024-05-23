import Book from '../models/book.js';
import { nanoid } from 'nanoid';

let books = [];

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (readPage > pageCount) {
      return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
  }

  if (name==null){
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  const id = nanoid();
  const newBook = new Book(id, name, year, author, summary, publisher, pageCount, readPage, reading);
  books.push(newBook);

  return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
          bookId: id,
      },
  }).code(201);
};

const updateBookHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
      if (readPage > pageCount) {
          return h.response({
              status: 'fail',
              message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
          }).code(400);
      }

      if (name==null){
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      books[index] = {
          ...books[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
          finished: readPage === pageCount,
          updatedAt: updatedAt
      };

      return h.response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
      }).code(200);
  }

  return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
  }).code(404);
};

const getAllBooksHandler = (request, h) => {
  const { reading } = request.query;
  const { name } = request.query;
  const { finished } = request.query;

  let filteredBooks = books;
  if (reading !== undefined) {
      filteredBooks = books.filter(book => reading == 1 ? book.readPage > 0 : book.readPage === 0);
  }

  if (finished !== undefined) {
    filteredBooks = books.filter(book => finished == 1 ? book.finished===true : book.finished===false);
  }

  if (name !== undefined) {
    filteredBooks = filteredBooks.filter(book => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  const formattedBooks = filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher }));
  
  return h.response({
      status: 'success',
      data: {
          books: formattedBooks,
      },
  }).code(200).type('application/json');
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((b) => b.id === bookId);

  if (book) {
      return h.response({
          status: 'success',
          data: {
              book,
          },
      }).code(200).type('application/json');
  }

  return h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
  }).code(404).type('application/json');
};

const deleteBookHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
      books.splice(index, 1);
      return h.response({
          status: 'success',
          message: 'Buku berhasil dihapus',
      }).code(200).type('application/json');
  }

  return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404).type('application/json');
};

export { addBookHandler, updateBookHandler , getAllBooksHandler, getBookByIdHandler, deleteBookHandler};
