const app = require('../app');

describe('Auth middleware', () => {
  it('app should load', () => {
    expect(app).toBeDefined();
  });
  it('auth middleware should exist', () => {
    const auth = require('../middleware/auth.middleware');
    expect(typeof auth).toBe('function');
    expect(typeof auth.optional).toBe('function');
  });
  it('role middleware should block PATIENT from DOCTOR route', () => {
    const role = require('../middleware/role.middleware');
    const mw = role('DOCTOR');
    const req = { user: { role: 'PATIENT' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
