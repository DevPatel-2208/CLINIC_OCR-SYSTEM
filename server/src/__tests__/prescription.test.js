const { isPatient } = require('../utils/helpers');

describe('Helpers', () => {
  it('isPatient detects PATIENT role', () => {
    expect(isPatient({ role: 'PATIENT' })).toBe(true);
    expect(isPatient({ role: 'DOCTOR' })).toBe(false);
  });
});

describe('Prescription model transitions', () => {
  const Prescription = require('../models/Prescription');
  it('VALID_TRANSITIONS defines UPLOADED -> IMAGE_PROCESSING', () => {
    const p = new Prescription({ processingStatus: 'UPLOADED' });
    expect(p.canTransitionTo('IMAGE_PROCESSING')).toBe(true);
    expect(p.canTransitionTo('APPROVED')).toBe(false);
  });
  it('APPROVED can go back to NEEDS_REVIEW', () => {
    const p = new Prescription({ processingStatus: 'APPROVED' });
    expect(p.canTransitionTo('NEEDS_REVIEW')).toBe(true);
  });
});
