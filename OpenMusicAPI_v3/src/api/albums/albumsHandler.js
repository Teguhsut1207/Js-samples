const ValidationError = require('../../exceptions/validationError');
const { AlbumPayloadSchema } = require('./albumsValidator');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class AlbumsHandler {
  constructor(service, songService, cacheService) {
    this._service = service;
    this._songService = songService;
    this._cacheService = cacheService;

    this.addAlbum = this.addAlbum.bind(this);
    this.getAlbumById = this.getAlbumById.bind(this);
    this.editAlbumById = this.editAlbumById.bind(this);
    this.deleteAlbumById = this.deleteAlbumById.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
    this.deleteAlbumLikesHandler = this.deleteAlbumLikesHandler.bind(this);
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
    }).code(201);
    return response;
  }

  async getAlbumById(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

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
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: album.cover_url,
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

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    const contentType = cover.hapi.headers['content-type'];
    if (!contentType.startsWith('image/')) {
      return h.response({
        status: 'fail',
        message: 'Invalid image format',
      }).code(400);
    }

    if (cover._data.length > 512000) {
      return h.response({
        status: 'fail',
        message: 'Cover size exceeds the limit of 512000 bytes',
      }).code(400);
    }

    const filename = `${uuidv4()}.${cover.hapi.filename.split('.').pop()}`;
    const filePath = path.join(__dirname, '../../../uploads', filename);

    const fileStream = fs.createWriteStream(filePath);
    cover.pipe(fileStream);

    await new Promise((resolve, reject) => {
      cover.on('end', resolve);
      cover.on('error', reject);
    });
  
    const baseUrl = `${request.server.info.uri}`;
    const coverUrl = `${baseUrl}/uploads/${filename}`;
  
    await this._service.updateAlbumCover(id, coverUrl);
  

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
    return response;
  }

  async postAlbumLikesHandler(request, h){
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    const hasLiked = await this._service.hasUserLikedAlbum(userId, albumId);
    if (hasLiked) {
      const response = h.response({
        status: 'fail',
        message: "User sudah pernah memberikan 'like'",
      }).code(400);
      return response;
    }

    await this._service.likeAlbum({ userId, albumId });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    }).code(201);
    return response;

  }

  async getAlbumLikesHandler(request, h){
    const { id: albumId } = request.params;

    const { count, isCached } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: count,
      },
    });
    response.header('X-Data-Source', isCached ? 'cache' : 'db');
    return response;
  }

  async deleteAlbumLikesHandler(request, h){
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.unlikeAlbum({ userId, albumId });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil di-unlike',
    }).code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
