const ClientError = require('./clientError');
 
class AuthenticationError extends ClientError {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}
 
module.exports = AuthenticationError;