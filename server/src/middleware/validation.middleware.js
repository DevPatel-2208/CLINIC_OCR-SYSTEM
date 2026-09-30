const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    const issues = error.issues || error.errors || [];
    const details = issues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : e.path || '',
      message: e.message,
    }));
    if (!details.length) details.push({ message: error.message });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: { code: 'VALIDATION_ERROR', details },
    });
  }
};

module.exports = validate;