import {
  getConversation,
  listConversationMessages,
  saveOverview,
  type ProjectOverview,
} from "@/server/db/conversations";
import { overviewExtractionMessages } from "./context";
import { chatComplete } from "./openrouter";

function parseOverview(text: string): ProjectOverview | null {
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const o = JSON.parse(s.slice(start, end + 1)) as Record<string, unknown>;
    const strArr = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    const clarity = o.clarity === "high" || o.clarity === "medium" ? o.clarity : "low";
    return {
      visitorName: str(o.visitorName),
      visitorEmail: str(o.visitorEmail),
      visitorWhatsapp: str(o.visitorWhatsapp),
      projectType: str(o.projectType),
      summary: typeof o.summary === "string" ? o.summary : "",
      goals: strArr(o.goals),
      features: strArr(o.features),
      stack: strArr(o.stack),
      timeline: str(o.timeline),
      budget: str(o.budget),
      clarity,
      nextStep: typeof o.nextStep === "string" ? o.nextStep : "",
      tags: strArr(o.tags),
    };
  } catch {
    return null;
  }
}

/** Cached project brief — regenerated via the LLM only when new messages exist. */
export async function getOrGenerateOverview(
  conversationId: number
): Promise<ProjectOverview | null> {
  const convo = await getConversation(conversationId);
  if (!convo) return null;
  if (convo.overview && convo.overviewAt === convo.messageCount) return convo.overview;

  const msgs = await listConversationMessages(conversationId, 60);
  if (!msgs.length) return convo.overview;

  const transcript = msgs
    .map((m) => `${m.role === "assistant" ? "Assistant" : "Visitor"}: ${m.content}`)
    .join("\n");

  let raw = "";
  try {
    raw = await chatComplete(overviewExtractionMessages(transcript), {
      temperature: 0.2,
      maxTokens: 600,
    });
  } catch {
    return convo.overview; // keep last good brief if the model is unavailable
  }
  const parsed = parseOverview(raw);
  if (!parsed) return convo.overview;
  await saveOverview(conversationId, parsed, convo.messageCount);
  return parsed;
}
