/**
 * Shared, dependency-free lead validation.
 *
 * Imported by both the Astro endpoint (src/pages/api/lead.ts, used in dev/preview)
 * and the Cloudflare Pages Function (functions/api/lead.ts), so the contract can
 * never drift between the two runtimes.
 */

export const GOALS = [
  'drop-body-fat',
  'build-muscle',
  'athletic-conditioning',
  'stress-longevity',
] as const;

export const ENVIRONMENTS = ['guildford-facility', 'hybrid', 'remote'] as const;

export const ROADBLOCKS = [
  'time-shift-work',
  'nutrition',
  'joint-pain',
  'accountability',
] as const;

export type Goal = (typeof GOALS)[number];
export type Environment = (typeof ENVIRONMENTS)[number];
export type Roadblock = (typeof ROADBLOCKS)[number];

export interface LeadPayload {
  goal: Goal;
  environment: Environment;
  roadblock: Roadblock;
  fullName: string;
  town: string;
  phone: string;
  email: string;
  /** Honeypot: must be empty. Bots fill it, humans never see it. */
  company?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; errors: FieldError[] };

/** Deliberately permissive — rejects only what is unambiguously not an address. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** UK numbers, tolerant of spaces, +44, and (0). Needs 10-11 significant digits. */
const PHONE_RE = /^\+?[\d\s().-]{9,20}$/;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function inSet<T extends readonly string[]>(
  set: T,
  value: unknown,
): value is T[number] {
  return typeof value === 'string' && (set as readonly string[]).includes(value);
}

export function validateLead(body: unknown): ValidationResult {
  const errors: FieldError[] = [];

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: [{ field: 'body', message: 'Expected a JSON object.' }] };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot. Silently invalid — never explain why to the submitter.
  if (asString(raw['company']).length > 0) {
    return { ok: false, errors: [{ field: 'company', message: 'Rejected.' }] };
  }

  if (!inSet(GOALS, raw['goal'])) {
    errors.push({ field: 'goal', message: 'Choose a primary goal.' });
  }
  if (!inSet(ENVIRONMENTS, raw['environment'])) {
    errors.push({ field: 'environment', message: 'Choose where you want to train.' });
  }
  if (!inSet(ROADBLOCKS, raw['roadblock'])) {
    errors.push({ field: 'roadblock', message: 'Choose your biggest roadblock.' });
  }

  const fullName = asString(raw['fullName']);
  if (fullName.length < 2) {
    errors.push({ field: 'fullName', message: 'Enter your full name.' });
  }

  const town = asString(raw['town']);
  if (town.length < 2) {
    errors.push({ field: 'town', message: 'Enter your town or postcode.' });
  }

  const phone = asString(raw['phone']);
  const phoneDigits = phone.replace(/\D/g, '');
  if (!PHONE_RE.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 13) {
    errors.push({ field: 'phone', message: 'Enter a valid UK mobile number.' });
  }

  const email = asString(raw['email']);
  if (!EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      goal: raw['goal'] as Goal,
      environment: raw['environment'] as Environment,
      roadblock: raw['roadblock'] as Roadblock,
      fullName,
      town,
      phone,
      email,
    },
  };
}

export interface LeadSuccessBody {
  success: true;
  message: string;
  reference: string;
}

export interface LeadErrorBody {
  success: false;
  message: string;
  errors?: FieldError[];
}

/** Short, human-quotable reference so the success screen has something concrete. */
export function makeReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0');
  return `SEP-${stamp}${rand}`;
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
} as const;

export function jsonResponse(body: unknown, status: number, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...(extra as Record<string, string> | undefined) },
  });
}

/**
 * Runtime-agnostic request handler. Both the Astro endpoint and the Pages
 * Function delegate here, so behaviour is identical wherever it runs.
 */
export async function handleLeadRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      { success: false, message: 'Method not allowed. Use POST.' } satisfies LeadErrorBody,
      405,
      { allow: 'POST, OPTIONS' },
    );
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return jsonResponse(
      { success: false, message: 'Expected content-type: application/json.' } satisfies LeadErrorBody,
      415,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, message: 'Malformed JSON body.' } satisfies LeadErrorBody,
      400,
    );
  }

  const result = validateLead(body);
  if (!result.ok) {
    return jsonResponse(
      {
        success: false,
        message: 'Some answers need attention.',
        errors: result.errors,
      } satisfies LeadErrorBody,
      422,
    );
  }

  const reference = makeReference();

  // Demo sink. Swap for a CRM/webhook/KV write — the validated `result.data`
  // is already the exact shape a downstream system needs.
  console.log(
    '[lead]',
    JSON.stringify({ reference, receivedAt: new Date().toISOString(), ...result.data }),
  );

  return jsonResponse(
    {
      success: true,
      message: 'Application received',
      reference,
    } satisfies LeadSuccessBody,
    201,
  );
}
