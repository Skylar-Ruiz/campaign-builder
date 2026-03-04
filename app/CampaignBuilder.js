"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────
const T = {
  black: "#0A0A0A", white: "#FFFFFF", warmWhite: "#FAF8F5",
  w50: "#F5F2EE", w100: "#EDE9E3", w200: "#D9D3CB", w300: "#B8B0A4",
  w400: "#9A9084", w500: "#7A7068", w600: "#5C544C", w700: "#3D3732",
  dBlue: "#8EAEC4", dBlueLt: "#C8D8E4", dBlueXlt: "#E8EFF5", dBlueDk: "#5C8099",
  ok: "#4A7C59", okBg: "#E8F0EA", warn: "#B8860B", warnBg: "#FDF3E0",
  err: "#9E3A3A", errBg: "#F5E0E0", coral: "#D4755A", coralLt: "#F2D4CA",
};

// ─────────────────────────────────────────────
// BIRDIE — cute bird mascot in Sky Blue
// ─────────────────────────────────────────────
const Birdie = ({ size = 36, mood = "happy", style: sx = {} }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, ...sx }}>
    {/* Round body */}
    <ellipse cx="24" cy="27" rx="14" ry="13" fill={T.dBlue} />
    {/* Head */}
    <circle cx="24" cy="16" r="10" fill={T.dBlue} />
    {/* Wing — tucked on side */}
    <path d="M11 24c-3 2-5 6-4 10 1 2 3 3 5 2 3-2 4-6 3-9" fill="#7A9DB5" />
    <path d="M12 26c-1 2-1 5 0 7" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth=".8" strokeLinecap="round" />
    {/* Tail feathers */}
    <path d="M35 32c3 1 6 0 7-2s0-4-2-5" fill="#7A9DB5" />
    <path d="M36 30c2 0 4-1 4-3" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth=".8" strokeLinecap="round" />
    {/* Belly highlight */}
    <ellipse cx="24" cy="30" rx="8" ry="7" fill="rgba(255,255,255,.08)" />
    {/* Head highlight */}
    <ellipse cx="21" cy="12" rx="4" ry="3" fill="rgba(255,255,255,.14)" transform="rotate(-10 21 12)" />
    {/* Eyes */}
    <circle cx="20" cy={mood === "thinking" ? 15 : 16} r="2.2" fill="#fff" />
    <circle cx="28" cy={mood === "thinking" ? 15 : 16} r="2.2" fill="#fff" />
    {/* Pupils */}
    <circle cx={mood === "thinking" ? 20.5 : 20.8} cy={mood === "thinking" ? 15.5 : 16.3} r="1.1" fill="#2A2A2A" />
    <circle cx={mood === "thinking" ? 28.5 : 28.8} cy={mood === "thinking" ? 15.5 : 16.3} r="1.1" fill="#2A2A2A" />
    {/* Eye shine */}
    <circle cx="19.5" cy="15" r=".5" fill="#fff" />
    <circle cx="27.5" cy="15" r=".5" fill="#fff" />
    {/* Beak */}
    <path d="M23 19.5 L24 22 L25 19.5" fill="#E8A94E" stroke="#D49A3E" strokeWidth=".4" strokeLinejoin="round" />
    {/* Rosy cheeks */}
    <ellipse cx="16" cy="18" rx="2.2" ry="1.3" fill="rgba(220,140,140,.25)" />
    <ellipse cx="32" cy="18" rx="2.2" ry="1.3" fill="rgba(220,140,140,.25)" />
    {/* Smile */}
    {mood === "happy" && <path d="M22 20.5c1 1 3 1 4 0" fill="none" stroke="#D49A3E" strokeWidth=".7" strokeLinecap="round" />}
    {mood === "success" && <path d="M21.5 20.5c1.2 1.5 3.8 1.5 5 0" fill="none" stroke="#D49A3E" strokeWidth=".8" strokeLinecap="round" />}
    {/* Little feet */}
    <path d="M20 39c-1 1-2 1.5-3 1.5" fill="none" stroke="#D49A3E" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M20 39c0 1-.5 2-1 2.5" fill="none" stroke="#D49A3E" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M28 39c1 1 2 1.5 3 1.5" fill="none" stroke="#D49A3E" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M28 39c0 1 .5 2 1 2.5" fill="none" stroke="#D49A3E" strokeWidth="1.2" strokeLinecap="round" />
    {/* Thinking dots */}
    {mood === "thinking" && <>
      <circle cx="38" cy="8" r="1.8" fill={T.dBlueLt} opacity="0.6" />
      <circle cx="42" cy="4" r="1.2" fill={T.dBlueLt} opacity="0.4" />
    </>}
    {/* Success sparkle */}
    {mood === "success" && <>
      <path d="M38 10 L39 7 L40 10 L43 11 L40 12 L39 15 L38 12 L35 11Z" fill="#E8A94E" opacity="0.7" />
      <path d="M8 8 L8.5 6.5 L9 8 L10.5 8.5 L9 9 L8.5 10.5 L8 9 L6.5 8.5Z" fill="#E8A94E" opacity="0.5" />
    </>}
  </svg>
);

// ─────────────────────────────────────────────
// NAMING ENGINE
// ─────────────────────────────────────────────
function genName(d, regionOverride) {
  const now = new Date();
  const fy = `fy${now.getFullYear() - 1999}`;
  const m = now.getMonth() + 1;
  const q = m <= 3 ? "q1" : m <= 6 ? "q2" : m <= 9 ? "q3" : "q4";
  const rMap = { americas: "amer", emea: "emea", apac: "apac", global: "glbl" };
  const r = regionOverride || (Array.isArray(d.region) ? d.region[0] : d.region);
  const region = rMap[r] || "glbl";
  const tMap = { email: "email", conference: "event-conference", field_event: "event-field", webinar: "event-webinar", newsletter: "newsletter" };
  const type = tMap[d.campaign_type] || d.campaign_type;
  const slug = (d.campaign_descriptor || "untitled").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 40).replace(/-$/, "");
  return [fy, q, region, type, slug].filter(Boolean).join("-");
}
function genFolder(d) {
  const now = new Date(); const fy = `FY${now.getFullYear() - 1999}`; const m = now.getMonth() + 1;
  const q = m <= 3 ? "Q1" : m <= 6 ? "Q2" : m <= 9 ? "Q3" : "Q4";
  const fMap = { conference: "Events", field_event: "Events", webinar: "Webinars", email: "Email Sends", newsletter: "Newsletters" };
  return `01. Programs Active By Year By Month > ${fy} > ${fy} - ${q} > ${fy} - ${q} - ${fMap[d.campaign_type] || "Other"}`;
}
function genSmartCampaigns(d) {
  const t = d.campaign_type;
  if (t === "conference") return ["00. Split Batch", "01. Invite 1 (batches)", "01b. Fills out form", "02. Invite 2 (batches)", "02. Reminder (day of)", "03. Invite 3 (batches)", "Add from Popl Sync", "Add to campaign", "Attended", "No Show", "00. Follow Up (on-demand)"];
  if (t === "field_event") return ["00. Split Batch", "01. Invite 1 (batches)", "01b. Fills out form", "02. Invite 2 (batches)", "02. Reminder (day of)", "03. Invite 3 (batches)", "Add to campaign", "Attended", "No Show", "00. Follow Up (on-demand)"];
  if (t === "webinar") return ["00. On-Demand Form", "01. Registered Form Fill", "02. Confirmed to Attend", "03. Rejected", "01. Reminder (day before)", "02. Reminder (day of)", "Attended", "No Show", "Send On-Demand Links"];
  if (t === "email") return ["01. Send"];
  return ["01. Send", "Add to campaign"];
}

// ─────────────────────────────────────────────
// TYPES & STATUS
// ─────────────────────────────────────────────
const CTYPES = {
  email: { label: "Email Campaign", icon: "✉" },
  conference: { label: "Conference / Trade Show", icon: "◆" },
  field_event: { label: "Field Event / Dinner", icon: "◇" },
  webinar: { label: "Webinar Campaign", icon: "▶" },
  newsletter: { label: "Newsletter", icon: "⊟" },
};
const SCFG = {
  intake: { label: "Intake", color: T.w500, bg: T.w50 },
  pending_review: { label: "Pending Review", color: T.warn, bg: T.warnBg },
  approved: { label: "Approved", color: T.ok, bg: T.okBg },
  rejected: { label: "Rejected", color: T.err, bg: T.errBg },
  modifications_requested: { label: "Changes Requested", color: T.coral, bg: T.coralLt },
  building: { label: "Building", color: T.dBlue, bg: T.dBlueXlt },
  complete: { label: "Complete", color: T.ok, bg: T.okBg },
  failed: { label: "Failed", color: T.err, bg: T.errBg },
};

