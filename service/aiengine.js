import ollama from "ollama";
import { llmEngine, llmCommand } from "./config.js";

export const summarize = async (text) => {
  if (text.length > 2000) text = text.substring(0, 2000);
  const message = {
    role: "user",
    content: `${llmCommand}: "${text}"`,
  };
  const response = await ollama.chat({
    model: `${llmEngine}`,
    messages: [message],
    stream: false,
  });
  return response.message.content;
};
