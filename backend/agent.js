const axios = require('axios');
require('dotenv').config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function getGeminiResponse(prompt) {
  const res = await axios.post(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    }
  );

  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
}

async function runAgent(query) {
  const prompt = `Give a helpful, concise, and friendly explanation about:\n\n"${query}"`;
  return await getGeminiResponse(prompt);
}

module.exports = { runAgent };


// Wikipedia
async function searchWikipedia(query) {
  try {
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        srlimit: 1
      }
    });
    const results = response.data.query.search;
    if (!results.length) return 'No results found.';
    const pageId = results[0].pageid;
    const page = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        prop: 'extracts',
        pageids: pageId,
        exintro: true,
        explaintext: true,
        format: 'json'
      }
    });
    return page.data.query.pages[pageId].extract;
  } catch {
    return 'Error fetching Wikipedia data.';
  }
}

// Google news
async function searchGoogleNews(query) {
  return new Promise((resolve, reject) => {
    getJson({
      engine: 'google',
      q: query,
      num: 6,
      hl: 'en',
      api_key: process.env.SERPAPI_API_KEY
    }, json => {
      if (json.error) return reject(json.error);
      const news = json.organic_results.map(item => `• ${item.title}\n${item.snippet || ''}\n${item.link}`);
      resolve(news.join('\n\n'));
    });
  });
}

// Main agent logic
async function runAgent(query) {
  const wikiText = await searchWikipedia(query);
  const newsText = await searchGoogleNews(query);

  const prompt = `
You are an intelligent AI assistant. Using the following data:
Wikipedia: ${wikiText}
News: ${newsText}

Summarize all this clearly and conversationally for a user. Make it useful, engaging, and easy to understand.
  `;

  return await getGeminiResponse(prompt);
}

module.exports = { runAgent };



// Groq code

// require('dotenv').config();
// const Groq = require('groq-sdk');
// const axios = require('axios');
// const readline = require('readline');
// const { getJson } = require('serpapi');

// // Initialize Groq client
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // Initialize readline interface for user input
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // Wikipedia search function
// async function searchWikipedia(query) {
//   try {
//     const response = await axios.get('https://en.wikipedia.org/w/api.php', {
//       params: {
//         action: 'query',
//         list: 'search',
//         srsearch: query,
//         format: 'json',
//         srlimit: 1
//       }
//     });
//     const searchResults = response.data.query.search;
//     if (searchResults.length === 0) return 'No results found on Wikipedia.';
    
//     const pageId = searchResults[0].pageid;
//     const pageResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
//       params: {
//         action: 'query',
//         prop: 'extracts',
//         exintro: true,
//         explaintext: true,
//         pageids: pageId,
//         format: 'json'
//       }
//     });
//     return pageResponse.data.query.pages[pageId].extract;
//   } catch (error) {
//     console.error('Wikipedia search error:', error.message);
//     return 'Error fetching Wikipedia data.';
//   }
// }

// // Google search function for news agent
// async function searchGoogleNews(query) {
//   return new Promise((resolve, reject) => {
//     getJson({
//       engine: 'google',
//       q: query,
//       num: 10,
//       hl: 'en',
//       api_key: process.env.SERPAPI_API_KEY
//     }, (json) => {
//       if (json.error) return reject(json.error);
//       const newsItems = json.organic_results.slice(0, 4).map(item => ({
//         title: item.title,
//         link: item.link,
//         snippet: item.snippet
//       }));
//       resolve(newsItems);
//     });
//   });
// }

// // Google search function for Google agent
// async function searchGoogleSimple(query) {
//   return new Promise((resolve, reject) => {
//     getJson({
//       engine: 'google',
//       q: query,
//       api_key: process.env.SERPAPI_API_KEY
//     }, (json) => {
//       if (json.error) return reject(json.error);
//       resolve(json.organic_results.slice(0, 4));
//     });
//   });
// }

// // Format news response
// function formatNewsResponse(newsItems) {
//   let response = '## Latest News\n\n';
//   newsItems.forEach((item, index) => {
//     response += `### ${index + 1}. ${item.title}\n`;
//     response += `${item.snippet || 'No summary available.'}\n`;
//     response += `Read more: [${item.link}](${item.link})\n\n`;
//   });
//   return response;
// }