// ─────────────────────────────────────────────
// INTAKE QUESTIONS — streamlined, mapped to Marketo fields
// ─────────────────────────────────────────────
// Each question maps to a specific Marketo config:
//   campaign_type → Program Type & Channel
//   campaign_descriptor → Program Name (slug)
//   region → Program Tag: Region + Smart List geo filter
//   timeline_start/end → Program Period Cost dates + Schedule tab
//   success_metrics → Program Tag: Success Metric + Status progression
//   sfdc_sync → SFDC Campaign sync toggle
//   utm_params → Program Tokens: {{my.UTM Source}} etc.
//   Type-specific → Smart List filters, Flow steps, Tokens

const IQ = {
  initial: { id: "campaign_type", text: "Pick one to get started:", type: "select",
    options: Object.entries(CTYPES).map(([k, v]) => ({ value: k, label: `${v.icon}  ${v.label}` })), required: true },
  // For events: asked FIRST, before common questions. Auto-fills descriptor + region.
  event_prelude: [
    { id: "event_name_research", text: "What's the name of the event? I'll research the details for you.", type: "text", placeholder: "e.g., Shoptalk Spring, ViVE 2026, HIMSS", required: true,
      helperText: "→ I'll look up location, dates, attendance and auto-fill your campaign name + region" },
  ],
  common: [
    { id: "campaign_descriptor", text: "Short descriptor for this campaign — this becomes the Marketo program name.", type: "text", placeholder: "e.g., ViVE, Spark Delight, AI Readiness Survey", required: true,
      helperText: "→ Marketo: Program Name",
      validate: v => v.length >= 2 || "At least 2 characters" },
    { id: "region", text: "Which region(s)? Select multiple to create a program per region.", type: "multi_select",
      helperText: "→ Marketo: Region Program Tag — creates one program per region",
      options: [{ value: "americas", label: "Americas (AMER)" }, { value: "emea", label: "EMEA" }, { value: "apac", label: "APAC" }, { value: "global", label: "Global (GLBL)" }], required: true },
    { id: "timeline_start", text: "Launch date?", type: "date", required: true,
      helperText: "→ Marketo: Period Cost start + Schedule tab" },
    { id: "timeline_end", text: "End date? Skip for evergreen.", type: "date", required: false,
      helperText: "→ Marketo: Period Cost end date" },
    { id: "success_metrics", text: "How will you measure success?", type: "multi_select",
      helperText: "→ Marketo: Program Tag (Success Metric) + reporting config",
      options: [
        { value: "open_rate", label: "Open Rate" }, { value: "ctr", label: "Click-Through Rate" },
        { value: "conversion", label: "Conversion Rate" }, { value: "mqls", label: "MQLs Generated" },
        { value: "pipeline", label: "Pipeline Influenced" }, { value: "revenue", label: "Revenue Attributed" },
        { value: "brand_awareness", label: "Brand Awareness" }, { value: "registrations", label: "Registrations" },
        { value: "attendance", label: "Attendance Rate" },
      ], required: true },
  ],
  conditional: {
    email: [
      { id: "email_send_type", text: "What type of send?", type: "select",
        helperText: "→ Marketo: Smart Campaign type (batch vs trigger)",
        options: [{ value: "batch", label: "Batch (one-time)" }, { value: "trigger", label: "Trigger-based" }, { value: "ab_test", label: "A/B Test" }], required: true },
    ],
    webinar: [
      { id: "webinar_date", text: "Date and time?", type: "text", placeholder: "e.g., March 15, 2026 at 11:00 AM PT", required: true,
        helperText: "→ Marketo: Event Date token + Schedule tab" },
      { id: "on_demand", text: "Recording available on-demand after?", type: "select",
        helperText: "→ Marketo: On-Demand status + follow-up smart campaigns",
        options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], required: true },
    ],
    conference: [],
    field_event: [
      { id: "field_event_format", text: "What format?", type: "select",
        helperText: "→ Marketo: Program Token {{my.Event Format}}",
        options: [{ value: "dinner", label: "Executive Dinner" }, { value: "roundtable", label: "Roundtable" }, { value: "happy_hour", label: "Happy Hour / Cocktail" }, { value: "workshop", label: "Workshop" }, { value: "other", label: "Other" }], required: true },
    ],
    newsletter: [
      { id: "newsletter_frequency", text: "Send frequency?", type: "select",
        helperText: "→ Marketo: Recurring batch schedule",
        options: [{ value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Bi-weekly" }, { value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" }], required: true },
    ],
  },
  closing: [
    { id: "additional_notes", text: "Any other notes for MOps?", type: "textarea", placeholder: "e.g., Custom tags, special routing, UTM params...", required: false,
      helperText: "→ Free-form notes for the MOps team" },
  ],
};

// ─────────────────────────────────────────────
// MARKETO API — via Vercel proxy
// ─────────────────────────────────────────────

// Config is stored in component state and persisted via window.storage
const DEFAULT_CONFIG = {
  proxyUrl: "/api/marketo",
  templateMap: {
    email: "4686", conference: "5027", field_event: "3776", webinar: "3772", newsletter: "5015",
  },
  channelMap: {
    email: "Email", conference: "Event_Conference", field_event: "Event_Conference", webinar: "Event_Webinar", newsletter: "Email",
  },
  programTypeMap: {
    email: "Default", conference: "Event", field_event: "Event", webinar: "Event with Webinar", newsletter: "Default",
  },
  useLiveApi: false,
};

// ── Proxy helper ──
async function proxyCall(proxyUrl, action, body = {}) {
  const method = action === "auth" ? "GET" : "POST";
  const url = `${proxyUrl}?action=${action}`;
  const res = await fetch(url, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : {},
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || `Proxy action "${action}" failed`);
  return data;
}

// ── High-level operations (used by build flow) ──

async function mktoTestConnection(cfg) {
  return proxyCall(cfg.proxyUrl, "auth");
}

async function mktoResolveFolder(cfg, folderPath) {
  const parts = folderPath.split(" > ");
  let currentFolder = null;

  for (let i = 0; i < parts.length; i++) {
    try {
      const data = await proxyCall(cfg.proxyUrl, "findFolder", {
        name: parts[i],
        rootHint: parts[0],
      });
      currentFolder = data.result;
    } catch {
      // Folder not found — create it
      if (currentFolder) {
        const data = await proxyCall(cfg.proxyUrl, "createFolder", {
          name: parts[i],
          parentId: currentFolder.id,
        });
        currentFolder = data.result;
      } else {
        throw new Error(`Root folder "${parts[0]}" not found in Marketo`);
      }
    }
  }
  return currentFolder;
}

async function mktoCloneProgram(cfg, templateId, name, folderId) {
  const data = await proxyCall(cfg.proxyUrl, "cloneProgram", {
    templateId, name, folderId,
  });
  return data.result;
}

async function mktoCreateProgram(cfg, campaignData, folderId) {
  const data = await proxyCall(cfg.proxyUrl, "createProgram", {
    name: campaignData.marketoName,
    type: cfg.programTypeMap[campaignData.campaign_type] || "Default",
    channel: cfg.channelMap[campaignData.campaign_type] || "Email",
    folderId,
  });
  return data.result;
}

async function mktoSetAllTokens(cfg, programId, data) {
  const regionLabels = { americas: "Americas", emea: "EMEA", apac: "APAC", global: "Global" };
  const tokens = [
    ["Region", "text", regionLabels[data.region] || data.region],
    ["Campaign Type", "text", data.campaign_type],
  ];
  if (data.event_location) tokens.push(["Event Location", "text", data.event_location]);
  if (data.event_dates) tokens.push(["Event Date", "text", data.event_dates]);
  if (data.event_attendance) tokens.push(["Event Attendance", "text", data.event_attendance]);
  if (data.webinar_date) tokens.push(["Webinar Date", "text", data.webinar_date]);
  if (data.campaign_descriptor) tokens.push(["Campaign Name", "text", data.campaign_descriptor]);

  for (const [name, type, value] of tokens) {
    await proxyCall(cfg.proxyUrl, "setToken", { programId, name, type, value });
  }
}

