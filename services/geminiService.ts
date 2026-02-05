
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ContractAnalysis, RiskLevel, NegotiationDifficulty } from "../types";

const API_KEY = process.env.API_KEY || "";

const getAI = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const analyzeContract = async (
  content: string,
  image?: string
): Promise<ContractAnalysis> => {
  const ai = getAI();
  
  const prompt = `
    Analyze the following contract. Provide a detailed risk assessment, precise FINANCIAL IMPACT CALCULATOR, a sophisticated 3-TIER NEGOTIATION STRATEGY, and a NEGOTIABILITY SCORE (0-100) for each problematic clause.
    
    Additionally, generate:
    1. A GRANULAR CHANGE SUMMARY for each clause mapping specific phrases to counter-proposals.
    2. ANONYMIZED SUCCESS STORIES (2 per clause) of similar successful negotiations.
    3. NEGOTIATION STATISTICS for the clause type (success rate, avg resolution days, common concerns).

    The JSON must follow this structure:
    {
      "riskScore": number,
      "summary": "...",
      "overallRecommendation": "...",
      "totalPotentialExposure": number,
      "totalPotentialSavings": number,
      "clauses": [
        {
          "id": "uuid",
          "category": "...",
          "originalText": "...",
          "simplifiedText": "...",
          "riskLevel": "HIGH" | "MEDIUM" | "LOW",
          "riskExplanation": "...",
          "negotiabilityScore": number,
          "negotiabilityExplanation": "...",
          "successStories": [
            {
              "title": "e.g., Freelance Lease in Paris (Dec 2024)",
              "originalClause": "...",
              "counterProposal": "...",
              "result": "e.g., Accepted after 1 email exchange",
              "landlordResponse": "...",
              "date": "Month Year"
            }
          ],
          "stats": {
            "successRate": number (0-100),
            "avgResolutionDays": number,
            "commonConcerns": ["Concern 1", "Concern 2"],
            "winningArguments": ["Argument 1", "Argument 2"]
          },
          "changeSummary": [
            {
              "type": "deleted" | "added" | "clarified",
              "originalText": "...",
              "recommendedText": "...",
              "impact": "...",
              "protectionGained": "...",
              "legalBasis": "..."
            }
          ],
          "detailedFinancials": {
            "immediateRisk": number,
            "annualExposure": number,
            "lifetimeCost": number,
            "comparisonSavings": number,
            "riskReductionPercentage": number,
            "currency": "€"
          },
          "industryStandard": "...",
          "suggestedCounterProposal": "...",
          "negotiationScript": "...",
          "strategy": {
            "difficulty": "EASY" | "MEDIUM" | "HARD",
            "tier1": { "position": "...", "script": "...", "reasoning": "..." },
            "tier2": { "position": "...", "script": "...", "reasoning": "...", "sweetener": "..." },
            "tier3": { "bottomLine": "...", "walkAwayAdvice": "..." },
            "contextTips": "...",
            "emailOptions": {
              "formal": { "subject": "...", "body": "..." },
              "professionalFriendly": { "subject": "...", "body": "..." },
              "collaborative": { "subject": "...", "body": "..." }
            }
          }
        }
      ]
    }
  `;

  const parts: any[] = [];
  
  if (image) {
    const mimeTypeMatch = image.match(/^data:(.*);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const base64Data = image.split(',')[1];
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  parts.push({ text: prompt });

  if (content) {
    parts.push({ text: `ADDITIONAL TEXT CONTENT FROM CONTRACT:\n${content}` });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 32768 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          overallRecommendation: { type: Type.STRING },
          totalPotentialExposure: { type: Type.NUMBER },
          totalPotentialSavings: { type: Type.NUMBER },
          clauses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                originalText: { type: Type.STRING },
                simplifiedText: { type: Type.STRING },
                riskLevel: { type: Type.STRING },
                riskExplanation: { type: Type.STRING },
                negotiabilityScore: { type: Type.NUMBER },
                negotiabilityExplanation: { type: Type.STRING },
                successStories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      originalClause: { type: Type.STRING },
                      counterProposal: { type: Type.STRING },
                      result: { type: Type.STRING },
                      landlordResponse: { type: Type.STRING },
                      date: { type: Type.STRING }
                    },
                    required: ["title", "originalClause", "counterProposal", "result", "landlordResponse", "date"]
                  }
                },
                stats: {
                  type: Type.OBJECT,
                  properties: {
                    successRate: { type: Type.NUMBER },
                    avgResolutionDays: { type: Type.NUMBER },
                    commonConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
                    winningArguments: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["successRate", "avgResolutionDays", "commonConcerns", "winningArguments"]
                },
                changeSummary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      originalText: { type: Type.STRING },
                      recommendedText: { type: Type.STRING },
                      impact: { type: Type.STRING },
                      protectionGained: { type: Type.STRING },
                      legalBasis: { type: Type.STRING }
                    },
                    required: ["type", "originalText", "recommendedText", "impact", "protectionGained", "legalBasis"]
                  }
                },
                detailedFinancials: {
                  type: Type.OBJECT,
                  properties: {
                    immediateRisk: { type: Type.NUMBER },
                    annualExposure: { type: Type.NUMBER },
                    lifetimeCost: { type: Type.NUMBER },
                    comparisonSavings: { type: Type.NUMBER },
                    riskReductionPercentage: { type: Type.NUMBER },
                    currency: { type: Type.STRING }
                  },
                  required: ["immediateRisk", "annualExposure", "lifetimeCost", "comparisonSavings", "riskReductionPercentage", "currency"]
                },
                industryStandard: { type: Type.STRING },
                suggestedCounterProposal: { type: Type.STRING },
                negotiationScript: { type: Type.STRING },
                strategy: {
                  type: Type.OBJECT,
                  properties: {
                    difficulty: { type: Type.STRING },
                    tier1: {
                      type: Type.OBJECT,
                      properties: {
                        position: { type: Type.STRING },
                        script: { type: Type.STRING },
                        reasoning: { type: Type.STRING }
                      },
                      required: ["position", "script", "reasoning"]
                    },
                    tier2: {
                      type: Type.OBJECT,
                      properties: {
                        position: { type: Type.STRING },
                        script: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        sweetener: { type: Type.STRING }
                      },
                      required: ["position", "script", "reasoning", "sweetener"]
                    },
                    tier3: {
                      type: Type.OBJECT,
                      properties: {
                        bottomLine: { type: Type.STRING },
                        walkAwayAdvice: { type: Type.STRING }
                      },
                      required: ["bottomLine", "walkAwayAdvice"]
                    },
                    contextTips: { type: Type.STRING },
                    emailOptions: {
                      type: Type.OBJECT,
                      properties: {
                        formal: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["subject", "body"] },
                        professionalFriendly: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["subject", "body"] },
                        collaborative: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["subject", "body"] }
                      },
                      required: ["formal", "professionalFriendly", "collaborative"]
                    }
                  },
                  required: ["difficulty", "tier1", "tier2", "tier3", "contextTips", "emailOptions"]
                }
              },
              required: ["id", "category", "originalText", "simplifiedText", "riskLevel", "riskExplanation", "negotiabilityScore", "negotiabilityExplanation", "industryStandard", "suggestedCounterProposal", "negotiationScript", "strategy", "changeSummary", "successStories", "stats"]
            }
          }
        },
        required: ["riskScore", "summary", "clauses", "overallRecommendation"]
      }
    },
  });

  return JSON.parse(response.text || "{}") as ContractAnalysis;
};

