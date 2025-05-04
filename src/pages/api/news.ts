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
    // 1. Initialize SerpAPI tool
    const serpTool = new SerpAPI(
      // process.env.SERPAPI_API_KEY!
    );

    // 2. Initialize Groq LLM (Chat model)
    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY!,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    // 3. Create prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an assistant that ONLY answers questions related to news. 
    
        You must only respond to queries that are about the following:
        - Current events
        - Global affairs
        - Politics
        - Science
        - Technology
        - Sports
        - Headlines
    
        If the user asks anything that is not news-related (e.g., jokes, programming help, personal queries, entertainment), you should reply with **exactly**:
        "Please ask a news-related question."
    
        Do not provide any other responses, context, or assistance. Only respond to news-related inquiries and strictly follow this rule.`,
      ],
      ["placeholder", "{messages}"],
    ]);
    

    // 4. Bind tools (SerpAPI to LLM)
    const llmWithTools = llm.bindTools([serpTool]);

    // 5. Create chain for tool calls
    const chain = prompt.pipe(llmWithTools);

    // 6. Create custom tool chain logic
    const toolChain = RunnableLambda.from(async (userInput: string, config) => {
      const humanMessage = new HumanMessage(userInput);

      // Get LLM response (e.g., tool calls or info)
      const aiMsg = await chain.invoke(
        {
          messages: [humanMessage],
        },
        config
      );

      // If tool calls are needed, run them with SerpAPI
      const toolMsgs = aiMsg.tool_calls && aiMsg.tool_calls.length > 0
        ? await serpTool.batch(aiMsg.tool_calls, config)
        : [];

      // Final LLM response using both AI-generated response and tool results
      const finalResponse = await llm.invoke(
        [humanMessage, ...toolMsgs],
        config
      );

      return finalResponse;
    });

    // 7. Run tool chain with query input
    const toolChainResult = await toolChain.invoke(query);

    // Extract useful info from the result
    const {content } = toolChainResult;

    // 8. Send the result back as JSON response
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
