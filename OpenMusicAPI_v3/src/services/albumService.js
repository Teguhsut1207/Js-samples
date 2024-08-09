const { Pool } = require('pg');
const ClientError = require('../exceptions/clientError');
const config = require('../../config');
const { v4: uuidv4 } = require('uuid');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool(config.development);
    this._cacheService = cacheService;
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
      throw new ClientError('Album tidak ditemukan');
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
      throw new ClientError('Album tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan');
    }
  }

  async updateAlbumCover(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Album not found');
    }
  }

  async hasUserLikedAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async likeAlbum({ userId, albumId }) {
    await this.getAlbumById(albumId);

    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      values: [`like-${uuidv4()}`, userId, albumId],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async unlikeAlbum({ userId, albumId }) {
    await this.getAlbumById(albumId);

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return { count: JSON.parse(result), isCached: true };
    } catch {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const count = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(count));
      return { count, isCached: false };
    }
  }
}

module.exports = AlbumService;
