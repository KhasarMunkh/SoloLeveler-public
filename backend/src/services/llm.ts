import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

export default async function summarizeQuests(tasks: any[]) {
  // Format times in a human-readable way instead of UTC ISO strings
  const compact = tasks.map(t => {
    const start = new Date(t.start);
    const end = new Date(t.end);

    // Format time as "3:00 PM" in local timezone
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return {
      title: t.title,
      time: `${formatTime(start)} - ${formatTime(end)}`,
      kind: t.kind,
      completed: t.completed ?? false,
    };
  });

  const prompt = [
    "You are a concise daily planner assistant.",
    "Given today's tasks/quests, write a friendly one-paragraph summary (<=69 words) and a short checklist.",
    "Focus on incomplete tasks first.",
    "Tasks:",
    JSON.stringify(compact, null, 2)
  ].join("\n");

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Be brief and actionable. Output plain text only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
  });

  return resp.choices[0]?.message?.content?.trim() || "Here’s your day!";
}
