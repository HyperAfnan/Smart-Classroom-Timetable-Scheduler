/**
 * Subject Type Normalization & Validation Utilities
 *
 * Purpose:
 *   Provide a single canonical place to:
 *     - Map any user / Excel / API provided subject type string to its canonical enum value.
 *     - Validate batches of subject rows (e.g. imported from Excel) before insertion.
 *     - Offer helpful error messages with row numbers.
 *
 * Canonical Values (Title Case):
 *   Theory, Lab
 *
 * Usage Examples:
 *   import {
 *     normalizeSubjectType,
 *     validateSubjectRows,
 *     SUBJECT_TYPES
 *   } from "@/lib/subjectType";
 *
 *   // 1. Normalize a single value
 *   const type = normalizeSubjectType("theory"); // => "Theory"
 *
 *   // 2. Validate a batch (like parsed Excel rows)
 *   const { cleaned, errors } = validateSubjectRows(importedRows);
 *   if (errors.length) {
 *     // display errors and abort insert
 *   } else {
 *     // proceed with cleaned data (all types canonical)
 *   }
 *
 * Design Choices:
 *   - Case-insensitive matching.
 *   - Trims whitespace.
 *   - Does not throw for unknown values unless strict is requested.
 *   - Provides both a map OBJECT and an ARRAY so you can use whichever is convenient.
 */

/* ---------------------------------- Data ---------------------------------- */

/**
 * Canonical subject types (exported array for dropdowns / validation).
 */
export const SUBJECT_TYPES = Object.freeze(["Theory", "Lab"]);

/**
 * Internal lookup map (lowercase -> Canonical).
 * Extend here if you later introduce synonyms (e.g. "laboratory": "Lab").
 */
export const SUBJECT_TYPE_CANONICAL_MAP = Object.freeze({
  theory: "Theory",
  lab: "Lab",
});

/**
 * Reverse map (Canonical -> lowercase key) useful if you ever need
 * to compare quickly or store normalized lowercase.
 */
export const SUBJECT_TYPE_REVERSE_MAP = Object.freeze(
  SUBJECT_TYPES.reduce((acc, v) => {
    acc[v] = v.toLowerCase();
    return acc;
  }, {}),
);

/* --------------------------------- Helpers -------------------------------- */

/**
 * Normalize a single subject type value to its canonical form.
 *
 * @param {string|undefined|null} raw - Incoming type value.
 * @param {Object} [options]
 * @param {boolean} [options.strict=false] - If true, throws on unknown values.
 * @param {string|null} [options.fallback=null] - Returned when value cannot be normalized (and not strict).
 * @returns {string|null} Canonical value (e.g. "Theory") or fallback/null.
 *
 * @example
 * normalizeSubjectType("theory") // "Theory"
 * normalizeSubjectType("  LAB ") // "Lab"
 * normalizeSubjectType("unknown", { fallback: "Theory" }) // "Theory"
 * normalizeSubjectType("unknown", { strict: true }) // throws Error
 */
export function normalizeSubjectType(
  raw,
  { strict = false, fallback = null } = {},
) {
  if (raw == null) {
    if (strict) {
      throw new Error("Subject type missing (received null/undefined).");
    }
    return fallback;
  }

  const key = String(raw).trim().toLowerCase();
  if (!key) {
    if (strict) {
      throw new Error("Subject type is an empty string after trimming.");
    }
    return fallback;
  }

  const canonical = SUBJECT_TYPE_CANONICAL_MAP[key];
  if (canonical) return canonical;

  if (strict) {
    throw new Error(
      `Invalid subject type "${raw}". Allowed: ${SUBJECT_TYPES.join(", ")}`,
    );
  }
  return fallback;
}

/**
 * Validate and normalize an array of subject rows (e.g. parsed from Excel).
 *
 * Each row is expected to have a `type` field (or `subject_type` which
 * will be copied into `type` if `type` is absent).
 *
 * @param {Array<Object>} rows - Raw subject rows.
 * @param {Object} [options]
 * @param {boolean} [options.strict=false] - If true, unknown types produce errors (same as default behavior) BUT also
 *                                           rows with missing types are flagged.
 * @param {boolean} [options.autofill=false] - If true and a row has no recognizable type, sets a default (autofillDefault).
 * @param {string}  [options.autofillDefault="Theory"] - Default used when autofill is enabled.
 * @param {Array<string>} [options.allowed=SUBJECT_TYPES] - Allowed canonical values.
 * @returns {{ cleaned: Array<Object>, errors: Array<string> }}
 *
 * Notes:
 *  - Row index reported to user is 1-based + assumes a header row, so we add 2.
 *  - If you parse Excel differently, adjust the row number offset easily.
 */
export function validateSubjectRows(
  rows,
  {
    strict = false,
    autofill = false,
    autofillDefault = "Theory",
    allowed = SUBJECT_TYPES,
  } = {},
) {
  const errors = [];
  if (!Array.isArray(rows)) {
    return {
      cleaned: [],
      errors: ["Input to validateSubjectRows must be an array."],
    };
  }

  const allowedLower = new Set(allowed.map((v) => v.toLowerCase()));

  const cleaned = rows.map((original, idx) => {
    const rowNumber = idx + 2; // +1 for 1-based, +1 for header line
    const row = { ...original };

    // Accept 'subject_type' alias
    if (row.type == null && row.subject_type != null) {
      row.type = row.subject_type;
    }

    const raw = row.type;
    const normalized = normalizeSubjectType(raw, {
      strict: false,
      fallback: null,
    });

    if (normalized) {
      row.type = normalized;
      return row;
    }

    // Not normalized -> decide handling
    if (raw == null || String(raw).trim() === "") {
      const msg = `Row ${rowNumber}: Missing subject type.`;
      if (strict && !autofill) {
        errors.push(msg);
      } else if (autofill) {
        row.type = autofillDefault;
      } else {
        errors.push(`${msg} Allowed: ${allowed.join(", ")}`);
      }
      return row;
    }

    // Provided but invalid
    if (!allowedLower.has(String(raw).trim().toLowerCase())) {
      const msg = `Row ${rowNumber}: Invalid subject type "${raw}". Allowed: ${allowed.join(", ")}`;
      if (autofill) {
        row.type = autofillDefault;
      } else {
        errors.push(msg);
      }
    }

    return row;
  });

  return { cleaned, errors };
}

/**
 * Convenience predicate to check if a value is a valid canonical subject type.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidSubjectType(value) {
  return SUBJECT_TYPES.includes(value);
}

/**
 * Attempt to coerce a value directly; returns undefined if invalid.
 * Useful for optional chaining scenarios.
 * @param {string} value
 * @returns {string|undefined}
 */
export function coerceSubjectType(value) {
  try {
    const norm = normalizeSubjectType(value, { strict: true });
    return norm;
  } catch {
    return undefined;
  }
}

/**
 * Create a mapping object suitable for quickly normalizing large batches without
 * repeatedly running logic. (Micro-optimization for very large imports.)
 *
 * @returns {Object<string,string>} direct map of lowercase->canonical
 */
export function getSubjectTypeMap() {
  return { ...SUBJECT_TYPE_CANONICAL_MAP };
}