async function mktoUpdateTags(cfg, programId, data) {
  const tags = [];
  if (data.region) {
    const regionLabels = { americas: "Americas", emea: "EMEA", apac: "APAC", global: "Global" };
    tags.push({ tagType: "Region", tagValue: regionLabels[data.region] || data.region });
  }
  if (data.success_metrics?.length) {
    tags.push({ tagType: "Success Metric", tagValue: Array.isArray(data.success_metrics) ? data.success_metrics[0] : data.success_metrics });
  }
  if (tags.length) {
    await proxyCall(cfg.proxyUrl, "updateTags", { programId, tags });
  }
}

// ── Simulated API (fallback when useLiveApi is off) ──
const SIM_API = {
  async createProgram(d) { await new Promise(r => setTimeout(r, 1400)); return { id: Math.floor(Math.random() * 90000) + 10000, name: d.marketoName, url: `https://app-ab39.marketo.com/#PG${Math.floor(Math.random() * 9000) + 1000}A1` }; },
  async resolveFolder() { await new Promise(r => setTimeout(r, 600)); return { id: 9999 }; },
  async setTokens() { await new Promise(r => setTimeout(r, 500)); },
  async updateTags() { await new Promise(r => setTimeout(r, 400)); },
};

// Event research via Anthropic API + web search (calls /api/research server-side)
async function researchEvent(eventName) {
  try {
    const res = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Research failed");
    const r = data.result;
    return {
      location: r.location || "TBD",
      dates: r.dates || "TBD",
      attendance: r.attendance || "TBD",
      description: r.description || `Event: ${eventName}`,
      eventType: r.eventType || null,
      inferredRegion: r.inferredRegion || null,
      inferredEventType: r.eventType || null,
    };
  } catch (err) {
    console.error("Research error:", err);
    return {
      location: "TBD — research unavailable",
      dates: "TBD",
      attendance: "TBD",
      description: `Event: ${eventName}`,
      eventType: null,
      inferredRegion: null,
      inferredEventType: null,
    };
  }
}

// ─────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────
const Badge = ({ status }) => { const c = SCFG[status] || SCFG.intake; return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 4, fontSize: 10, fontWeight: 600, color: c.color, background: c.bg, letterSpacing: "0.04em", textTransform: "uppercase" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, animation: status === "building" ? "pulse 1.5s infinite" : "none" }} />{c.label}</span>; };
const Dots = () => <div style={{ display: "flex", gap: 4, padding: "6px 0" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.w300, animation: `bounce 1.2s ${i * 0.15}s infinite` }} />)}</div>;

