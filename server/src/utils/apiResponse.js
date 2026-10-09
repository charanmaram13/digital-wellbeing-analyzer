export class ApiResponse {
  static success(res, statusCode = 200, data = null, meta = null) {
    const payload = {
      success: true,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static error(res, statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_ERROR', details = null) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }
}

export default ApiResponse;
