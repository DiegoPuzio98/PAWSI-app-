// Deno Edge Function: get-mapbox-token
// Returns the public Mapbox token from secrets

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const token = Deno.env.get("MAPBOX_PUBLIC_TOKEN");

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  return new Response(JSON.stringify({ token }), { headers });
});