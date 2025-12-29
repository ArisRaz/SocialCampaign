import { GoogleGenAI, Type } from "@google/genai";
import { Platform, Length, Tone, AsanaBrief } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSocialImage = async (
  visualConcept: string,
  platform: Platform,
  tones: Tone[],
  referenceImage?: { data: string; mimeType: string }
): Promise<string | undefined> => {
  const modelId = 'gemini-2.5-flash-image';
  const aspectRatio = '1:1';

  const textPrompt = `
    You are a World-Class 3D Artist for "RealPrize.com". 
    Task: Generate a completely ORIGINAL, high-gloss 3D promotional graphic based on this visual concept: "${visualConcept}".

    **CONCEPTUAL REFERENCE ONLY:**
    ${referenceImage ? 
      'A REFERENCE IMAGE is provided. Use it ONLY for its SPATIAL CONCEPT or COMPOSITION. Do NOT copy its objects or style. You must generate a BRAND NEW 3D SCENE from scratch using the RealPrize brand language.' 
      : 'No reference image provided. Create an original 3D masterpiece based on the visual concept.'
    }

    **REALPRIZE BRAND LANGUAGE (Mandatory Aesthetic):**
    - **STYLE:** "Claymorphism" - Everything is premium, high-gloss, soft-touch 3D. 
    - **VISUALS:** Soft, rounded edges, cinematic lighting, vibrant global illumination.
    - **COLORS:** Royal Blue and Bright Red dominance. High-shine Glossy Gold for accents.
    - **CORE ELEMENTS:** 
      1. **The Mascot:** Always feature the "RealPrize Blue Cube" (rounded blue cube with a simple, friendly face).
      2. **The Props:** Include piles of oversized, reflective 3D gold coins as decorative elements.
    
    **TOPIC-SPECIFIC LOGIC:**
    - **PRIMARY FOCUS:** The visual concept is "${visualConcept}". This dictates the core subject of your NEW render.
    - **IF TOPIC IS "GIFT":** The hero of YOUR render must be a luxurious 3D gift box with a silk gold ribbon. 
    - **IF TOPIC IS A GAME/PUZZLE:** Render a high-quality 3D platform following the reference's composition concept, but using our 3D objects (cards, symbols, or cubes).
    - **STRICT:** Do not "tweak" the reference. Create a new image that speaks the visual language of RealPrize.com.

    **TECHNICAL:**
    - Clean composition. High-resolution feel. No text in the image.
  `;

  const parts: any[] = [{ text: textPrompt }];
  
  if (referenceImage) {
    parts.unshift({
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return undefined; 
  }
};

interface CopywritingResponse {
  socialCopy: string;
  asanaBrief: AsanaBrief;
}

export const generateCopywriting = async (
  copyTopic: string,
  visualConcept: string,
  platform: Platform,
  length: Length,
  tones: Tone[],
  refinement?: string,
  previousContent?: string
): Promise<CopywritingResponse> => {
  const modelId = 'gemini-3-flash-preview';
  const toneString = tones.join(', ');

  const systemPrompt = `You are the Lead Social Media Strategist for **RealPrize.com**. 
  Task: Create a social campaign for: "${copyTopic}" and provide a designer brief.

  **PART 1: SOCIAL COPY RULES (STRICT):**
  1. **FORBIDDEN TERMS:** Never use "Gold Coins", "GC", "Sweepstakes Coins", or "SC". Use "Rewards" or "Prizes".
  2. **NO GAMBLING JARGON:** No "bet", "wager", "gamble", "casino", "slots".
  3. **NO META-ENGAGEMENT BAIT:** NEVER use "Comment", "Share", "Tag", "Like", "Follow".
  4. **NO WEBSITE MENTIONS:** Never write "Visit RealPrize.com" or "Link in bio".
  5. **STRUCTURE:** Exactly ${length} sentences. Single CTA. Ends with a question.

  ${refinement && previousContent ? `**REFINEMENT REQUEST (PRIORITY):** 
  The user is tweaking a previous result. 
  PREVIOUS CONTENT: "${previousContent}"
  INSTRUCTION: "${refinement}"
  
  YOUR GOAL: Modify the content as requested in the INSTRUCTION. If the instruction asks for specific changes (shorter, funnier, more focus on X), prioritize that above all else while staying within the core RealPrize brand rules.` : ''}

  **PART 2: ASANA BRIEF RULES (FOR DESIGNERS):**
  1. **Description**: Concise overview of the campaign's purpose.
  2. **Look & Feel**: Explain what needs to be in the image in simple, plain English terms. 
     DO NOT use jargon like "3D" or "Claymorphism". Describe objects, layout, and colors (Royal Blue, Bright Red, Shiny Gold).
  3. **Messaging Hierarchy**: State the order of importance for elements (1. Primary Subject, 2. Secondary Context, 3. Logo/Mascot).

  You MUST return a valid JSON object.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      socialCopy: { type: Type.STRING },
      asanaBrief: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          lookAndFeel: { type: Type.STRING },
          messagingHierarchy: { type: Type.STRING }
        },
        required: ['description', 'lookAndFeel', 'messagingHierarchy']
      }
    },
    required: ['socialCopy', 'asanaBrief']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Platform: ${platform}\nTopic: "${copyTopic}"\nVisual Concept: "${visualConcept}"${refinement ? `\nUser Refinement Instruction: "${refinement}"` : ''}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      socialCopy: data.socialCopy || "Error generating copy.",
      asanaBrief: data.asanaBrief || { description: "", lookAndFeel: "", messagingHierarchy: "" }
    };
  } catch (error) {
    console.error("Gemini Copywriting Error:", error);
    throw new Error("Failed to generate copywriting.");
  }
};