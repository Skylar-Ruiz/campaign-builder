// app/api/slack/route.js — Slack notifications via Anthropic API + Slack MCP
// Sends formatted campaign request summaries and build notifications

export async function POST(request) {
  try {
    const { action, campaignData, buildResult, appUrl } = await request.json();
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const mopsUserId = process.env.SLACK_MOPS_USER_ID || "U08V2PVE0UT"; // Skylar's Slack ID
    const requestsChannelId = process.env.SLACK_REQUESTS_CHANNEL_ID || "C0AJJSKFKNJ"; // #campaign-requests channel ID

    if (action === "notify_new_request") {
      // Send DM to MOps with campaign request summary
      const d = campaignData;
      const regionLabels = { americas: "AMER", emea: "EMEA", apac: "APAC", global: "GLBL" };
      const region = regionLabels[d.region] || d.region;
      
      const message = [
        `🐦 *New Campaign Request*`,
        ``,
        `*${d.marketoName}*`,
        ``,
        `*Type:* ${d.campaign_type}`,
        `*Region:* ${region}`,
        `*Folder:* \`${d.folderPath}\``,
        d.event_location ? `*Location:* ${d.event_location}` : null,
        d.event_dates ? `*Event Dates:* ${d.event_dates}` : null,
        d.timeline_start ? `*Launch:* ${d.timeline_start}` : null,
        d.success_metrics ? `*Metrics:* ${Array.isArray(d.success_metrics) ? d.success_metrics.join(", ") : d.success_metrics}` : null,
        d.additional_notes ? `*Notes:* ${d.additional_notes}` : null,
        ``,
        `👉 <${appUrl}|Review & Approve in Campaign Builder>`,
      ].filter(Boolean).join("\n");

      const result = await callClaudeWithSlack(apiKey, 
        `Send a Slack DM to user ${mopsUserId} with this exact message (do not modify it, send it exactly as provided):\n\n${message}`
      );

      // Also post to #campaign-requests if channel ID is configured
      if (requestsChannelId) {
        const channelMsg = [
          `🐦 *New Campaign Request Submitted*`,
          `*${d.marketoName}* — ${d.campaign_type} | ${region}`,
          d.event_location ? `📍 ${d.event_location}` : null,
          d.timeline_start ? `📅 Launch: ${d.timeline_start}` : null,
          `Pending MOps review.`,
        ].filter(Boolean).join("\n");

        await callClaudeWithSlack(apiKey,
          `Send a message to Slack channel ${requestsChannelId} with this exact message:\n\n${channelMsg}`
        );
      }

      return Response.json({ success: true, message: "Notifications sent" });
    }

    if (action === "notify_build_complete") {
      const d = campaignData;
      const regionLabels = { americas: "AMER", emea: "EMEA", apac: "APAC", global: "GLBL" };
      const region = regionLabels[d.region] || d.region;
      
      const message = [
        `✅ *Campaign Built in Marketo*`,
        ``,
        `*${d.marketoName}*`,
        `*Program ID:* ${buildResult?.program?.id || "N/A"}`,
        buildResult?.program?.url ? `*Marketo:* <${buildResult.program.url}|Open in Marketo>` : null,
        ``,
        `Region: ${region} | Type: ${d.campaign_type}`,
      ].filter(Boolean).join("\n");

      // DM to MOps
      await callClaudeWithSlack(apiKey,
        `Send a Slack DM to user ${mopsUserId} with this exact message:\n\n${message}`
      );

      // Post to #campaign-requests if configured
      if (requestsChannelId) {
        await callClaudeWithSlack(apiKey,
          `Send a message to Slack channel ${requestsChannelId} with this exact message:\n\n${message}`
        );
      }

      return Response.json({ success: true, message: "Build notification sent" });
    }

    if (action === "notify_rejected") {
      const d = campaignData;
      
      const message = [
        `❌ *Campaign Request Rejected*`,
        `*${d.marketoName}*`,
        campaignData.feedback ? `*Reason:* ${campaignData.feedback}` : null,
      ].filter(Boolean).join("\n");

      if (requestsChannelId) {
        await callClaudeWithSlack(apiKey,
          `Send a message to Slack channel ${requestsChannelId} with this exact message:\n\n${message}`
        );
      }

      return Response.json({ success: true, message: "Rejection notification sent" });
    }

    return Response.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });

  } catch (err) {
    console.error("[slack] Error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Helper: Call Claude with Slack MCP to send messages
async function callClaudeWithSlack(apiKey, userMessage) {
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
      system: "You are a messaging assistant. When asked to send a Slack message, use the Slack tools to send it exactly as specified. Do not modify the message content. Send it immediately without asking for confirmation.",
      messages: [{ role: "user", content: userMessage }],
      mcp_servers: [
        { type: "url", url: "https://mcp.slack.com/mcp", name: "slack-mcp" }
      ],
    }),
  });
  
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Claude/Slack API error");
  }
  return data;
}
