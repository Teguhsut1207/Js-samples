const ClientError = require('../../exceptions/clientError');
const ValidationError = require('../../exceptions/validationError');
const { AlbumPayloadSchema } = require('./albumsValidator');

class AlbumsHandler {
  constructor(service, songService) {
    this._service = service;
    this._songService = songService;

    this.addAlbum = this.addAlbum.bind(this);
    this.getAlbumById = this.getAlbumById.bind(this);
    this.editAlbumById = this.editAlbumById.bind(this);
    this.deleteAlbumById = this.deleteAlbumById.bind(this);
  }

  async addAlbum(request, h) {
    const validationResult = AlbumPayloadSchema.validate(request.payload);
    if (validationResult.error) {
      throw new ValidationError(validationResult.error.message);
    }

    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumById(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    if (!album) {
      throw new ClientError('Album tidak ditemukan', 404);
    }

    let songs = [];
    try {
      songs = await this._songService.getSongsByAlbumId(id);
    } catch (error) {
      console.error('Error fetching songs:', error);
      songs = [];
    }

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs: songs || [],
        },
      },
    };
  }

  async editAlbumById(request) {
    const validationResult = AlbumPayloadSchema.validate(request.payload);
    if (validationResult.error) {
      throw new ValidationError(validationResult.error.message);
    }

    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumById(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
