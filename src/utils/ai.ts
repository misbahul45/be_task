import { HuggingFaceInferenceEmbeddings as HuggingFaceEmbeddings } from "@langchain/community/embeddings/hf";
import env from "@/config/env";

let embeddingsInstance: HuggingFaceEmbeddings | null = null;

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s!?.,]/g, "");
};


export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!text) return [];

  if (!embeddingsInstance) {
    embeddingsInstance = new HuggingFaceEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      apiKey: env.HF_API_KEY,
    });
  }

  const normalized = normalizeText(text);
  const vector = await embeddingsInstance.embedQuery(normalized);
  return vector;
};


export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}
