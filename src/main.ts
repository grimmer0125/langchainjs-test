import { HumanMessage } from "langchain/schema";

import { ChatOpenAI } from "langchain/chat_models/openai";

import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

(async () => {
  const openAIApiKey = process.env.OPENAI_API_KEY;

  /** embedding API
   * no callbacks parameter! How to get the used token/cost?
   * Python version seems not to have either
   * https://github.com/langchain-ai/langchain/issues/945
   */
  const embeddings = new OpenAIEmbeddings({ openAIApiKey });
  const embeddingRes = await embeddings.embedQuery("Hello world");

  /** completion API */
  const model = new OpenAI({
    temperature: 0.9,
    openAIApiKey,
    callbacks: [
      {
        /** called earlier than "const response = await" */
        /** no cost field inside */
        handleLLMEnd: (output, runId, parentRunId, tags) => {
          const { completionTokens, promptTokens, totalTokens } =
            output?.llmOutput?.tokenUsage ?? {};
          console.debug({ output });
        },
      },
    ],
  });
  // Calls out to the model's (OpenAI's) endpoint passing the prompt. This call returns a string
  const res = await model.call("Is TypeScript good at writing ML programs?");
  console.debug({ res });

  /** chatCompletion API */
  const chat = new ChatOpenAI({
    openAIApiKey,
    callbacks: [
      {
        /** called earlier than "const response = await" */
        /** no cost field inside */
        handleLLMEnd: (output, runId, parentRunId, tags) => {
          const { completionTokens, promptTokens, totalTokens } =
            output?.llmOutput?.tokenUsage ?? {};
          console.debug({ output });
        },
      },
    ],
  });
  const response = await chat.call([
    new HumanMessage("Is TypeScript better than Python?"),
  ]);
  console.debug({ response });
})();
