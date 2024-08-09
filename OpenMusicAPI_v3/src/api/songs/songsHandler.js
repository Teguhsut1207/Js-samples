const ValidationError = require('../../exceptions/validationError');
const { SongPayloadSchema } = require('./songsValidator');

class SongsHandler {
  constructor(service) {
    this._service = service;

    this.addSong = this.addSong.bind(this);
    this.getSongs = this.getSongs.bind(this);
    this.getSongById = this.getSongById.bind(this);
    this.editSongById = this.editSongById.bind(this);
    this.deleteSongById = this.deleteSongById.bind(this);
  }

  async addSong(request, h) {
    const validationResult = SongPayloadSchema.validate(request.payload);
    if (validationResult.error) {
      throw new ValidationError(validationResult.error.message);
    }

    const { title, year, genre, performer, duration, albumId } = request.payload;
    const songId = await this._service.addSong({ title, year, genre, performer, duration, albumId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongs(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs({ title, performer });
    return {
      status: 'success',
      data: {
        songs: songs,
      },
    };
  }

  async getSongById(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async editSongById(request) {
    const validationResult = SongPayloadSchema.validate(request.payload);
    if (validationResult.error) {
      throw new ValidationError(validationResult.error.message);
    }

    const { id } = request.params;
    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongById(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
