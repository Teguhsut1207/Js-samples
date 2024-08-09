const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const ClientError = require('../exceptions/clientError');
const AuthorizationError = require('../exceptions/authError');
const config = require('../../config');

class CollaborationService {
  constructor() {
    this._pool = new Pool(config.development);
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${uuidv4()}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Kolaborasi gagal dihapus');
    }
  }

  async verifyUserCollaboration(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = CollaborationService;
