import { NextApiRequest, NextApiResponse } from "next";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { SerpAPI } from "@langchain/community/tools/serpapi";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  try {
    // Initialize SerpAPI tool (to fetch news-related data)
    const serpTool = new SerpAPI(process.env.SERPAPI_API_KEY!);

    // Initialize the Groq LLM (Chat model)
    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY!,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    // Create a strict news-related prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an assistant that ONLY responds to news-related questions.
        
        If a user asks about:
        - jokes
        - stories
        - personal help
        - entertainment
        - math
        - programming
        - weather
        - or anything that is NOT news-related
        
        Then you must respond with: "Please ask a news-related question."

        You should only answer questions that are clearly about:
        - current events
        - politics
        - science
        - technology
        - global affairs
        - sports
        - world news
        - headlines
        
        For any other topics, respond with "Please ask a news-related question."`,
      ],
      ["placeholder", "{messages}"],
    ]);

    // Bind tools (SerpAPI to LLM) for actual news queries
    const llmWithTools = llm.bindTools([serpTool]);

    // Create the chain for processing input and calling tools
    const chain = prompt.pipe(llmWithTools);

    // Custom tool chain logic for invoking the assistant with the user input
    const toolChain = RunnableLambda.from(async (userInput: string, config) => {
      const humanMessage = new HumanMessage(userInput);

      // Get LLM response (may include tool calls for news-related answers)
      const aiMsg = await chain.invoke(
        {
          messages: [humanMessage],
        },
        config
      );

      // If tool calls are needed (i.e., fetching real news), handle with SerpAPI
      const toolMsgs = aiMsg.tool_calls && aiMsg.tool_calls.length > 0
        ? await serpTool.batch(aiMsg.tool_calls, config)
        : [];

      // Final response from the assistant (including tool results)
      const finalResponse = await llm.invoke(
        [humanMessage, ...toolMsgs],
        config
      );

      return finalResponse;
    });

    // Run the tool chain with the query input
    const toolChainResult = await toolChain.invoke(query);

    // Extract and return relevant content (news-related response)
    const { content } = toolChainResult;

    res.status(200).json({
      result: {
        content,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error running agent:", error);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

export default handler;
