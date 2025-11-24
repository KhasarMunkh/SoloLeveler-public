export default async function summarizeQuests(tasks: any[]) {
  if (!tasks || tasks.length === 0) {
    return "You have no tasks today. Mock summary for testing.";
  }
  return `You have ${tasks.length} task(s) today. Mock summary for testing.`;
}
