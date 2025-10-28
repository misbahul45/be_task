import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MoodsRepo } from "./moods.repo";
import env from "@/config/env";

export class ChatService {
  private model = new ChatGroq({
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.4,
    apiKey:env.GROQ_API_KEY
  });

  private readonly moodsRepo = new MoodsRepo();

  async chat(userId: string, message: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful AI assistant that helps summarize user mood and give motivational responses."],
      ["user", "{text}"],
    ]);
    const promptValue = await prompt.invoke({ text: message });
    const response = await this.model.invoke(promptValue);
    return response.content;
  }

  async analyzeUserMoodHistory(userId: string, question: string) {
    const { data: moods } = await this.moodsRepo.findAll(userId, { limit: 30, page: 1, search:question });

    if (!moods || moods.length === 0) {
      return "Kamu belum punya data mood, jadi aku belum bisa bantu menganalisisnya 😊";
    }

    const moodContext = moods
      .map(
        (m: any) =>
          `${m.date.toISOString().split("T")[0]}: ${m.moodLabel || m.moodScore} - ${m.notes || ""}`
      )
      .join("\n");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an empathetic AI assistant that helps analyze a user's emotional patterns based on their mood history.",
      ],
      [
        "user",
        `Here is the user's mood history:\n${moodContext}\n\nQuestion: ${question}\n\nPlease provide an insightful and empathetic answer in Bahasa Indonesia.`,
      ],
    ]);

    const promptValue = await prompt.invoke({});
    const response = await this.model.invoke(promptValue);

    return response.content;
  }
}
