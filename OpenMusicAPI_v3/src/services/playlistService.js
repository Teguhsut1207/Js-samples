// /services/playlistService.js
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const ClientError = require('../exceptions/clientError');
const AuthorizationError = require('../exceptions/authError');
const config = require('../../config');

class PlaylistService {
  constructor() {
    this._pool = new Pool(config.development);
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${uuidv4()}`;
    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new ClientError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
        GROUP BY playlists.id, users.username
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlistSong-${uuidv4()}`;
    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new ClientError('Lagu gagal ditambahkan ke playlist');
    }
    else await this.addPlaylistActivity(playlistId, userId, songId, 'add');
    return result.rows[0].id;
  }

  async getSongsFromPlaylist(id) {
    const playlistQuery = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id],
    };

    const songsQuery = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs LEFT JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [id],
    };

    const [playlistResult, songsResult] = await Promise.all([
      this._pool.query(playlistQuery),
      this._pool.query(songsQuery),
    ]);

    if (!playlistResult.rows.length) {
      throw new ClientError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;

    return playlist;
  }

  async getPlaylistById(id) {
    const playlistQuery = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id],
    };
    const playlistResult=await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new ClientError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];

    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Lagu gagal dihapus dari playlist. Id tidak ditemukan',400);
    }
    else await this.addPlaylistActivity(playlistId, userId, songId, 'delete');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini', 403);
    }
  }

  async verifySongExists(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Lagu tidak ditemukan');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: `
        SELECT *
        FROM playlists
        WHERE id = $1 AND (owner = $2 OR id IN (
          SELECT playlist_id
          FROM collaborations
          WHERE user_id = $2
        ))
      `,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini',403);
    }
  }

  async addPlaylistActivity(playlistId, userId, songId, action) {
    const id = `activity-${uuidv4()}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_activities (id, playlist_id, user_id, song_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, userId, songId, action, time],
    };
    await this._pool.query(query);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time 
        FROM playlist_activities
        LEFT JOIN users ON playlist_activities.user_id = users.id
        LEFT JOIN songs ON playlist_activities.song_id = songs.id
        WHERE playlist_activities.playlist_id = $1
        ORDER BY playlist_activities.time
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Playlist tidak ditemukan');
    }
    return result.rows;
  }
}

module.exports = PlaylistService;
