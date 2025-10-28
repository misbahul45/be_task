import { HuggingFaceInferenceEmbeddings as HuggingFaceEmbeddings } from "@langchain/community/embeddings/hf";
import env from "@/config/env";

let embeddingA: HuggingFaceEmbeddings | null = null;
let embeddingB: HuggingFaceEmbeddings | null = null;

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s!?.,]/g, "");
};

export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!text) return [];

  const normalized = normalizeText(text);

  if (!embeddingA) {
    embeddingA = new HuggingFaceEmbeddings({
      model: "sentence-transformers/all-mpnet-base-v2",
      apiKey: env.HF_API_KEY,
    });
  }

  if (!embeddingB) {
    embeddingB = new HuggingFaceEmbeddings({
      model: "sentence-transformers/all-distilroberta-v1",
      apiKey: env.HF_API_KEY,
    });
  }

  const [vecA, vecB] = await Promise.all([
    embeddingA.embedQuery(normalized),
    embeddingB.embedQuery(normalized),
  ]);

  const merged = [...vecA, ...vecB];
  return merged;
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
