class ExportHandler {
    constructor(playlistService, producerService, validator) {
      this._playlistsService = playlistService;
      this._producerService = producerService;
      this._validator = validator;
  
      this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }
  
    async postExportPlaylistHandler(request, h) {
      this._validator.validateExportPlaylistPayload(request.payload);
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;
      const { id: userId } = request.auth.credentials;
  
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
  
      const message = {
        playlistId,
        targetEmail,
      };
  
      await this._producerService.sendMessage('export:playlist', JSON.stringify(message));
  
      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    }
  }
  
  module.exports = ExportHandler;
  