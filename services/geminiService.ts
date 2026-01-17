
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, Recipe } from "../types";

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "description", "ingredients", "instructions"]
};

// Internal helper to handle streaming and grounding extraction
async function streamRecipe(model: string, contents: any, onChunk: (partial: string) => void, tools: any[] = []): Promise<Recipe> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const responseStream = await ai.models.generateContentStream({
    model: model,
    contents: contents,
    config: {
      tools: tools,
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA
    },
  });

  let fullText = "";
  const groundingSources: { title: string; uri: string }[] = [];

  for await (const chunk of responseStream) {
    // Correctly accessing .text property
    const text = chunk.text;
    if (text) {
      fullText += text;
      onChunk(fullText);
    }
    
    // Extract grounding sources if available (e.g., from Google Search)
    const metadata = chunk.candidates?.[0]?.groundingMetadata;
    if (metadata?.groundingChunks) {
      metadata.groundingChunks.forEach((c: any) => {
        if (c.web?.uri && c.web?.title) {
          groundingSources.push({ title: c.web.title, uri: c.web.uri });
        }
      });
    }
  }

  // Deduplicate grounding sources by URI
  const uniqueSources = Array.from(new Map(groundingSources.map(s => [s.uri, s])).values());

  try {
    const recipeData = JSON.parse(fullText || '{}');
    return {
      ...recipeData,
      id: Date.now().toString(),
      groundingSources: uniqueSources,
    };
  } catch (error) {
    console.error("JSON parsing failed for recipe", error);
    return {
      id: Date.now().toString(),
      title: "Recette",
      description: "La génération a réussi mais le formatage est incorrect.",
      ingredients: [],
      instructions: [],
      groundingSources: uniqueSources,
    };
  }
}

export const generateRecipeWithSearchStream = async (query: string, pantry: string[], onChunk: (text: string) => void): Promise<Recipe> => {
  const contents = `Génère une recette détaillée pour "${query}". 
  Utilise autant que possible ces ingrédients du garde-manger : ${pantry.join(', ')}. 
  Réponds au format JSON.`;
  // Using gemini-3-flash-preview for text generation with Google Search
  return streamRecipe('gemini-3-flash-preview', contents, onChunk, [{ googleSearch: {} }]);
};

export const analyzeRecipeFromImageStream = async (base64Image: string, mimeType: string, onChunk: (text: string) => void): Promise<Recipe> => {
  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1] || base64Image,
      mimeType: mimeType,
    },
  };
  const textPart = {
    text: "Analyse cette image (photo de recette, capture d'écran) et extrais la recette complète. Réponds strictement au format JSON.",
  };

  return streamRecipe('gemini-3-flash-preview', { parts: [imagePart, textPart] }, onChunk);
};

export const generateRecipeImage = async (recipeTitle: string, size: ImageSize): Promise<string> => {
  // Check for API key selection for Gemini 3 Pro Image
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
    // Assume success after triggering dialog as per guidelines
  }
  
  // Create instance right before API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A professional food photography shot of ${recipeTitle}, gourmet style.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });
  
  let imageUrl = '';
  // Iterate through parts to find the image as per guidelines
  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
};

export const animateRecipeVideo = async (recipeTitle: string, base64Image: string): Promise<string> => {
  // Check for API key selection for Veo
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
    // Assume success after triggering dialog
  }
  
  // Create instance right before API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pureBase64 = base64Image.split(',')[1] || base64Image;
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic zoom on ${recipeTitle}, food steaming.`,
    image: {
      imageBytes: pureBase64,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  // Use process.env.API_KEY for video fetch
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};
