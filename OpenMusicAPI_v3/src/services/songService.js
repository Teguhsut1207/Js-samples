const { Pool } = require('pg');
const ClientError = require('../exceptions/clientError');
const config = require('../../config');
const { v4: uuidv4 } = require('uuid');

class SongService {
  constructor() {
    this._pool = new Pool(config.development);
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${uuidv4()}`;
    const query = {
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, "albumId") VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new ClientError('Lagu gagal ditambahkan', 501);
    }
    return result.rows[0].id;
  }


  async getSongs({ title, performer }) {
    let query = {
      text: 'SELECT id, title, performer FROM songs WHERE 1=1',
      values: [],
    };

    if (title) {
      query.text += ' AND LOWER(title) LIKE $' + (query.values.length + 1);
      query.values.push(`%${title.toLowerCase()}%`);
    }
  
    if (performer) {
      query.text += ' AND LOWER(performer) LIKE $' + (query.values.length + 1);
      query.values.push(`%${performer.toLowerCase()}%`);
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Lagu tidak ditemukan');
    }
    return result.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Lagu tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Lagu tidak ditemukan');
    }
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = SongService;
