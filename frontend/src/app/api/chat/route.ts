import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Use the Cloud Run URL directly to bypass local backend requirements
    const CLOUD_RUN_URL = "https://x-layer-api-349808161165.us-central1.run.app";
    const targetUrl = `${CLOUD_RUN_URL}/chat`;

    console.log("[Nexus Proxy] Routing request to Cloud Run:", targetUrl);

    const response = await axios.post(targetUrl, body, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Proxy-Source': 'NextJS-Frontend'
      },
      timeout: 30000, 
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error("[Nexus Proxy] Error details:", error.response?.data || error.message);
    
    // Determine the most helpful error message
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail 
      || error.message 
      || "Sentry Backend is currently unreachable or timed out.";
    
    return NextResponse.json({ error: message }, { status });
  }
}
