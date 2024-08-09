const { Pool } = require('pg');
const config = require('../config');

class Service {
  constructor() {
    this._pool = new Pool(config.development);
  }

  async getPlaylistById(id) {
    const playlistQuery = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    const playlist = playlistResult.rows[0];

    return playlist;
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
      return null;
    }

    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;

    return playlist;
  }
}

module.exports = Service;