// // Format Google response
// function formatGoogleResponse(results) {
//   let response = '## Google Search Results\n\n';
//   results.forEach((item, index) => {
//     response += `### ${index + 1}. ${item.title}\n`;
//     response += `${item.snippet || 'No summary available.'}\n`;
//     response += `Link: [${item.link}](${item.link})\n\n`;
//   });
//   return response;
// }

// // Groq response function
// async function getGroqResponse(query, systemPrompt) {
//   try {
//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: query }
//       ],
//       model: 'deepseek-r1-distill-llama-70b'
//     });
//     return chatCompletion.choices[0].message.content;
//   } catch (error) {
//     console.error('Groq API error:', error.message);
//     return 'Error fetching response from Groq.';
//   }
// }

// // Wikipedia agent
// async function runWikiAgent(query) {
//   const wikiPrompt = 'You are a helpful assistant that summarizes Wikipedia content in a clear, user-friendly way.';
//   const wikiQuery = `Search Wikipedia for ${query} and summarize the information.`;
//   const wikiResponse = await searchWikipedia(query);
//   const wikiSummary = await getGroqResponse(wikiResponse, wikiPrompt);
//   return `## Wikipedia Summary\n\n${wikiSummary}\n\n`;
// }

// // News agent
// async function runNewsAgent(query) {
//   const newsPrompt = `
// You are a news agent that helps users find the latest news.
// Given a topic, provide a concise summary of the 4 latest news items in a user-friendly format.
// Search for 10 news items and select the top 4 unique items.
// Search in English.
// Ensure the response is clear, engaging, and easy to understand.
//   `;
//   try {
//     const newsItems = await searchGoogleNews(query);
//     const newsSummary = formatNewsResponse(newsItems);
//     const groqResponse = await getGroqResponse(newsSummary, newsPrompt);
//     return newsSummary;
//   } catch (error) {
//     console.error('News search error:', error);
//     return '## Latest News\n\nError fetching news data.\n\n';
//   }
// }

// // Google search agent
// async function runGoogleAgent(query) {
//   const googlePrompt = 'You are a search assistant that summarizes Google search results in a clear, engaging, and user-friendly way.';
//   try {
//     const googleResults = await searchGoogleSimple(query);
//     const googleSummary = formatGoogleResponse(googleResults);
//     const groqResponse = await getGroqResponse(googleSummary, googlePrompt);
//     return googleSummary;
//   } catch (error) {
//     console.error('Google search error:', error);
//     return '## Google Search Results\n\nError fetching Google search data.\n\n';
//   }
// }

// // Combine and summarize all responses
// async function combineResponses(query, wikiResponse, newsResponse, googleResponse) {
//   const combinedPrompt = `
// You are a friendly assistant that combines information from Wikipedia, news, and Google search results into a single, easy-to-read response. 
// Given the following data:
// - Wikipedia summary: ${wikiResponse}
// - News results: ${newsResponse}
// - Google search results: ${googleResponse}
// Create a cohesive, conversational summary that explains the topic in a way anyone can understand. Use a friendly tone, avoid technical jargon, and keep it engaging. The response should be around 500 words, covering key points from all sources.
//   `;
//   return await getGroqResponse(combinedPrompt, 'You are a conversational assistant.');
// }

// // Main agent function
// async function runAgent(query) {
//   const wikiResponse = await runWikiAgent(query);
//   const newsResponse = await runNewsAgent(query);
//   const googleResponse = await runGoogleAgent(query);
  
//   const combinedResponse = await combineResponses(query, wikiResponse, newsResponse, googleResponse);
  
//   return `# All About "${query}"\n\n${combinedResponse}`; // ✅ Add this
// }


// // Interactive loop
// function startPrompt() {
//   rl.question('Enter your query (or "exit" to quit): ', async (query) => {
//     if (query.toLowerCase() === 'exit') {
//       rl.close();
//       return;
//     }
//     await runAgent(query);
//     startPrompt();
//   });
// }

// // Start the program
// console.log('Hi! I’m your friendly search assistant. Type a topic to learn about it, or "exit" to quit.');
// startPrompt();

// // Add this at the bottom of agent.js
// module.exports = { runAgent };
