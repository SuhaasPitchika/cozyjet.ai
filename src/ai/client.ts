async function callAPI(endpoint: string, body: object) {
  const res = await fetch(`/api/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

export const skippyChatClient = (input: {
  userMessage: string;
  currentView: string;
  observationContext: string;
}) => callAPI('skippy', input);

export const flippoAnalyzeProductivityClient = (input: {
  activitySummaries: { startTime: string; endTime: string; description: string }[];
}) => callAPI('flippo', input);

export const snooksIntelligenceClient = (input: {
  userPrompt: string;
  userContext: string | object;
}) => callAPI('snooks', input);

export const skippyWorkspaceClient = (input: {
  integration: string;
  rawContent: string;
  privacyBlocklist: string[];
}) => callAPI('workspace', input);
