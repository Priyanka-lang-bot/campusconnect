// Reusable validation middleware.
//
// A schema is a plain object describing each allowed field:
//   { title: { type: 'string', required: true, minLength: 3, maxLength: 120 } }
//
// validateBody(schema)                  -> full validation (POST / PUT)
// validateBody(schema, { partial: true }) -> only fields present are checked (PATCH)
//
// On success the cleaned data (trimmed strings, unknown fields removed) is put
// on req.validated. On failure a 400 response lists every problem per field,
// which the React forms display next to the matching inputs.
const HttpError = require('../utils/HttpError');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidDate(value) {
  if (!DATE_RE.test(value)) return false;
  // Rebuild the date in UTC and compare, which rejects values like 2026-02-31.
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function checkField(name, rule, raw) {
  const label = rule.label || name;
  let value = typeof raw === 'string' ? raw.trim() : raw;

  const empty = value === undefined || value === null || value === '';
  if (empty) {
    if (rule.required) return { error: `${label} is required.` };
    return { value: rule.nullable ? null : undefined };
  }

  switch (rule.type) {
    case 'string':
    case 'email': {
      if (typeof value !== 'string') return { error: `${label} must be text.` };
      if (rule.minLength && value.length < rule.minLength)
        return { error: `${label} must be at least ${rule.minLength} characters.` };
      if (rule.maxLength && value.length > rule.maxLength)
        return { error: `${label} must be at most ${rule.maxLength} characters.` };
      if (rule.type === 'email' && !EMAIL_RE.test(value))
        return { error: `${label} must be a valid email address.` };
      break;
    }
    case 'number': {
      value = typeof value === 'string' ? Number(value) : value;
      if (typeof value !== 'number' || Number.isNaN(value)) return { error: `${label} must be a number.` };
      if (rule.integer && !Number.isInteger(value)) return { error: `${label} must be a whole number.` };
      if (rule.min !== undefined && value < rule.min) return { error: `${label} must be at least ${rule.min}.` };
      if (rule.max !== undefined && value > rule.max) return { error: `${label} must be at most ${rule.max}.` };
      break;
    }
    case 'boolean':
      if (typeof value !== 'boolean') return { error: `${label} must be true or false.` };
      break;
    case 'date':
      if (typeof value !== 'string' || !isValidDate(value)) return { error: `${label} must be a date in YYYY-MM-DD format.` };
      break;
    case 'time':
      if (typeof value !== 'string' || !TIME_RE.test(value)) return { error: `${label} must be a time in HH:MM format.` };
      break;
    case 'array': {
      if (!Array.isArray(value)) return { error: `${label} must be a list.` };
      if (rule.maxItems && value.length > rule.maxItems) return { error: `${label} can have at most ${rule.maxItems} items.` };
      value = value
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter((item) => typeof item === 'string' && item.length > 0)
        .map((item) => item.slice(0, rule.itemMaxLength || 40));
      value = [...new Set(value)];
      break;
    }
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) return { error: `${label} must be an object.` };
      break;
    default:
      break;
  }

  if (rule.enum && !rule.enum.includes(value)) {
    return { error: `${label} must be one of: ${rule.enum.join(', ')}.` };
  }
  return { value };
}

function validate(schema, body = {}, { partial = false } = {}) {
  const errors = {};
  const data = {};

  for (const [name, rule] of Object.entries(schema)) {
    if (partial && !(name in body)) continue;
    const { error, value } = checkField(name, partial ? { ...rule, required: rule.required && name in body } : rule, body[name]);
    if (error) errors[name] = error;
    else if (value !== undefined) data[name] = value;
  }

  if (partial && Object.keys(data).length === 0 && Object.keys(errors).length === 0) {
    errors._ = 'Request body contains no updatable fields.';
  }
  return { errors, data, valid: Object.keys(errors).length === 0 };
}

const validateBody = (schema, options) => (req, res, next) => {
  if (req.body === undefined || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(HttpError.badRequest('Request body must be a JSON object.'));
  }
  const { valid, errors, data } = validate(schema, req.body, options);
  if (!valid) return next(HttpError.badRequest('Validation failed.', errors));
  req.validated = data;
  return next();
};

module.exports = { validate, validateBody };
