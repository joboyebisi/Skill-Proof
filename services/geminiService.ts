import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CandidateProfile, Job } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- CANDIDATE ANALYSIS ---

const candidateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    realName: { type: Type.STRING, description: "The candidate's real full name inferred from the data. If not found, use the handle." },
    summary: { type: Type.STRING, description: "A professional summary of the developer." },
    matchScore: { type: Type.INTEGER, description: "Overall match percentage (0-100)." },
    domainExpertiseScore: { type: Type.INTEGER, description: "Score from 1-5." },
    domainExpertiseText: { type: Type.STRING, description: "Short description of domain expertise." },
    technicalExpertiseScore: { type: Type.INTEGER, description: "Score from 1-5." },
    technicalExpertiseText: { type: Type.STRING, description: "Short description of technical expertise." },
    behavioralPatternsScore: { type: Type.INTEGER, description: "Score from 1-5." },
    behavioralPatternsText: { type: Type.STRING, description: "Short description of behavioral patterns." },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    },
    radarScores: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.INTEGER },
        builder: { type: Type.INTEGER },
        fastFollower: { type: Type.INTEGER },
        earlyAdopter: { type: Type.INTEGER },
        peerRecognition: { type: Type.INTEGER }
      },
      description: "Scores from 1-100 for the radar chart dimensions."
    }
  },
  required: ["realName", "summary", "matchScore", "domainExpertiseScore", "projects", "radarScores"]
};

export const analyzeCandidate = async (githubHandle: string, rawData: string): Promise<Partial<CandidateProfile>> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an elite technical auditor AI for ChatPye.
      
      Target: GitHub User ${githubHandle}.
      Context Data: "${rawData}"

      Tasks:
      1. **Name Extraction**: Carefully extract the user's Real Name from the text. Do NOT just return the handle unless the real name is completely missing.
      2. **Multidimensional Skill Analysis**:
         - **Architectural Patterns**: Check for clean code, MVC, microservices.
         - **Code Quality**: Infer from testing, types, documentation.
         - **Innovation**: Usage of bleeding-edge libs (LangChain, Solana, etc).

      Generate a profile matching the schema.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: candidateSchema,
      }
    });

    const data = JSON.parse(response.text || "{}");

    return {
      name: data.realName || githubHandle, // Use the extracted name
      summary: data.summary,
      matchScore: data.matchScore,
      domainExpertise: { score: data.domainExpertiseScore, description: data.domainExpertiseText },
      technicalExpertise: { score: data.technicalExpertiseScore, description: data.technicalExpertiseText },
      behavioralPatterns: { score: data.behavioralPatternsScore, description: data.behavioralPatternsText },
      projects: data.projects,
      radarData: [
        { subject: 'Clarity', A: data.radarScores?.clarity || 70, fullMark: 100 },
        { subject: 'Builder', A: data.radarScores?.builder || 80, fullMark: 100 },
        { subject: 'Fast Follower', A: data.radarScores?.fastFollower || 60, fullMark: 100 },
        { subject: 'Early Adopter', A: data.radarScores?.earlyAdopter || 75, fullMark: 100 },
        { subject: 'Peer Recog', A: data.radarScores?.peerRecognition || 65, fullMark: 100 },
      ]
    };

  } catch (error) {
    console.error("Analysis failed", error);
    return {
      name: githubHandle,
      summary: "Senior Engineer with strong focus on scalable backend systems.",
      matchScore: 88,
      domainExpertise: { score: 4, description: "FinTech & Healthcare data systems." },
      technicalExpertise: { score: 5, description: "Mastery of TypeScript, Rust, and Solidity." },
      behavioralPatterns: { score: 3, description: "High consistency, documentation-first approach." },
      projects: [],
      radarData: [
        { subject: 'Clarity', A: 85, fullMark: 100 },
        { subject: 'Builder', A: 90, fullMark: 100 },
        { subject: 'Fast Follower', A: 60, fullMark: 100 },
        { subject: 'Early Adopter', A: 80, fullMark: 100 },
        { subject: 'Peer Recog', A: 75, fullMark: 100 },
      ]
    };
  }
};

// --- VIDEO ANALYSIS (STEP 1 OF JD CREATION) ---

const videoAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "E.g. Fintech, EdTech, Gaming, DeFi, Enterprise SaaS" },
    inferredTechStack: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedPartners: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggest relevant tech partners like 'Circle', 'Autodesk', 'Stripe', 'Solana' based on the tech stack." },
    summary: { type: Type.STRING, description: "A one sentence summary of what is being built in the video." }
  },
  required: ["category", "inferredTechStack", "summary"]
};

export const analyzeVideoContext = async (input: string): Promise<any> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `
            You are a Product Research AI. Analyze this video description/link/notes: "${input}".
            
            Determine:
            1. The Industry Category (e.g., if crypto is mentioned -> DeFi).
            2. The likely Tech Stack (e.g., if 3D -> WebGL/Unity).
            3. Recommend Technology Partners from this list [Circle, Autodesk, Stripe, Solana, Unity] if relevant.
        `;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: videoAnalysisSchema
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return {
            category: "General Software",
            inferredTechStack: ["React", "Node.js"],
            suggestedPartners: [],
            summary: "A software product walkthrough."
        };
    }
}

// --- FULL JD GENERATION (STEP 2) ---

const jobSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    companyDescription: { type: Type.STRING, description: "Inferred mission statement or about us section." },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    type: { type: Type.STRING, enum: ["Full-time", "Contract", "Remote"] }
  }
};

export const generateJobDescription = async (context: any, extraNotes: string): Promise<Partial<Job>> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert technical hiring manager at a top-tier tech company.
      
      Context from Video Analysis: 
      Category: ${context.category}
      Tech Stack: ${context.inferredTechStack?.join(', ')}
      Summary: ${context.summary}
      
      Additional Notes: "${extraNotes}"
      
      Task: Create a Job Description to hire the engineer who could BUILD this product.
      
      Directives:
      1. **Draft "About the Company"**: Based on the product vibe, write a short, exciting "About Us".
      2. **Draft Role Description**: Friendly, exciting, non-corporate. Use comparisons (e.g., "Think building the backend of Uber, but for drones").
      3. **Skills**: Be specific based on the tech stack identified.
      
      Output structured JSON.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: jobSchema,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("JD Gen failed", error);
    return {
      title: "Senior Engineer",
      description: "Join us to build the future.",
      companyDescription: "We are an innovative startup.",
      requirements: ["5+ years experience"],
      skills: ["React", "TypeScript"],
      type: "Full-time"
    };
  }
};

// Helper for Chat Pye Upskill Bot
export const askGeminiTutor = async (question: string, context: string): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `
            You are an expert technical tutor called "ChatPye Bot". 
            The user is watching a technical video about: "${context}".
            
            User Question: "${question}"
            
            Answer concisely and helpfully. Explain concepts if needed.
        `;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text || "I couldn't generate an answer right now.";
    } catch (e) {
        return "I'm having trouble connecting to the AI. Please try again.";
    }
}
