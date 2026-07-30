/** Remove keys with undefined values — Firestore rejects undefined fields. */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (result[key] === undefined) {
      delete result[key];
    }
  }
  return result;
}

/** Agent / landlord-only profile fields — omit entirely for regular users. */
export function agentProfileFields(fields: {
  agencyName?: string;
  licenseNumber?: string;
  bio?: string;
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (fields.agencyName !== undefined && fields.agencyName !== '') {
    out.agencyName = fields.agencyName;
  }
  if (fields.licenseNumber !== undefined && fields.licenseNumber !== '') {
    out.licenseNumber = fields.licenseNumber;
  }
  if (fields.bio !== undefined && fields.bio !== '') {
    out.bio = fields.bio;
  }
  return out;
}
