// app/api/marketo/route.js — Next.js App Router API Route
// Proxies Campaign Builder requests to Marketo REST API

const MKTO_ENDPOINT = process.env.MKTO_ENDPOINT;
const MKTO_IDENTITY_URL = process.env.MKTO_IDENTITY_URL;
const MKTO_CLIENT_ID = process.env.MKTO_CLIENT_ID;
const MKTO_CLIENT_SECRET = process.env.MKTO_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const url = `${MKTO_IDENTITY_URL}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(MKTO_CLIENT_ID)}&client_secret=${encodeURIComponent(MKTO_CLIENT_SECRET)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.access_token) throw new Error(data.error_description || "Marketo auth failed");
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function mktoGet(path, token) {
  const res = await fetch(`${MKTO_ENDPOINT}${path}`, { headers: { "Authorization": `Bearer ${token}` } });
  return res.json();
}

async function mktoPost(path, token, params) {
  const res = await fetch(`${MKTO_ENDPOINT}${path}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  return res.json();
}

const actions = {
  async auth() {
    const token = await getToken();
    return { success: true, message: "Authenticated", tokenPreview: token.substring(0, 10) + "..." };
  },
  async findFolder(body) {
    const token = await getToken();
    const data = await mktoGet(`/asset/v1/folder/byName.json?name=${encodeURIComponent(body.name)}`, token);
    if (data.success && data.result?.length) {
      const match = body.rootHint ? data.result.find(f => f.path?.includes(body.rootHint)) || data.result[0] : data.result[0];
      return { success: true, result: match };
    }
    return { success: false, error: `Folder "${body.name}" not found` };
  },
  async createFolder(body) {
    const token = await getToken();
    const data = await mktoPost("/asset/v1/folders.json", token, { name: body.name, parent: JSON.stringify({ id: body.parentId, type: "Folder" }) });
    if (data.success && data.result?.length) return { success: true, result: data.result[0] };
    return { success: false, error: data.errors || "Create folder failed" };
  },
  async cloneProgram(body) {
    const token = await getToken();
    const data = await mktoPost(`/asset/v1/program/${body.templateId}/clone.json`, token, {
      name: body.name, folder: JSON.stringify({ id: body.folderId, type: "Folder" }),
      description: body.description || `Created by Campaign Builder on ${new Date().toISOString()}`,
    });
    if (data.success && data.result?.length) return { success: true, result: data.result[0] };
    return { success: false, error: data.errors || "Clone failed" };
  },
  async createProgram(body) {
    const token = await getToken();
    const data = await mktoPost("/asset/v1/programs.json", token, {
      name: body.name, type: body.type || "Default", channel: body.channel || "Email",
      folder: JSON.stringify({ id: body.folderId, type: "Folder" }),
      description: body.description || `Created by Campaign Builder on ${new Date().toISOString()}`,
    });
    if (data.success && data.result?.length) return { success: true, result: data.result[0] };
    return { success: false, error: data.errors || "Create program failed" };
  },
  async setToken(body) {
    const token = await getToken();
    const data = await mktoPost(`/asset/v1/folder/${body.programId}/tokens.json`, token, {
      name: body.name, type: body.type || "text", value: body.value, folderType: "Program",
    });
    if (data.success === false) {
      return { success: false, error: data.errors || data.warnings || "setToken failed" };
    }
    return { success: true, result: data.result || null };
  },
  async updateTags(body) {
    const token = await getToken();
    const data = await mktoPost(`/asset/v1/program/${body.programId}.json`, token, { tags: JSON.stringify(body.tags) });
    return { success: data.success !== false, result: data.result || null };
  },
  async getProgram(body) {
    const token = await getToken();
    const data = await mktoGet(`/asset/v1/program/${body.programId}.json`, token);
    if (data.success && data.result?.length) return { success: true, result: data.result[0] };
    return { success: false, error: "Program not found" };
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  if (!action || !actions[action]) {
    return Response.json({ success: false, error: `Unknown action: "${action}"` }, { status: 400 });
  }
  if (!MKTO_ENDPOINT || !MKTO_IDENTITY_URL || !MKTO_CLIENT_ID || !MKTO_CLIENT_SECRET) {
    return Response.json({ success: false, error: "Missing Marketo env vars" }, { status: 500 });
  }
  try {
    const result = await actions[action]({});
    return Response.json(result);
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  if (!action || !actions[action]) {
    return Response.json({ success: false, error: `Unknown action: "${action}"` }, { status: 400 });
  }
  if (!MKTO_ENDPOINT || !MKTO_IDENTITY_URL || !MKTO_CLIENT_ID || !MKTO_CLIENT_SECRET) {
    return Response.json({ success: false, error: "Missing Marketo env vars" }, { status: 500 });
  }
  try {
    const body = await request.json();
    const result = await actions[action](body);
    return Response.json(result);
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
