/**
 * Astro endpoint — POST /api/lead
 *
 * This is the handler that runs under `astro dev` and `astro preview`. On
 * Cloudflare it is served by the adapter's worker; deployments that prefer the
 * Pages `functions/` convention get the identical behaviour from
 * functions/api/lead.ts. Both delegate to the same validator.
 */
import type { APIRoute } from 'astro';
import { handleLeadRequest, jsonResponse, type LeadErrorBody } from '@/lib/lead';

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleLeadRequest(request);

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });

export const ALL: APIRoute = () =>
  jsonResponse(
    { success: false, message: 'Method not allowed. Use POST.' } satisfies LeadErrorBody,
    405,
    { allow: 'POST, OPTIONS' },
  );
