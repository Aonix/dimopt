/**
 * Cloudflare Pages Function — POST /api/lead
 *
 * Validation and response shaping live in src/lib/lead.ts so this handler and the
 * Astro endpoint used during `astro dev` can never diverge.
 */
import { handleLeadRequest, jsonResponse, type LeadErrorBody } from '../../src/lib/lead';

interface PagesContext {
  request: Request;
}

export const onRequestPost = async (context: PagesContext): Promise<Response> =>
  handleLeadRequest(context.request);

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });

/** Anything that is not POST/OPTIONS gets a correct 405 rather than a stray 404. */
export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { method } = context.request;
  if (method === 'POST' || method === 'OPTIONS') {
    return handleLeadRequest(context.request);
  }
  return jsonResponse(
    { success: false, message: 'Method not allowed. Use POST.' } satisfies LeadErrorBody,
    405,
    { allow: 'POST, OPTIONS' },
  );
};
