const googleTrends = require('google-trends-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configure sua chave do Gemini nas variáveis de ambiente da Netlify
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event, context) => {
  try {
    // 1. Pega tendências do Google
    const results = await googleTrends.dailyTrends({ geo: 'BR' });
    const data = JSON.parse(results);
    const topTema = data.default.trendingSearchesDays[0].trendingSearches[0].title.query;

    // 2. IA gera o roteiro e hashtags
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Crie um roteiro de 15 segundos para Reels/TikTok sobre o tema: "${topTema}". 
                    Inclua 5 hashtags virais. Responda em JSON com os campos 'roteiro' e 'hashtags'.`;

    const result = await model.generateContent(prompt);
    const responseIA = JSON.parse(result.response.text());

    return {
      statusCode: 200,
      body: JSON.stringify({
        tema: topTema,
        roteiro: responseIA.roteiro,
        hashtags: responseIA.hashtags
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
