import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MoodsRepo } from "./moods.repo";
import env from "@/config/env";
import { getEmbedding } from "@/utils/ai";

export class ChatService {
  private model = new ChatGroq({
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.4,
    apiKey:env.GROQ_API_KEY
  });

  private readonly moodsRepo = new MoodsRepo();

  async chat(userId: string, message: string,) {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful AI assistant that helps summarize user mood and give motivational responses."],
      ["user", "{text}"],
    ]);
    const promptValue = await prompt.invoke({ text: message });
    const response = await this.model.invoke(promptValue);
    return response.content;
  }

  async analyzeUserMoodHistory(userId: string, question: string) {
    const embedding = await getEmbedding(question);

    const moods = await this.moodsRepo.getCosineSimilar(userId, embedding, 5);

    if (!moods || moods.length === 0) {
      return "Kamu belum punya data mood, jadi aku belum bisa bantu menganalisisnya 😊";
    }

    const moodContext = moods
      .map(
        (m: any) =>
          `${new Date(m.date).toISOString().split("T")[0]}: ${m.moodLabel || m.moodScore} - ${
            m.notes || ""
          }`
      )
      .join("\n");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Kamu adalah asisten AI yang empatik dan membantu pengguna memahami pola emosional mereka berdasarkan riwayat mood mereka.",
      ],
      [
        "user",
        `Berikut adalah riwayat mood pengguna:\n${moodContext}\n\nPertanyaan: ${question}\n\nBerikan jawaban yang reflektif, analitis, dan empatik dalam Bahasa Indonesia.`,
      ],
    ]);

    const promptValue = await prompt.invoke({});
    const response = await this.model.invoke(promptValue);

    return response.content;
  }
}
