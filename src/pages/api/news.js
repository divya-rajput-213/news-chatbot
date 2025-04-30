import { SerpAPI } from "@langchain/community/tools/serpapi";

// Instantiate the SerpAPI tool
const tool = new SerpAPI();

// Define the handler for the API request
export default async function handler(req, res) {
  const { query = '' } = req.query;

  const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

  if (!SERPAPI_API_KEY) {
    return res.status(500).json({ error: 'Missing SERPAPI_API_KEY' });
  }

  try {
    // Create the tool call to invoke the SerpAPI
    const modelGeneratedToolCall = {
      args: {
        input: query,
      },
      id: "1",
      name: tool.name,
      type: "tool_call",
    };

    // Invoke the tool
    const toolResponse = await tool.invoke(modelGeneratedToolCall);
    const parsedResponse = JSON.parse(toolResponse.content);
    if (!parsedResponse) {
      return res.status(400).json({ error: 'No news articles found.' });
    }

    // Return the articles
    res.status(200).json({ articles: parsedResponse });
  } catch (error) {
    console.error("News fetch error from SerpAPI:", error);
    res.status(500).json({ error: "Failed to fetch or process news." });
  }
}