/* eslint-disable no-console */
import OpenAI from "openai";
import axios from "axios";
import { v } from "convex/values";

import { action } from "./_generated/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const assistantPromise = openai.beta.assistants.retrieve(
  process.env.OPENAI_ASSISTANT_ID!,
);

export const useFunctionWithMessage = action({
  args: { threadId: v.string(), message: v.string() },
  handler: async (_, { threadId, message }) => {
    const assistant = await assistantPromise;

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistant.id,
      instructions:
        "Use the function tool for this query and show a diagram by plotting the results.",
    });

    if (
      run.required_action &&
      run.required_action.submit_tool_outputs &&
      run.required_action.submit_tool_outputs.tool_calls
    ) {
      // Loop through each tool in the required action section
      const url: string[] = [];
      const toolOutputs = await Promise.all(
        run.required_action.submit_tool_outputs.tool_calls.map(async (tool) => {
          const args = JSON.parse(tool.function.arguments);

          const res = await getWordTrends(url, args.query, args);

          console.log(res);
          console.log(url[0]);

          if (tool.function.name === "get_word_trends") {
            return {
              tool_call_id: tool.id,
              output: res, // Assuming you want to return the actual result from getWordTrends
            };
          }
        }),
      );

      if (toolOutputs.length > 0) {
        run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
          threadId,
          run.id,
          { tool_outputs: toolOutputs },
        );
        console.log("Tool outputs submitted successfully.");
      } else {
        console.log("No tool outputs to submit.");
      }

      return { url: url[0] };
    }
  },
});

export const useFunctionWithOutMessage = action({
  args: { threadId: v.string() },
  handler: async (_, { threadId }) => {
    const queued_run = await openai.beta.threads.runs.list(threadId);
    const runId = queued_run.data[0].id;

    let run = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (
      run.required_action &&
      run.required_action.submit_tool_outputs &&
      run.required_action.submit_tool_outputs.tool_calls
    ) {
      // Loop through each tool in the required action section
      const url: string[] = [];
      const toolOutputs = await Promise.all(
        run.required_action.submit_tool_outputs.tool_calls.map(async (tool) => {
          const args = JSON.parse(tool.function.arguments);

          const res = await getWordTrends(url, args.query, args);

          console.log(res);

          if (tool.function.name === "get_word_trends") {
            return {
              tool_call_id: tool.id,
              output: res, // Assuming you want to return the actual result from getWordTrends
            };
          }
        }),
      );

      if (toolOutputs.length > 0) {
        run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
          threadId,
          run.id,
          { tool_outputs: toolOutputs },
        );
        console.log("Tool outputs submitted successfully.");
      } else {
        console.log("No tool outputs to submit.");
      }

      return { url: url[0] };
    }
  },
});

// Define the default parameters
const defaultParams = {
  year_start: 1674,
  year_end: 1912,
  corpus: "en-GB-2019",
  smoothing: 3,
  case_insensitive: false,
};

// Define the interface for the parameters
interface Params {
  year_start?: number;
  year_end?: number;
  corpus?: string;
  smoothing?: number;
  case_insensitive?: boolean;
}

// Function to get word trends
const getWordTrends = async (
  url_res: string[],
  query: string,
  params: Params = {},
) => {
  // Merge default parameters with provided parameters
  const finalParams = { ...defaultParams, ...params };

  // Extract individual parameters
  const { year_start, year_end, corpus, smoothing, case_insensitive } =
    finalParams;
  const encodedQuery = encodeURIComponent(query);

  // Construct the URL
  const url =
    `https://books.google.com/ngrams/json?content=${encodedQuery}` +
    `&year_start=${year_start}` +
    `&year_end=${year_end}` +
    `&corpus=${corpus}` +
    `&smoothing=${smoothing}` +
    `${case_insensitive ? "&case_insensitive=true" : ""}`;

  const url_to_return =
    `https://books.google.com/ngrams/graph?content=${encodedQuery}` +
    `&year_start=${year_start}` +
    `&year_end=${year_end}` +
    `&corpus=${corpus}` +
    `&smoothing=${smoothing}` +
    `${case_insensitive ? "&case_insensitive=true" : ""}`;

  console.log(url);
  url_res.push(url_to_return);

  const response = await axios.get(url);

  const output = response.data;

  if (output.length === 0) {
    return "No data available for this Ngram.";
  }

  const years = Array.from(
    { length: year_end - year_start + 1 },
    (_, i) => i + year_start,
  );
  const result: { year: number; [key: string]: number[] } = { year: years };

  output.forEach((item: { ngram: string; timeseries: number[] }) => {
    result[item.ngram] = item.timeseries;
  });

  return JSON.stringify(result);
};
