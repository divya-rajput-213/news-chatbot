// pages/api/news-insights.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
  
    const NEWS_API_KEY = 'ab816ddd-fba2-4e7c-bcbf-e1c48f1bc93f';
    const GROQ_API_KEY = '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';
  
    try {
      // Step 1: Fetch news articles from NewsAPI.ai
      const newsData = await fetchNewsArticles(query, NEWS_API_KEY);
      
      if (!newsData || !newsData.articles || newsData.articles.length === 0) {
        return res.status(404).json({ message: 'No news articles found' });
      }
  
      // Step 2: Send the news data to Groq for processing
      const aiResponse = await generateAIResponse(query, newsData, GROQ_API_KEY);
      
      return res.status(200).json({ response: aiResponse });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
  
  async function fetchNewsArticles(userQuery, apiKey) {
    const url = 'https://api.newsapi.ai/api/v1/article/getArticles';
    
    const params = {
      'apiKey': apiKey,
      'keyword': userQuery,
      'languageCode': 'eng',
      'articlesSortBy': 'date',
      'articlesCount': 10,
      'articleBodyLen': -1,
      'resultType': 'articles',
      'dataType': ['news', 'blog'],
      'includeArticleCategories': true,
      'includeArticleImage': true,
      'includeArticleBaseInfo': true,
      'includeArticleBody': true
    };
    
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const response = await fetch(`${url}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    return await response.json();
  }
  
  async function generateAIResponse(userQuery, newsData, apiKey) {
    // Format articles for AI consumption
    const formattedArticles = newsData.articles.map(article => {
      return {
        title: article.title,
        source: article.source?.title || 'Unknown source',
        date: article.dateTime,
        url: article.url,
        body: article.body
      };
    });
  
    // Define function calling format for OpenAI compatibility
    const functionCall = {
      name: "analyze_news",
      arguments: JSON.stringify({
        query: userQuery,
        articles: formattedArticles
      })
    };
  
    const requestBody = {
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are an intelligent news reporter. Analyze the provided news articles and generate a comprehensive, well-structured response to the user's query. Include relevant information from multiple sources, provide context, and highlight key points. Be objective, informative, and engaging."
        },
        {
          role: "user",
          content: `The user asked: "${userQuery}". Please analyze these news articles and provide a comprehensive response.`
        }
      ],
      function_call: { name: "analyze_news" },
      functions: [
        {
          name: "analyze_news",
          description: "Analyze news articles and generate a comprehensive response to the user's query",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The user's original query"
              },
              articles: {
                type: "array",
                description: "List of news articles to analyze",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    source: { type: "string" },
                    date: { type: "string" },
                    url: { type: "string" },
                    body: { type: "string" }
                  }
                }
              },
              response: {
                type: "string",
                description: "The comprehensive response to the user's query based on the news articles"
              }
            },
            required: ["query", "articles", "response"]
          }
        }
      ]
    };
  
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }
  
    const data = await response.json();
    
    // Extract content from function call response
    try {
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.function_call) {
        const functionArguments = JSON.parse(data.choices[0].message.function_call.arguments);
        return functionArguments.response || "No response generated by AI.";
      } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        throw new Error("Unexpected response format from Groq API");
      }
    } catch (err) {
      console.error("Error parsing AI response:", err);
      throw new Error("Failed to parse AI response");
    }
  }