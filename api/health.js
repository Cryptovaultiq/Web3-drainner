const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS })
}

export async function GET() {
  try {
    console.log('health: ok')
    return jsonResponse({ ok: true, timestamp: new Date().toISOString() })
  } catch (e) {
    console.error('health error', e)
    return jsonResponse({ ok: false, error: e?.message || String(e) }, 500)
  }
}

export async function POST(request) {
  return GET()
}
