import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Lazy initialization to avoid throwing when API key is not set
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    // Validate API key format - must be ASCII only and start with sk-
    const trimmedKey = apiKey.trim();
    if (!/^sk-[a-zA-Z0-9_-]+$/.test(trimmedKey)) {
      console.error("Invalid API key format detected. API key should only contain ASCII characters and start with 'sk-'");
      throw new Error("Invalid OpenAI API key format. Please check the key for extra characters or spaces.");
    }
    openaiClient = new OpenAI({ apiKey: trimmedKey });
  }
  return openaiClient;
}

export interface ChatRequest {
  message: string;
  chapterId: string;
  chapterName: string;
  subjectName: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface QuizGenerationRequest {
  chapterId: string;
  chapterName: string;
  subjectName: string;
  topic?: string;
  count?: number;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function getAIChatResponse(request: ChatRequest): Promise<string> {
  const systemPrompt = `You are an expert NCERT tutor specializing in ${request.subjectName} for IIT-JEE and NEET preparation. You are currently helping a student with "${request.chapterName}".

Your role:
1. Answer questions ONLY related to ${request.subjectName}, specifically topics covered in NCERT syllabus for Class 11 and 12
2. Focus on concepts, formulas, derivations, and problem-solving from the "${request.chapterName}" chapter
3. Provide clear, step-by-step explanations suitable for competitive exam preparation
4. Reference NCERT textbook content when applicable
5. Give JEE/NEET exam tips and common mistakes to avoid
6. If asked about topics outside ${request.subjectName} or NCERT syllabus, politely redirect to the relevant subject

Important guidelines:
- Be concise but thorough
- Use proper scientific notation and formulas
- Provide numerical examples when helpful
- Highlight important points for exam preparation
- If the question is unrelated to academics or NCERT, politely decline and suggest asking about ${request.chapterName}

If the user asks for a quiz or practice questions, inform them they can use the "Give me a quiz" button for instant practice questions.`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...request.conversationHistory.slice(-10),
    { role: "user", content: request.message }
  ];

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    max_completion_tokens: 2048,
  });

  return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
}

export async function generateInstantQuiz(request: QuizGenerationRequest): Promise<GeneratedQuestion[]> {
  const count = request.count || 10;
  
  const systemPrompt = `You are an expert NCERT question paper setter for IIT-JEE and NEET exams. Generate exactly ${count} multiple choice questions from the "${request.chapterName}" chapter in ${request.subjectName}.

Requirements:
1. Questions must be strictly from NCERT Class 11/12 ${request.subjectName} syllabus
2. Cover different difficulty levels: 3 easy, 4 medium, 3 tough
3. Include conceptual questions, numerical problems, and application-based questions
4. Each question must have exactly 4 options (A, B, C, D)
5. Provide clear explanations referencing NCERT concepts
${request.topic ? `6. Focus specifically on the topic: ${request.topic}` : ""}

Respond with a JSON object in this exact format:
{
  "questions": [
    {
      "question": "The question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation referencing NCERT concept"
    }
  ]
}

Note: correctAnswer is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D).`;

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate ${count} MCQ questions for ${request.chapterName} in ${request.subjectName}. ${request.topic ? `Focus on: ${request.topic}` : "Cover various topics from this chapter."}` }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate quiz questions");
  }

  const parsed = JSON.parse(content);
  return parsed.questions as GeneratedQuestion[];
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
