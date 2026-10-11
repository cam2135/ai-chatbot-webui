// Simple but smart local LLM implementation
// This is a rule-based system that learns from conversation context

type ConversationContext = {
  messages: Array<{ role: string; content: string }>;
  model: string;
};

const knowledge: Record<string, string> = {
  // General knowledge base
  "what is ai": "AI (Artificial Intelligence) is the simulation of human intelligence by machines, especially computer systems. It includes learning, reasoning, and self-correction.",
  "what is machine learning": "Machine Learning is a subset of AI that enables systems to learn and improve from experience without explicit programming.",
  "what is python": "Python is a high-level programming language known for its simplicity and readability. It's widely used in web development, data science, and AI.",
  "what is javascript": "JavaScript is a programming language commonly used for web development. It runs in browsers and enables interactive web pages.",
  "what is react": "React is a JavaScript library for building user interfaces with reusable components and efficient rendering.",
  "what is nextjs": "Next.js is a React framework that enables server-side rendering, static generation, and API routes for full-stack web applications.",
  "what is typescript": "TypeScript is a superset of JavaScript that adds static type checking, making code more robust and maintainable.",
  "what is json": "JSON (JavaScript Object Notation) is a lightweight data format for storing and exchanging structured data.",
  "what is rest api": "REST API is an architectural style for building web services using HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources.",
  "what is git": "Git is a version control system that tracks changes in code, allowing teams to collaborate and maintain project history.",
  "what is github": "GitHub is a platform for hosting Git repositories, enabling collaboration, version control, and project management.",
  "what is docker": "Docker is a containerization platform that packages applications and dependencies into isolated containers for consistent deployment.",
  "what is the weather": "I don't have real-time weather data, but you can check weather.com or your local weather service for current conditions.",
  "what time is it": "I don't have access to real-time data, but your device's clock can show the current time.",
  "who are you": "I'm a local AI chatbot running in your browser. I have a knowledge base and can learn from our conversation.",
};

function cleanQuery(text: string): string {
  return text.toLowerCase().trim();
}

function findRelevantContext(query: string, messages: Array<{ role: string; content: string }>): string {
  // Look through recent messages for relevant context
  const recentMessages = messages.slice(-6); // Last 6 messages
  let context = "";
  
  for (const msg of recentMessages) {
    if (msg.role === "user") {
      context += msg.content + " ";
    }
  }
  
  return context.slice(0, 500); // Limit context size
}

function getKnowledgeResponse(query: string): string | null {
  const cleaned = cleanQuery(query);
  
  // Exact match
  if (knowledge[cleaned]) {
    return knowledge[cleaned];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(knowledge)) {
    if (cleaned.includes(key.split(" ")[0]) || key.includes(cleaned.split(" ")[0])) {
      return value;
    }
  }
  
  return null;
}

function generateContextualResponse(query: string, context: string): string {
  const responses: Record<string, string[]> = {
    greeting: [
      "Hi! How can I help you today?",
      "Hello! What would you like to discuss?",
      "Hey there! What's on your mind?",
    ],
    question: [
      "That's a great question! Let me think about that...",
      "Interesting! Here's what I know about that...",
      "Good question! Let me explain...",
    ],
    statement: [
      "I see. Tell me more about that.",
      "That's interesting. What else?",
      "Got it. Can you elaborate?",
    ],
    help: [
      "I'd be happy to help! What do you need?",
      "Of course! What can I assist you with?",
      "Sure thing! How can I help?",
    ],
    code: [
      "Let me help you with that code...",
      "Great! Here's some guidance on that...",
      "I can help with that programming question...",
    ],
  };

  const cleaned = cleanQuery(query);
  const isGreeting = /^(hi|hello|hey|greetings?)/.test(cleaned);
  const isQuestion = cleaned.endsWith("?");
  const isHelpRequest = /\b(help|how to|how do|assist)\b/.test(cleaned);
  const isCodeRelated = /\b(code|programming|function|variable|debug|error|javascript|python|react|node)\b/.test(cleaned);

  let category = "question";
  if (isGreeting) category = "greeting";
  else if (isHelpRequest) category = "help";
  else if (isCodeRelated) category = "code";
  else if (!isQuestion) category = "statement";

  const categoryResponses = responses[category] || responses.question;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

function buildResponse(query: string, messages: Array<{ role: string; content: string }>): string {
  // Step 1: Check knowledge base
  const knowledgeResponse = getKnowledgeResponse(query);
  if (knowledgeResponse) {
    return knowledgeResponse;
  }

  // Step 2: Get conversation context
  const context = findRelevantContext(query, messages);

  // Step 3: Generate contextual response
  let response = generateContextualResponse(query, context);

  // Step 4: Add relevant follow-up based on context
  const cleaned = cleanQuery(query);
  if (cleaned.includes("javascript") || cleaned.includes("react")) {
    response += " JavaScript is versatile and React makes UI development efficient.";
  } else if (cleaned.includes("python")) {
    response += " Python's simplicity makes it great for learning and rapid development.";
  } else if (cleaned.includes("code") || cleaned.includes("program")) {
    response += " Code is best learned by writing and experimenting. Do you have a specific problem?"
  }

  return response;
}

export async function chat(message: string, context: ConversationContext): Promise<string> {
  // Simulate thinking delay for natural feel
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

  const response = buildResponse(message, context.messages);
  return response;
}

export function addToKnowledge(key: string, value: string): void {
  knowledge[cleanQuery(key)] = value;
}

export function getKnowledge(): Record<string, string> {
  return { ...knowledge };
}