export const chatWithAssistant = async (
  history: { role: 'user' | 'model'; content: string }[],
  newQuery: string,
  contractContext: string
): Promise<{text: string, actions?: any[]}> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are an empathetic mentor and expert contract negotiator. 
      Context: ${contractContext}.
      
      Your personality: Professional, encouraging, firm but diplomatic. 
      Rules:
      1. Responses should be concise (2-4 sentences) unless depth is requested.
      2. If asked about rejections, provide concrete 1-2-3 fallback options.
      3. If asked about legality (especially French Law like ALUR), provide specific article references if possible.
      4. Always encourage the user to frame changes as 'clarifications' rather than 'demands' to maintain leverage.
      
      RESPONSE FORMAT: You MUST return a JSON object with:
      {
        "text": "Your helpful response string here...",
        "actions": [
          {"label": "Generate email for this", "type": "email", "payload": "context string"},
          {"label": "Explain the legal basis", "type": "legal", "payload": "topic"},
          {"label": "Show success stories", "type": "success_story"},
          {"label": "Another query", "type": "query", "payload": "Suggested follow up question"}
        ]
      }
      
      Always suggest 2-3 relevant action buttons.`,
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json"
    }
  });

  const response = await chat.sendMessage({ message: newQuery });
  try {
    return JSON.parse(response.text || '{"text": "I encountered an error."}');
  } catch (e) {
    return { text: response.text || "I'm sorry, I couldn't process that request." };
  }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this negotiation script professionally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data received");

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = audioContext.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
};