function NamePreview({ data }) {
  if (!data.campaign_type || !data.campaign_descriptor || !data.region) return null;
  const regions = Array.isArray(data.region) ? data.region : [data.region];
  const rLabels = { americas: "AMER", emea: "EMEA", apac: "APAC", global: "GLBL" };
  return (
    <div style={{ margin: "8px 0 0", padding: "8px 12px", borderRadius: 6, background: T.dBlueXlt, border: `1px solid ${T.dBlueLt}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: T.dBlue, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {regions.length > 1 ? `${regions.length} Programs` : "Auto-generated Name"}
        </div>
      </div>
      {regions.map(r => (
        <div key={r} style={{ marginBottom: regions.length > 1 ? 4 : 0 }}>
          {regions.length > 1 && <div style={{ fontSize: 9, color: T.dBlue, fontWeight: 600, marginBottom: 1 }}>{rLabels[r]}</div>}
          <div style={{ fontSize: 12, fontFamily: "var(--fm)", color: T.black, fontWeight: 600, wordBreak: "break-all" }}>{genName(data, r)}</div>
        </div>
      ))}
      <div style={{ fontSize: 9, color: T.w400, marginTop: 3 }}>📁 {genFolder(data)}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INTAKE CHAT
// ─────────────────────────────────────────────
function IntakeChat({ onComplete, existingData }) {
  const [msgs, setMsgs] = useState([]);
  const [curQ, setCurQ] = useState(null);
  const [ans, setAns] = useState(existingData || {});
  const [inp, setInp] = useState("");
  const [selOpts, setSelOpts] = useState([]);
  const [typing, setTyping] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState("initial");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const bot = useCallback((text, delay = 400) => new Promise(res => { setTyping(true); setTimeout(() => { setTyping(false); setMsgs(p => [...p, { role: "bot", text, ts: Date.now() }]); res(); }, delay); }), []);
  const user = useCallback((text) => setMsgs(p => [...p, { role: "user", text, ts: Date.now() }]), []);

  useEffect(() => { (async () => {
    await bot("Hey! I'm Birdie, your Marketo campaign builder. What type of campaign are you looking to build?", 500);
    setCurQ(IQ.initial); setPhase("initial");
  })(); }, [bot]);

  const getNext = useCallback((ph, idx, a) => {
    const isEvent = a.campaign_type === "conference" || a.campaign_type === "field_event";
    if (ph === "initial") {
      if (isEvent) return { phase: "event_prelude", index: 0 };
      return { phase: "common", index: 0 };
    }
    if (ph === "event_prelude") {
      if (idx + 1 < IQ.event_prelude.length) return { phase: "event_prelude", index: idx + 1 };
      // After event prelude: always skip descriptor (idx 0, auto-filled)
      // Skip region (idx 1) ONLY if it was auto-filled from location
      if (a._regionAutoFilled) return { phase: "common", index: 2 };
      return { phase: "common", index: 1 }; // ask region
    }
    if (ph === "common") {
      let nextIdx = idx + 1;
      // For events, always skip descriptor (idx 0) since it was auto-filled
      if (isEvent && nextIdx === 0) nextIdx = 1;
      // Skip region too if it was auto-filled
      if (isEvent && nextIdx === 1 && a._regionAutoFilled) nextIdx = 2;
      if (nextIdx < IQ.common.length) return { phase: "common", index: nextIdx };
      const c = IQ.conditional[a.campaign_type];
      if (c?.length) return { phase: "conditional", index: 0 };
      return { phase: "closing", index: 0 };
    }
    if (ph === "conditional") {
      const c = IQ.conditional[a.campaign_type] || [];
      let nextIdx = idx + 1;
      if (nextIdx < c.length) return { phase: "conditional", index: nextIdx };
      return { phase: "closing", index: 0 };
    }
    if (ph === "closing") { if (idx + 1 < IQ.closing.length) return { phase: "closing", index: idx + 1 }; return { phase: "complete", index: 0 }; }
    return { phase: "complete", index: 0 };
  }, []);

  const getQ = useCallback((p, i, a) => p === "event_prelude" ? IQ.event_prelude[i] : p === "common" ? IQ.common[i] : p === "conditional" ? (IQ.conditional[a.campaign_type] || [])[i] : p === "closing" ? IQ.closing[i] : null, []);

  const advanceTo = async (nextPhase, nextIdx, newA) => {
    if (nextPhase === "complete") {
      // Auto-defaults: always sync to SFDC, always use Popl for conferences
      newA.sfdc_sync = "yes";
      if (newA.campaign_type === "conference") newA.popl_sync = "yes";
      const regions = Array.isArray(newA.region) ? newA.region : [newA.region];
      if (regions.length === 1) {
        const name = genName(newA); newA.marketoName = name; newA.folderPath = genFolder(newA); newA.smartCampaigns = genSmartCampaigns(newA);
        await bot(`All set! "${name}" is ready for MOps review.`);
        setCurQ(null); setPhase("complete"); setTimeout(() => onComplete(newA), 500);
      } else {
        const programs = regions.map(r => {
          const copy = { ...newA, region: r };
          copy.marketoName = genName(copy, r); copy.folderPath = genFolder(copy); copy.smartCampaigns = genSmartCampaigns(copy);
          return copy;
        });
        await bot(`Creating ${programs.length} programs:\n${programs.map(p => `• ${p.marketoName}`).join("\n")}\n\nAll ready for MOps review.`);
        setCurQ(null); setPhase("complete"); setTimeout(() => onComplete(programs), 500);
      }
      return;
    }
    if (nextPhase === "event_prelude" && phase !== "event_prelude") await bot("Let's start with the event details.");
    if (nextPhase === "conditional" && phase !== "conditional") await bot(`A few ${CTYPES[newA.campaign_type]?.label?.toLowerCase()}-specific questions.`);
    if (nextPhase === "closing" && phase !== "closing") await bot("Last question.");
    setPhase(nextPhase); setQIdx(nextIdx); setCurQ(getQ(nextPhase, nextIdx, newA));
  };

  const handle = async (val, display) => {
    const qId = curQ?.id; if (!qId) return;
    if (curQ.required && (!val || (Array.isArray(val) && !val.length))) { await bot("This is required."); return; }
    if (curQ.validate) { const r = curQ.validate(val); if (r !== true) { await bot(r); return; } }
    user(display || val);
    const newA = { ...ans, [qId]: val }; setAns(newA); setInp(""); setSelOpts([]);

    // Contextual responses
    if (qId === "campaign_type") await bot(`${CTYPES[val]?.icon}  ${CTYPES[val]?.label} — got it.`);
    if (qId === "region") {
      const regions = Array.isArray(val) ? val : [val];
      const rLabels = { americas: "AMER", emea: "EMEA", apac: "APAC", global: "GLBL" };
      if (regions.length > 1 && newA.campaign_descriptor) {
        await bot(`${regions.length} regions selected — I'll create a separate program for each:\n${regions.map(r => `• ${genName(newA, r)}`).join("\n")}`);
      } else if (newA.campaign_descriptor) {
        await bot(`Program name: ${genName(newA)}`);
      }
    }

    // EVENT RESEARCH: auto-fill descriptor, region, location, dates, attendance
    if (qId === "event_name_research") {
      await bot(`Researching "${val}"...`, 300);
      setTyping(true);
      const info = await researchEvent(val);
      setTyping(false);

      // Auto-fill campaign descriptor from the event name
      newA.campaign_descriptor = val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 40).replace(/-$/, "");

      // Auto-fill event type if inferred
      if (info.inferredEventType) {
        newA.event_type = info.inferredEventType;
        newA._eventTypeAutoFilled = true;
      }

      newA.event_location = info.location;
      newA.event_dates = info.dates;
      newA.event_attendance = info.attendance;
      newA.event_description = info.description;

      // Auto-fill region ONLY if confidently inferred
      if (info.inferredRegion) {
        newA.region = [info.inferredRegion];
        newA._regionAutoFilled = true;
      }

      setAns(newA);

      const found = info.location && !info.location.startsWith("TBD");
      const regionLabels = { americas: "AMER", emea: "EMEA", apac: "APAC", global: "GLBL" };
      const eventTypeLabels = { conference: "Conference / Trade Show", field_event: "Field Event / Dinner", virtual: "Virtual Event", roadshow: "Roadshow" };

      if (found && info.inferredRegion) {
        const regionDisplay = regionLabels[info.inferredRegion];
        await bot(
          `Found it!\n📍 ${info.location}\n📅 ${info.dates}\n👥 ${info.attendance}` +
          `\n\n✅ Campaign name: ${newA.campaign_descriptor}` +
          `\n✅ Region: ${regionDisplay}` +
          (info.inferredEventType ? `\n✅ Type: ${eventTypeLabels[info.inferredEventType] || info.inferredEventType}` : "") +
          `\n\nYou can correct anything in the MOps review.`, 200
        );
      } else if (found) {
        await bot(
          `Found it!\n📍 ${info.location}\n📅 ${info.dates}\n👥 ${info.attendance}` +
          `\n\n✅ Campaign name: ${newA.campaign_descriptor}` +
          (info.inferredEventType ? `\n✅ Type: ${eventTypeLabels[info.inferredEventType] || info.inferredEventType}` : "") +
          `\n\nCouldn't determine the region automatically — I'll ask you next.`, 200
        );
      } else {
        await bot(
          `I searched the web but couldn't find detailed info for "${val}".` +
          `\n\n✅ Campaign name: ${newA.campaign_descriptor}` +
          (info.inferredEventType ? `\n✅ Type: ${eventTypeLabels[info.inferredEventType] || info.inferredEventType}` : "") +
          `\n\nYou'll be able to add location and dates in the MOps review. Let me ask you a few more questions.`, 200
        );
      }
    }

    const next = getNext(phase, qIdx, newA);
    await advanceTo(next.phase, next.index, newA);
  };

  const progress = (() => { const isEv = ans.campaign_type === "conference" || ans.campaign_type === "field_event"; const prelude = isEv ? IQ.event_prelude.length : 0; const commonSkipped = isEv ? 2 : 0; const t = 1 + prelude + (IQ.common.length - commonSkipped) + (IQ.conditional[ans.campaign_type] || []).length + IQ.closing.length; return Math.min((Object.keys(ans).length / t) * 100, 100); })();

  const renderInput = () => {
    if (!curQ) return null;
    const q = curQ;
    const btn = (active = false) => ({ padding: "8px 14px", borderRadius: 5, border: `1px solid ${active ? T.black : T.w200}`, background: active ? T.dBlueXlt : T.white, cursor: "pointer", fontSize: 12, fontFamily: "var(--fb)", color: active ? T.black : T.w600, fontWeight: active ? 600 : 400, transition: "all 0.12s" });

    if (q.type === "select") return <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 0" }}>{q.options.map(o => <button key={o.value} onClick={() => handle(o.value, o.label)} style={btn()} onMouseEnter={e => { e.target.style.borderColor = T.black; e.target.style.background = T.w50; }} onMouseLeave={e => { e.target.style.borderColor = T.w200; e.target.style.background = T.white; }}>{o.label}</button>)}</div>;

    if (q.type === "multi_select") return <div><div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 0" }}>{q.options.map(o => { const s = selOpts.includes(o.value); return <button key={o.value} onClick={() => setSelOpts(p => s ? p.filter(v => v !== o.value) : [...p, o.value])} style={btn(s)}>{s ? "✓ " : ""}{o.label}</button>; })}</div>{selOpts.length > 0 && <button onClick={() => { handle(selOpts, selOpts.map(v => q.options.find(o => o.value === v)?.label).join(", ")); }} style={{ marginTop: 4, padding: "8px 18px", borderRadius: 5, border: "none", background: T.black, color: T.white, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)" }}>Confirm ({selOpts.length})</button>}</div>;

    if (q.type === "date") return <div style={{ display: "flex", gap: 6, padding: "8px 0", alignItems: "center" }}><input type="date" value={inp} onChange={e => setInp(e.target.value)} style={{ padding: "8px 10px", borderRadius: 5, border: `1px solid ${T.w200}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none" }} /><button onClick={() => { if (inp) handle(inp); else if (!q.required) handle("", "N/A"); }} style={{ padding: "8px 16px", borderRadius: 5, border: "none", background: T.black, color: T.white, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)" }}>{inp ? "Confirm" : q.required ? "Select" : "Skip"}</button></div>;

    return <div style={{ display: "flex", gap: 6, padding: "8px 0", alignItems: "flex-end" }}>{q.type === "textarea" ? <textarea value={inp} onChange={e => setInp(e.target.value)} placeholder={q.placeholder} rows={2} style={{ flex: 1, padding: "8px 10px", borderRadius: 5, border: `1px solid ${T.w200}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none", resize: "vertical", lineHeight: 1.5 }} onFocus={e => e.target.style.borderColor = T.black} onBlur={e => e.target.style.borderColor = T.w200} /> : <input type="text" value={inp} onChange={e => setInp(e.target.value)} placeholder={q.placeholder} onKeyDown={e => { if (e.key === "Enter" && inp.trim()) handle(inp.trim()); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 5, border: `1px solid ${T.w200}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none" }} onFocus={e => e.target.style.borderColor = T.black} onBlur={e => e.target.style.borderColor = T.w200} />}<button disabled={q.required && !inp.trim()} onClick={() => { if (inp.trim()) handle(inp.trim()); else if (!q.required) handle("", "N/A"); }} style={{ padding: "8px 16px", borderRadius: 5, border: "none", background: q.required && !inp.trim() ? T.w200 : T.black, color: T.white, cursor: q.required && !inp.trim() ? "default" : "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)", whiteSpace: "nowrap" }}>{!q.required && !inp.trim() ? "Skip" : "Send"}</button></div>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 20px 8px", borderBottom: `1px solid ${T.w100}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: T.w400, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Intake</span>
          <span style={{ fontSize: 10, color: T.black, fontWeight: 600 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 2, borderRadius: 1, background: T.w100 }}><div style={{ height: "100%", borderRadius: 1, background: T.dBlue, width: `${progress}%`, transition: "width 0.5s" }} /></div>
        <NamePreview data={ans} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 6, alignItems: "flex-end", animation: "fadeIn 0.25s ease" }}>
            {m.role === "bot" && <Birdie size={26} mood="happy" />}
            <div style={{ maxWidth: "75%", padding: "9px 12px", fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-line", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? T.black : T.w50, color: m.role === "user" ? T.white : T.w700, wordBreak: "break-word" }}>{m.text}</div>
          </div>
        ))}
        {typing && <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}><Birdie size={26} mood="thinking" /><div style={{ padding: "9px 12px", borderRadius: "12px 12px 12px 2px", background: T.w50 }}><Dots /></div></div>}
        {curQ && !typing && (
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", animation: "fadeIn 0.25s ease" }}>
            <Birdie size={26} mood="happy" />
            <div style={{ maxWidth: "75%" }}>
              <div style={{ padding: "9px 12px", borderRadius: "12px 12px 12px 2px", background: T.w50, color: T.w700, fontSize: 12.5, lineHeight: 1.55 }}>
                {curQ.text}{curQ.required && <span style={{ color: T.coral, marginLeft: 2 }}>*</span>}
              </div>
              {curQ.helperText && <div style={{ fontSize: 9, color: T.dBlue, marginTop: 3, marginLeft: 4, fontFamily: "var(--fm)" }}>{curQ.helperText}</div>}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "4px 20px 12px", borderTop: `1px solid ${T.w100}` }}>{renderInput()}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MOPS REVIEW
