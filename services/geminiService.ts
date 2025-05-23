
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the Google GenAI client
// The API key MUST be obtained exclusively from the environment variable process.env.API_KEY
// Ensure process.env.API_KEY is configured in your environment.
let ai: GoogleGenAI;
try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI. Ensure API_KEY is set in environment variables.", error);
    // Depending on the application's error handling strategy, you might throw the error,
    // or ai will remain undefined, and subsequent calls will fail.
    // For this service, we'll let it be initialized, and calls will fail if API_KEY is missing.
    // A more robust solution might involve a health check or specific error handling in calling components.
}


const IMAGE_MODEL = 'imagen-3.0-generate-002';

/**
 * Generates a preview image based on a text prompt using the Imagen model.
 * @param prompt The text prompt describing the image to generate.
 * @returns A base64 encoded string of the generated image, or null if an error occurs.
 */
export const generatePreviewImage = async (prompt: string): Promise<string | null> => {
  if (!ai) {
    console.error("GoogleGenAI client is not initialized. Cannot generate image.");
    return null;
  }

  try {
    console.log(`Generating image with prompt: "${prompt}" using model ${IMAGE_MODEL}`);
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }, // jpeg is often smaller than png for previews
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      // The response.generatedImages[0].image.imageBytes is already a base64 string.
      // The `imageUrl` construction `data:image/jpeg;base64,${base64ImageBytes}` is for direct use in <img> src.
      // If the function is expected to return only the base64 string for other uses, that's fine.
      // For now, let's return the data URL as it's commonly useful.
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.error('No image data received from API or imageBytes is missing.');
      return null;
    }
  } catch (error) {
    console.error('Error generating image with Gemini API:', error);
    // Consider more specific error handling based on error types from the SDK if available/needed.
    // e.g., if (error instanceof GoogleGenAIError) { ... }
    return null;
  }
};

/**
 * Generates text content based on a prompt using a Gemini text model.
 * @param textPrompt The text prompt for content generation.
 * @returns The generated text, or null if an error occurs.
 */
export const generateText = async (textPrompt: string): Promise<string | null> => {
    if (!ai) {
        console.error("GoogleGenAI client is not initialized. Cannot generate text.");
        return null;
    }

    const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

    try {
        console.log(`Generating text with prompt: "${textPrompt}" using model ${TEXT_MODEL}`);
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: textPrompt,
        });
        
        return response.text;

    } catch (error) {
        console.error('Error generating text with Gemini API:', error);
        return null;
    }
};

// Example of how to get JSON (not directly used by BudgetAndPreviewPage but good to have)
/**
 * Generates content and expects a JSON response.
 * @param jsonPrompt The prompt that asks the model to return JSON.
 * @returns The parsed JSON object, or null if an error occurs or parsing fails.
 */
export const generateJson = async (jsonPrompt: string): Promise<any | null> => {
    if (!ai) {
        console.error("GoogleGenAI client is not initialized. Cannot generate JSON.");
        return null;
    }
    const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: jsonPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        try {
            const parsedData = JSON.parse(jsonStr);
            return parsedData;
        } catch (e) {
            console.error("Failed to parse JSON response from Gemini:", e, "Raw string:", jsonStr);
            return null;
        }
    } catch (error) {
        console.error('Error generating JSON with Gemini API:', error);
        return null;
    }
};
