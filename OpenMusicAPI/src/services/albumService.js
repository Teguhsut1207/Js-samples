const { Pool } = require('pg');
const ClientError = require('../exceptions/clientError');
const config = require('../../config');
const { v4: uuidv4 } = require('uuid');

class AlbumService {
  constructor() {
    this._pool = new Pool(config.development);
  }

  async addAlbum({ name, year }) {
    const id = `album-${uuidv4()}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new ClientError('Album gagal ditambahkan', 500);
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }
  }
}

module.exports = AlbumService;