// ─────────────────────────────────────────────
function MOpsReview({ request, onApprove, onReject, onRequestChanges, onUpdateData }) {
  const [fb, setFb] = useState(""); const [showFb, setShowFb] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const d = editing ? editData : request.data;
  const ti = CTYPES[d.campaign_type] || {};

  const startEdit = () => { setEditData({ ...request.data }); setEditing(true); };
  const cancelEdit = () => { setEditData(null); setEditing(false); };
  const saveEdit = () => {
    // Regenerate computed fields
    const updated = { ...editData };
    updated.marketoName = genName(updated);
    updated.folderPath = genFolder(updated);
    updated.smartCampaigns = genSmartCampaigns(updated);
    onUpdateData(request.id, updated);
    setEditing(false); setEditData(null);
  };
  const ed = (key, val) => setEditData(p => ({ ...p, [key]: val }));

  const F = ({ label, value, marketo, fieldKey, editType = "text", options }) => {
    if (!editing && (!value || (Array.isArray(value) && !value.length))) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.w400, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          {marketo && <div style={{ fontSize: 8, color: T.dBlue, fontFamily: "var(--fm)" }}>→ {marketo}</div>}
        </div>
        {editing && fieldKey ? (
          editType === "select" ? (
            <select value={editData[fieldKey] || ""} onChange={e => ed(fieldKey, e.target.value)}
              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: `1px solid ${T.dBlue}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none", marginTop: 3, background: T.dBlueXlt }}>
              {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : editType === "multi_select" ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {options?.map(o => {
                const sel = (editData[fieldKey] || []).includes(o.value);
                return <button key={o.value} onClick={() => {
                  const cur = editData[fieldKey] || [];
                  ed(fieldKey, sel ? cur.filter(v => v !== o.value) : [...cur, o.value]);
                }} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${sel ? T.dBlue : T.w200}`, background: sel ? T.dBlueXlt : T.white, color: sel ? T.dBlueDk : T.w400, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{o.label}</button>;
              })}
            </div>
          ) : editType === "textarea" ? (
            <textarea value={editData[fieldKey] || ""} onChange={e => ed(fieldKey, e.target.value)} rows={2}
              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: `1px solid ${T.dBlue}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none", marginTop: 3, resize: "vertical", boxSizing: "border-box", background: T.dBlueXlt }} />
          ) : (
            <input type={editType === "date" ? "date" : "text"} value={editData[fieldKey] || ""} onChange={e => ed(fieldKey, e.target.value)}
              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: `1px solid ${T.dBlue}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none", marginTop: 3, boxSizing: "border-box", background: T.dBlueXlt }} />
          )
        ) : (
          <div style={{ fontSize: 12.5, color: T.w700, lineHeight: 1.5, marginTop: 2 }}>{Array.isArray(value) ? value.join(", ") : value}</div>
        )}
      </div>
    );
  };
  const Section = ({ title, children }) => <div style={{ background: T.w50, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${T.w100}` }}><div style={{ fontSize: 11, fontWeight: 700, color: T.w600, marginBottom: 10 }}>{title}</div>{children}</div>;

  const regionOptions = [{ value: "americas", label: "Americas (AMER)" }, { value: "emea", label: "EMEA" }, { value: "apac", label: "APAC" }, { value: "global", label: "Global (GLBL)" }];
  const metricOptions = [
    { value: "open_rate", label: "Open Rate" }, { value: "ctr", label: "CTR" },
    { value: "conversion", label: "Conversion" }, { value: "mqls", label: "MQLs" },
    { value: "pipeline", label: "Pipeline" }, { value: "revenue", label: "Revenue" },
    { value: "brand_awareness", label: "Brand Awareness" }, { value: "registrations", label: "Registrations" },
    { value: "attendance", label: "Attendance" },
  ];

  return (
    <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Birdie size={32} mood="happy" />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 14, color: T.black, fontWeight: 700, fontFamily: "var(--fh)" }}>{d.marketoName}</h2>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}><Badge status={request.status} /><span style={{ fontSize: 10, color: T.w300 }}>{new Date(request.submittedAt).toLocaleString()}</span></div>
        </div>
        {(request.status === "pending_review" || request.status === "modifications_requested") && !editing && (
          <button onClick={startEdit} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${T.dBlue}`, background: T.dBlueXlt, color: T.dBlueDk, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "var(--fb)" }}>✎ Edit</button>
        )}
      </div>

      {editing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, padding: "8px 12px", borderRadius: 6, background: T.warnBg, border: `1px solid ${T.warn}` }}>
          <div style={{ fontSize: 11, color: T.warn, fontWeight: 600, flex: 1 }}>Editing mode — changes will regenerate the program name and folder path.</div>
          <button onClick={saveEdit} style={{ padding: "4px 12px", borderRadius: 4, border: "none", background: T.ok, color: T.white, cursor: "pointer", fontSize: 10, fontWeight: 700 }}>Save</button>
          <button onClick={cancelEdit} style={{ padding: "4px 12px", borderRadius: 4, border: `1px solid ${T.w200}`, background: T.white, color: T.w600, cursor: "pointer", fontSize: 10, fontWeight: 600 }}>Cancel</button>
        </div>
      )}

      <Section title="Marketo Configuration">
        <F label="Campaign Descriptor" value={d.campaign_descriptor} fieldKey="campaign_descriptor" marketo="Program Name slug" />
        <F label="Program Name" value={d.marketoName} marketo="Program Name (auto-generated)" />
        <F label="Folder" value={d.folderPath} marketo="Folder path (auto-generated)" />
        <F label="Region" value={{ americas: "Americas", emea: "EMEA", apac: "APAC", global: "Global" }[d.region] || d.region} fieldKey="region" editType="select" options={regionOptions} marketo="Region Tag" />
        <F label="SFDC Sync" value={d.sfdc_sync} fieldKey="sfdc_sync" editType="select" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} marketo="Sync toggle" />
        {d.smartCampaigns && <div><div style={{ fontSize: 9, fontWeight: 700, color: T.w400, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Smart Campaigns</div>{d.smartCampaigns.map((sc, i) => <div key={i} style={{ fontSize: 11, color: T.dBlueDk, fontFamily: "var(--fm)", padding: "2px 0" }}>{sc}</div>)}</div>}
      </Section>
      <Section title="Schedule & Metrics">
        <F label="Launch" value={d.timeline_start} fieldKey="timeline_start" editType="date" marketo="Period Cost start + Schedule" />
        <F label="End" value={d.timeline_end} fieldKey="timeline_end" editType="date" marketo="Period Cost end" />
        <F label="Success Metrics" value={d.success_metrics} fieldKey="success_metrics" editType="multi_select" options={metricOptions} marketo="Program Tag" />
      </Section>
      <Section title={`${ti.label || "Campaign"} Details`}>
        {d.event_location && <F label="Location" value={d.event_location} fieldKey="event_location" marketo="{{my.Event Location}}" />}
        {d.event_dates && <F label="Event Dates" value={d.event_dates} fieldKey="event_dates" marketo="{{my.Event Date}}" />}
        {d.event_attendance && <F label="Expected Attendance" value={d.event_attendance} fieldKey="event_attendance" />}
        {d.webinar_date && <F label="Webinar Date" value={d.webinar_date} fieldKey="webinar_date" />}
        {d.on_demand && <F label="On Demand" value={d.on_demand} fieldKey="on_demand" editType="select" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />}
        {d.field_event_format && <F label="Event Format" value={d.field_event_format} fieldKey="field_event_format" editType="select" options={[{ value: "dinner", label: "Executive Dinner" }, { value: "roundtable", label: "Roundtable" }, { value: "happy_hour", label: "Happy Hour" }, { value: "workshop", label: "Workshop" }, { value: "other", label: "Other" }]} />}
        {d.email_send_type && <F label="Send Type" value={d.email_send_type} fieldKey="email_send_type" editType="select" options={[{ value: "batch", label: "Batch" }, { value: "trigger", label: "Trigger" }, { value: "ab_test", label: "A/B Test" }]} />}
        {d.newsletter_frequency && <F label="Frequency" value={d.newsletter_frequency} fieldKey="newsletter_frequency" editType="select" options={[{ value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Bi-weekly" }, { value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" }]} />}
      </Section>
      <Section title="Notes">
        <F label="Notes" value={d.additional_notes || (editing ? "" : null)} fieldKey="additional_notes" editType="textarea" />
      </Section>
      {(request.status === "pending_review" || request.status === "modifications_requested") && !editing && (
        <div>
          {showFb && <textarea value={fb} onChange={e => setFb(e.target.value)} placeholder="Feedback..." rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: `1px solid ${T.w200}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onApprove} style={{ flex: 1, padding: "10px", borderRadius: 5, border: "none", background: T.black, color: T.white, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "var(--fb)" }}>Approve & Build</button>
            <button onClick={() => { if (!showFb) { setShowFb(true); return; } if (fb.trim()) onRequestChanges(fb); }} style={{ flex: 1, padding: "10px", borderRadius: 5, border: `1px solid ${T.w200}`, background: T.white, color: T.w700, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)" }}>Request Changes</button>
            <button onClick={() => { if (!showFb) { setShowFb(true); return; } onReject(fb); }} style={{ padding: "10px 14px", borderRadius: 5, border: `1px solid ${T.coralLt}`, background: T.errBg, color: T.err, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)" }}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// BUILD LOG
// ─────────────────────────────────────────────
function BuildLog({ steps, done }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><Birdie size={32} mood={done ? "success" : "thinking"} /><h3 style={{ margin: 0, fontSize: 14, color: T.black, fontWeight: 700, fontFamily: "var(--fh)" }}>{done ? "Build Complete!" : "Building in Marketo..."}</h3></div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
          {i < steps.length - 1 && <div style={{ position: "absolute", left: 9, top: 24, bottom: -2, width: 1, background: s.status === "done" ? T.ok : T.w100 }} />}
          <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700, background: s.status === "done" ? T.okBg : s.status === "running" ? T.dBlueXlt : T.w50, border: `1.5px solid ${s.status === "done" ? T.ok : s.status === "running" ? T.dBlue : T.w200}`, color: s.status === "done" ? T.ok : T.w400 }}>{s.status === "done" ? "✓" : "·"}</div>
          <div style={{ paddingBottom: 16, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.status === "pending" ? T.w300 : T.black }}>{s.label}{s.status === "running" && <span style={{ marginLeft: 5, fontSize: 9, color: T.dBlue, animation: "pulse 1.5s infinite" }}>Running...</span>}</div>
            {s.detail && <div style={{ fontSize: 10, color: T.w400 }}>{s.detail}</div>}
            {s.result && <div style={{ marginTop: 3, padding: "4px 8px", borderRadius: 3, background: T.okBg, fontSize: 10, color: T.ok, fontFamily: "var(--fm)" }}>{s.result}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────
function SettingsPanel({ config, setConfig, onClose }) {
  const [cfg, setCfg] = useState(config);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const update = (key, val) => setCfg(p => ({ ...p, [key]: val }));
  const updateTemplate = (key, val) => setCfg(p => ({ ...p, templateMap: { ...p.templateMap, [key]: val } }));
  const updateChannel = (key, val) => setCfg(p => ({ ...p, channelMap: { ...p.channelMap, [key]: val } }));

  const save = async () => {
    setSaving(true);
    setConfig(cfg);
    try { localStorage.setItem("mkto_config", JSON.stringify(cfg)); } catch {}
    setSaving(false);
    onClose();
  };

  const testConnection = async () => {
    if (!cfg.proxyUrl) { setTestResult("Enter your proxy URL first"); return; }
    setTestResult("testing");
    try {
      await mktoTestConnection(cfg);
      setTestResult("Connected! Marketo auth successful via proxy.");
    } catch (e) {
      setTestResult(`Failed: ${e.message}`);
    }
  };

  const I = ({ label, value, onChange, placeholder, type = "text", mono = false }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: T.w400, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "7px 10px", borderRadius: 5, border: `1px solid ${T.w200}`, fontSize: 11, fontFamily: mono ? "var(--fm)" : "var(--fb)", color: T.black, outline: "none", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = T.dBlue} onBlur={e => e.target.style.borderColor = T.w200} />
    </div>
  );

  return (
    <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: "var(--fh)", color: T.black }}>Marketo Connection</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.w400 }}>✕</button>
      </div>

      {/* Live toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 12px", borderRadius: 6, background: cfg.useLiveApi ? T.okBg : T.w50, border: `1px solid ${cfg.useLiveApi ? T.ok : T.w200}` }}>
        <button onClick={() => update("useLiveApi", !cfg.useLiveApi)}
          style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", position: "relative", background: cfg.useLiveApi ? T.ok : T.w300, transition: "all 0.2s" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.white, position: "absolute", top: 2, left: cfg.useLiveApi ? 18 : 2, transition: "left 0.2s" }} />
        </button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: cfg.useLiveApi ? T.ok : T.w600 }}>{cfg.useLiveApi ? "Live Mode" : "Simulated Mode"}</div>
          <div style={{ fontSize: 9, color: T.w400 }}>{cfg.useLiveApi ? "API calls go to Marketo via your Vercel proxy" : "Using mock data — no real changes"}</div>
        </div>
      </div>

      {/* Proxy URL */}
      <div style={{ background: T.w50, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${T.w100}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.w600, marginBottom: 4 }}>Vercel Proxy</div>
        <div style={{ fontSize: 9, color: T.w400, marginBottom: 10 }}>Your credentials are stored securely in Vercel environment variables — not in this app.</div>
        <I label="Proxy URL" value={cfg.proxyUrl} onChange={v => update("proxyUrl", v)} placeholder="https://campaign-builder-proxy.vercel.app/api/marketo" mono />
        <button onClick={testConnection} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${T.dBlue}`, background: T.dBlueXlt, color: T.dBlueDk, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "var(--fb)" }}>
          {testResult === "testing" ? "Testing..." : "Test Connection"}
        </button>
        {testResult && testResult !== "testing" && (
          <div style={{ marginTop: 6, fontSize: 10, color: testResult.startsWith("Connected") ? T.ok : T.err, fontFamily: "var(--fm)" }}>{testResult}</div>
        )}
      </div>

      {/* Template IDs */}
      <div style={{ background: T.w50, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${T.w100}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.w600, marginBottom: 4 }}>Template Program IDs</div>
        <div style={{ fontSize: 9, color: T.w400, marginBottom: 10 }}>Marketo Program IDs to clone for each campaign type</div>
        {Object.entries(CTYPES).map(([k, v]) => (
          <I key={k} label={`${v.icon} ${v.label}`} value={cfg.templateMap[k] || ""} onChange={v2 => updateTemplate(k, v2)} placeholder="Program ID (e.g., 1234)" mono />
        ))}
      </div>

      {/* Channel names */}
      <div style={{ background: T.w50, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${T.w100}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.w600, marginBottom: 4 }}>Channel Names</div>
        <div style={{ fontSize: 9, color: T.w400, marginBottom: 10 }}>Must match your Marketo instance (Admin → Tags → Channels)</div>
        {Object.entries(CTYPES).map(([k, v]) => (
          <I key={k} label={`${v.icon} ${v.label}`} value={cfg.channelMap[k] || ""} onChange={v2 => updateChannel(k, v2)} placeholder="e.g., Email Send" />
        ))}
      </div>

      {/* MOps Password */}
      <div style={{ background: T.w50, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${T.w100}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.w600, marginBottom: 4 }}>MOps Dashboard Password</div>
        <div style={{ fontSize: 9, color: T.w400, marginBottom: 10 }}>Stakeholders must enter this to access the MOps Dashboard</div>
        <I label="Password" value={cfg.mopsPassword || "birdie2026"} onChange={v => setCfg(p => ({ ...p, mopsPassword: v }))} placeholder="Set a password" />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} style={{ flex: 1, padding: "10px 16px", borderRadius: 5, border: "none", background: T.black, color: T.white, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "var(--fb)" }}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 5, border: `1px solid ${T.w200}`, background: T.white, color: T.w600, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function CampaignBuilder() {
  const [view, setView] = useState("stakeholder");
  const [reqs, setReqs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [buildSteps, setBuildSteps] = useState([]);
  const [buildResult, setBuildResult] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  const [mopsUnlocked, setMopsUnlocked] = useState(false);
  const [showMopsLogin, setShowMopsLogin] = useState(false);
  const [mopsPass, setMopsPass] = useState("");
  const [mopsPassError, setMopsPassError] = useState(false);
  const active = reqs.find(r => r.id === activeId);

  const MOPS_PASSWORD = config.mopsPassword || "birdie2026";

  const handleMopsAccess = () => {
    if (mopsUnlocked) { setView("mops"); return; }
    setShowMopsLogin(true); setMopsPass(""); setMopsPassError(false);
  };
  const submitMopsPass = () => {
    if (mopsPass === MOPS_PASSWORD) {
      setMopsUnlocked(true); setShowMopsLogin(false); setView("mops"); setMopsPass("");
    } else {
      setMopsPassError(true);
    }
  };

  // Load saved config on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = { value: localStorage.getItem("mkto_config") };
        if (stored?.value) setConfig(JSON.parse(stored.value));
      } catch {}
    })();
  }, []);

  const onIntake = (dataOrArray) => {
    const items = Array.isArray(dataOrArray) ? dataOrArray : [dataOrArray];
    const newReqs = items.map((data, i) => ({
      id: `REQ-${Date.now()}-${i}`,
      data,
      status: "pending_review",
      submittedAt: new Date().toISOString(),
      feedback: null,
    }));
    setReqs(p => [...p, ...newReqs]);
    setActiveId(newReqs[0].id);
    // Notify MOps via Slack
    items.forEach(data => {
      fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notify_new_request", campaignData: data, appUrl: window.location.origin }),
      }).catch(err => console.warn("Slack notify failed:", err));
    });
  };
  const upd = (id, st, ex = {}) => setReqs(p => p.map(r => r.id === id ? { ...r, status: st, ...ex } : r));

  const build = async (id) => {
    const req = reqs.find(r => r.id === id); if (!req) return;
    upd(id, "building");

    const steps = [
      { label: "Authenticating", status: "running" },
      { label: "Resolving Folder", detail: `→ ${req.data.folderPath}`, status: "pending" },
      { label: "Cloning Template Program", detail: req.data.marketoName, status: "pending" },
      { label: "Setting Tokens", status: "pending" },
      { label: "Configuring Tags", status: "pending" },
      { label: "Finalizing", status: "pending" },
    ];
    setBuildSteps([...steps]);

    try {
      if (config.useLiveApi) {
        // ── LIVE MARKETO API via proxy ──
        await mktoTestConnection(config);
        steps[0] = { ...steps[0], status: "done", result: "Authenticated" }; steps[1].status = "running"; setBuildSteps([...steps]);

        const folder = await mktoResolveFolder(config, req.data.folderPath);
        steps[1] = { ...steps[1], status: "done", result: `Folder ID: ${folder.id}` }; steps[2].status = "running"; setBuildSteps([...steps]);

        let program;
        const templateId = config.templateMap[req.data.campaign_type];
        if (templateId) {
          program = await mktoCloneProgram(config, templateId, req.data.marketoName, folder.id);
        } else {
          program = await mktoCreateProgram(config, req.data, folder.id);
        }
        steps[2] = { ...steps[2], status: "done", result: `Program ID: ${program.id}` }; steps[3].status = "running"; setBuildSteps([...steps]);

        await mktoSetAllTokens(config, program.id, req.data);
        steps[3] = { ...steps[3], status: "done", result: "Tokens set" }; steps[4].status = "running"; setBuildSteps([...steps]);

        await mktoUpdateTags(config, program.id, req.data);
        steps[4] = { ...steps[4], status: "done", result: "Tags configured" }; steps[5].status = "running"; setBuildSteps([...steps]);

        await new Promise(r => setTimeout(r, 400));
        steps[5] = { ...steps[5], status: "done", result: "Ready" }; setBuildSteps([...steps]);

        const res = { program: { id: program.id, name: program.name, url: program.url || `https://app-ab39.marketo.com/#PG${program.id}A1` } };
        setBuildResult(res); upd(id, "complete", { buildResult: res });
        // Notify via Slack
        fetch("/api/slack", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "notify_build_complete", campaignData: req.data, buildResult: res, appUrl: window.location.origin }),
        }).catch(err => console.warn("Slack build notify failed:", err));

      } else {
        // ── SIMULATED MODE ──
        await new Promise(r => setTimeout(r, 800));
        steps[0] = { ...steps[0], status: "done", result: "Simulated" }; steps[1].status = "running"; setBuildSteps([...steps]);

        const folder = await SIM_API.resolveFolder();
        steps[1] = { ...steps[1], status: "done", result: `Folder ID: ${folder.id}` }; steps[2].status = "running"; setBuildSteps([...steps]);

        const prog = await SIM_API.createProgram(req.data);
        steps[2] = { ...steps[2], status: "done", result: `Program ID: ${prog.id}` }; steps[3].status = "running"; setBuildSteps([...steps]);

        await SIM_API.setTokens();
        steps[3] = { ...steps[3], status: "done", result: "Tokens set" }; steps[4].status = "running"; setBuildSteps([...steps]);

        await SIM_API.updateTags();
        steps[4] = { ...steps[4], status: "done", result: "Tags configured" }; steps[5].status = "running"; setBuildSteps([...steps]);

        await new Promise(r => setTimeout(r, 400));
        steps[5] = { ...steps[5], status: "done", result: "Ready" }; setBuildSteps([...steps]);

        const res = { program: prog }; setBuildResult(res); upd(id, "complete", { buildResult: res });
      }
    } catch (e) {
      console.error("Build failed:", e);
      const failIdx = steps.findIndex(s => s.status === "running");
      if (failIdx >= 0) steps[failIdx] = { ...steps[failIdx], status: "done", result: `Error: ${e.message}` };
      setBuildSteps([...steps]);
      upd(id, "failed");
    }
  };

  const pendingN = reqs.filter(r => r.status === "pending_review").length;

  const renderStakeholder = () => {
    if (!active) return <IntakeChat onComplete={onIntake} />;
    if (active.status === "pending_review") {
      const pendingReqs = reqs.filter(r => r.status === "pending_review");
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
          <Birdie size={56} mood="thinking" style={{ marginBottom: 14 }} />
          <h2 style={{ margin: "0 0 4px", fontSize: 16, color: T.black, fontWeight: 700, fontFamily: "var(--fh)" }}>
            {pendingReqs.length > 1 ? `${pendingReqs.length} Programs Submitted` : "Submitted for Review"}
          </h2>
          {pendingReqs.map(r => (
            <div key={r.id} style={{ fontFamily: "var(--fm)", fontSize: 11, color: T.dBlueDk, marginBottom: 4, wordBreak: "break-all" }}>{r.data.marketoName}</div>
          ))}
          <div style={{ marginTop: 6 }}><Badge status="pending_review" /></div>
          <p style={{ color: T.w300, fontSize: 10, marginTop: 12 }}>Your request has been submitted. MOps will review and build it shortly.</p>
        </div>
      );
    }
    if (active.status === "modifications_requested") return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: 16, background: T.coralLt, borderBottom: `1px solid ${T.coral}30` }}><Badge status="modifications_requested" /><p style={{ margin: "6px 0 0", fontSize: 12, color: T.w700, lineHeight: 1.5 }}>{active.feedback}</p></div>
        <IntakeChat onComplete={data => { const u = { ...active.data, ...data }; u.marketoName = genName(u); u.folderPath = genFolder(u); u.smartCampaigns = genSmartCampaigns(u); upd(active.id, "pending_review", { data: u, feedback: null, submittedAt: new Date().toISOString() }); }} existingData={active.data} />
      </div>
    );
    if (active.status === "building" || active.status === "complete") return <BuildLog steps={buildSteps} done={active.status === "complete"} />;
    if (active.status === "complete" && buildResult) return (
      <div style={{ padding: 28, textAlign: "center" }}>
        <Birdie size={56} mood="success" style={{ margin: "0 auto 14px" }} />
        <h2 style={{ margin: "0 0 4px", fontSize: 16, color: T.black, fontWeight: 700, fontFamily: "var(--fh)" }}>Campaign Built!</h2>
        <a href={buildResult.program?.url || "#"} target="_blank" rel="noreferrer" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 5, background: T.black, color: T.white, textDecoration: "none", fontSize: 12, fontWeight: 700, marginTop: 12 }}>Open in Marketo →</a>
      </div>
    );
    if (active.status === "rejected") return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
        <Birdie size={56} mood="happy" style={{ marginBottom: 14, opacity: 0.5 }} />
        <h2 style={{ margin: "0 0 4px", fontSize: 16, color: T.black, fontWeight: 700, fontFamily: "var(--fh)" }}>Rejected</h2>
        {active.feedback && <p style={{ color: T.w400, fontSize: 12, maxWidth: 340, marginBottom: 14 }}>{active.feedback}</p>}
        <button onClick={() => { setActiveId(null); setBuildSteps([]); setBuildResult(null); }} style={{ padding: "9px 20px", borderRadius: 5, border: "none", background: T.black, color: T.white, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--fb)" }}>Start New</button>
      </div>
    );
    return null;
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: T.warmWhite, fontFamily: "var(--fb)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root { --fh: 'Source Serif 4', Georgia, serif; --fb: 'DM Sans', 'Helvetica Neue', sans-serif; --fm: 'JetBrains Mono', monospace; }
        * { box-sizing: border-box; margin: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.w200}; border-radius: 2px; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 48, background: T.white, borderBottom: `1px solid ${T.w100}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Birdie size={24} mood="happy" />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.black, letterSpacing: "-0.02em", fontFamily: "var(--fh)" }}>Campaign Builder</span>
          <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: T.w50, color: T.w400, fontWeight: 600, border: `1px solid ${T.w100}` }}>Marketo</span>
        </div>
        <div style={{ display: "flex", borderRadius: 5, background: T.w50, padding: 2 }}>
          <button onClick={() => setView("stakeholder")} style={{ padding: "5px 14px", borderRadius: 3, border: "none", background: view === "stakeholder" ? T.white : "transparent", color: view === "stakeholder" ? T.black : T.w400, cursor: "pointer", fontSize: 11, fontWeight: view === "stakeholder" ? 600 : 400, fontFamily: "var(--fb)", boxShadow: view === "stakeholder" ? `0 1px 2px ${T.w200}` : "none" }}>Stakeholder</button>
          <button onClick={handleMopsAccess} style={{ padding: "5px 14px", borderRadius: 3, border: "none", background: view === "mops" ? T.white : "transparent", color: view === "mops" ? T.black : T.w400, cursor: "pointer", fontSize: 11, fontWeight: view === "mops" ? 600 : 400, fontFamily: "var(--fb)", boxShadow: view === "mops" ? `0 1px 2px ${T.w200}` : "none", display: "flex", alignItems: "center", gap: 4 }}>{!mopsUnlocked && <span style={{ fontSize: 9 }}>🔒</span>}MOps Dashboard</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {mopsUnlocked && pendingN > 0 && <div onClick={() => setView("mops")} style={{ padding: "3px 8px", borderRadius: 3, background: T.warnBg, fontSize: 10, fontWeight: 600, color: T.warn, cursor: "pointer" }}>{pendingN} pending</div>}
          {mopsUnlocked && <div style={{ padding: "3px 8px", borderRadius: 3, fontSize: 9, fontWeight: 600, background: config.useLiveApi ? T.okBg : T.w50, color: config.useLiveApi ? T.ok : T.w400, border: `1px solid ${config.useLiveApi ? T.ok + "40" : T.w100}` }}>{config.useLiveApi ? "● Live" : "○ Simulated"}</div>}
          {mopsUnlocked && <button onClick={() => setShowSettings(true)} style={{ padding: "4px 8px", borderRadius: 3, border: `1px solid ${T.w200}`, background: T.white, cursor: "pointer", fontSize: 12, color: T.w500, fontFamily: "var(--fb)" }} title="Settings">⚙</button>}
          {active && mopsUnlocked && <button onClick={() => { setActiveId(null); setBuildSteps([]); setBuildResult(null); }} style={{ padding: "4px 10px", borderRadius: 3, border: `1px solid ${T.w200}`, background: T.white, cursor: "pointer", fontSize: 10, color: T.w500, fontFamily: "var(--fb)" }}>+ New</button>}
        </div>
      </div>

      {/* MOps Password Modal */}
      {showMopsLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowMopsLogin(false)}>
          <div style={{ background: T.white, borderRadius: 10, padding: 24, width: 320, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Birdie size={28} mood="thinking" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.black, fontFamily: "var(--fh)" }}>MOps Access</div>
                <div style={{ fontSize: 10, color: T.w400 }}>Enter password to access the dashboard</div>
              </div>
            </div>
            <input type="password" value={mopsPass} onChange={e => { setMopsPass(e.target.value); setMopsPassError(false); }}
              onKeyDown={e => e.key === "Enter" && submitMopsPass()}
              placeholder="Password" autoFocus
              style={{ width: "100%", padding: "9px 12px", borderRadius: 5, border: `1px solid ${mopsPassError ? T.err : T.w200}`, fontSize: 12, fontFamily: "var(--fb)", color: T.black, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
              onFocus={e => e.target.style.borderColor = T.dBlue} onBlur={e => e.target.style.borderColor = mopsPassError ? T.err : T.w200} />
            {mopsPassError && <div style={{ fontSize: 10, color: T.err, marginBottom: 8 }}>Incorrect password</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submitMopsPass} style={{ flex: 1, padding: "8px", borderRadius: 5, border: "none", background: T.black, color: T.white, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "var(--fb)" }}>Unlock</button>
              <button onClick={() => setShowMopsLogin(false)} style={{ padding: "8px 14px", borderRadius: 5, border: `1px solid ${T.w200}`, background: T.white, color: T.w500, cursor: "pointer", fontSize: 11, fontFamily: "var(--fb)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ maxWidth: view === "mops" ? 1050 : 680, margin: "14px auto", height: "calc(100% - 28px)", background: T.white, borderRadius: 10, boxShadow: `0 1px 3px ${T.w200}`, overflow: "hidden", border: `1px solid ${T.w100}`, display: "flex", flexDirection: "column" }}>
          {showSettings ? <SettingsPanel config={config} setConfig={setConfig} onClose={() => setShowSettings(false)} /> : view === "stakeholder" ? renderStakeholder() : !reqs.length ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.w300 }}>
              <Birdie size={48} mood="thinking" style={{ marginBottom: 10, opacity: 0.4 }} /><div style={{ fontSize: 12, fontWeight: 600, color: T.w500 }}>No requests yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", height: "100%" }}>
              <div style={{ width: 220, borderRight: `1px solid ${T.w100}`, overflowY: "auto", background: T.warmWhite }}>
                <div style={{ padding: "12px 12px 6px", fontSize: 9, fontWeight: 700, color: T.w400, textTransform: "uppercase", letterSpacing: "0.05em" }}>Requests ({reqs.length})</div>
                {reqs.map(r => (
                  <div key={r.id} onClick={() => setActiveId(r.id)} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: `1px solid ${T.w100}`, background: activeId === r.id ? T.w50 : "transparent", borderLeft: activeId === r.id ? `2px solid ${T.dBlue}` : "2px solid transparent" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.black, fontFamily: "var(--fm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>{r.data.marketoName}</div>
                    <Badge status={r.status} />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {active ? <MOpsReview request={active} onApprove={() => { upd(active.id, "approved"); build(active.id); setView("stakeholder"); }} onReject={fb => { upd(active.id, "rejected", { feedback: fb }); setView("stakeholder"); fetch("/api/slack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "notify_rejected", campaignData: { ...active.data, feedback: fb }, appUrl: window.location.origin }) }).catch(() => {}); }} onRequestChanges={fb => { upd(active.id, "modifications_requested", { feedback: fb }); setView("stakeholder"); }} onUpdateData={(id, newData) => { setReqs(prev => prev.map(r => r.id === id ? { ...r, data: newData } : r)); }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.w300, fontSize: 12 }}>Select a request</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
