// app/api/research/route.js — Event research via Anthropic API + web search

export async function POST(request) {
  try {
    const { eventName } = await request.json();
    if (!eventName) {
      return Response.json({ success: false, error: "Missing eventName" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: "Missing ANTHROPIC_API_KEY env var" }, { status: 500 });
    }

    const systemPrompt = `You are a research assistant that looks up event/conference details. Given an event name, search the web and return ONLY a JSON object with these fields:

{
  "location": "Venue name, City, State/Country",
  "dates": "Month Day-Day, Year",
  "attendance": "~X,000 attendees",
  "description": "One sentence description of the event",
  "eventType": "conference" or "field_event" or "virtual" or null
}

Rules:
- eventType should be "conference" for conferences, summits, expos, trade shows, exhibitions, forums
- eventType should be "field_event" for dinners, roundtables, meetups, happy hours, executive events
- eventType should be "virtual" for online/virtual/digital events
- If you can't determine the type, set eventType to null
- If you can't find the event, still return the JSON with "TBD" for unknown fields
- Return ONLY the JSON object, no other text, no markdown backticks`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          { role: "user", content: `Look up this event and return details as JSON: "${eventName}"` }
        ],
      }),
    });

    const data = await res.json();

    if (data.error) {
      return Response.json({ success: false, error: data.error.message || "Anthropic API error" }, { status: 500 });
    }

    // Extract the text response (may have multiple content blocks from tool use)
    const textBlocks = (data.content || []).filter(b => b.type === "text").map(b => b.text);
    const fullText = textBlocks.join("\n");

    // Try to parse JSON from the response
    let parsed = null;
    try {
      // Try direct parse first
      parsed = JSON.parse(fullText.trim());
    } catch {
      // Try extracting JSON from within the text
      const jsonMatch = fullText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {}
      }
    }

    if (!parsed) {
      // Fallback: return what we got as description
      return Response.json({
        success: true,
        result: {
          location: "TBD — could not parse research results",
          dates: "TBD",
          attendance: "TBD",
          description: fullText.substring(0, 200),
          eventType: null,
        }
      });
    }

    // Infer region from location
    const loc = (parsed.location || "").toLowerCase();
    const amerKeywords = ["ca", " nv", " ny", " tx", " fl", "usa", "united states", "canada", "brazil", "mexico", "las vegas", "san francisco", "new york", "los angeles", "palm springs", "chicago", "austin", "miami", "boston", "seattle", "denver", "nashville", "orlando", "atlanta", "dallas", "houston", "san diego", "san jose", "san mateo", "san antonio"];
    const emeaKeywords = ["uk", "london", "paris", "berlin", "amsterdam", "lisbon", "portugal", "spain", "germany", "france", "ireland", "dublin", "dubai", "uae", "israel", "tel aviv", "stockholm", "copenhagen", "oslo", "milan", "rome", "barcelona", "manchester", "birmingham", "edinburgh"];
    const apacKeywords = ["tokyo", "singapore", "sydney", "melbourne", "australia", "japan", "korea", "india", "mumbai", "bangalore", "shanghai", "hong kong", "bangkok", "jakarta", "taipei", "seoul"];

    let inferredRegion = null;
    if (amerKeywords.some(k => loc.includes(k))) inferredRegion = "americas";
    else if (emeaKeywords.some(k => loc.includes(k))) inferredRegion = "emea";
    else if (apacKeywords.some(k => loc.includes(k))) inferredRegion = "apac";

    return Response.json({
      success: true,
      result: {
        location: parsed.location || "TBD",
        dates: parsed.dates || "TBD",
        attendance: parsed.attendance || "TBD",
        description: parsed.description || `Event: ${eventName}`,
        eventType: parsed.eventType || null,
        inferredRegion,
      }
    });

  } catch (err) {
    console.error("[research] Error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
