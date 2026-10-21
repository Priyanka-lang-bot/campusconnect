// A small Error subclass that carries an HTTP status code and optional details.
// Route handlers throw these; the central error handler turns them into JSON.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (details) this.details = details;
  }

  static badRequest(message = 'Bad request', details) {
    return new HttpError(400, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new HttpError(409, message);
  }
}

module.exports = HttpError;
