/**
 * Client-Side API Utility
 * Add this to your index.js or create a separate utils file
 */

/**
 * Call the Gemini API through your secure serverless function
 * @param {string} prompt - The user's question or prompt
 * @param {string} systemInstruction - Optional system instruction for the AI
 * @param {string} model - The Gemini model to use (default: gemini-2.0-flash)
 * @returns {Promise<object>} The AI response
 */
async function callGeminiAPI(
  prompt,
  systemInstruction = null,
  model = "gemini-2.0-flash",
) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        model,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get AI response");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

/**
 * Extract text from Gemini API response
 * @param {object} apiResponse - The response from callGeminiAPI
 * @returns {string} The extracted text
 */
function extractGeminiText(apiResponse) {
  try {
    return apiResponse.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error extracting text from response:", error);
    return null;
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Simple question
async function example1() {
  try {
    const response = await callGeminiAPI("What is the capital of France?");
    const text = extractGeminiText(response);
    console.log("AI Response:", text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Example 2: With system instruction (e.g., for quiz generation)
async function example2() {
  const systemInstruction =
    "You are a helpful quiz assistant. Generate questions in a clear, educational manner.";
  const prompt = "Generate 3 multiple choice questions about the solar system.";

  try {
    const response = await callGeminiAPI(prompt, systemInstruction);
    const text = extractGeminiText(response);
    console.log("Quiz Questions:", text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Example 3: Using a different model
async function example3() {
  try {
    const response = await callGeminiAPI(
      "Explain quantum computing in simple terms",
      null,
      "gemini-1.5-pro", // Use Pro model for more complex tasks
    );
    const text = extractGeminiText(response);
    console.log("AI Response:", text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Example 4: Integration with a button click
document.getElementById("askAIButton")?.addEventListener("click", async () => {
  const userQuestion = document.getElementById("questionInput").value;
  const loadingElement = document.getElementById("loading");
  const resultElement = document.getElementById("result");

  if (!userQuestion.trim()) {
    alert("Please enter a question");
    return;
  }

  try {
    // Show loading state
    loadingElement.style.display = "block";
    resultElement.textContent = "";

    // Call the API
    const response = await callGeminiAPI(userQuestion);
    const text = extractGeminiText(response);

    // Display result
    loadingElement.style.display = "none";
    resultElement.textContent = text;
  } catch (error) {
    loadingElement.style.display = "none";
    resultElement.textContent = "Error: " + error.message;
  }
});

// Export functions if using modules
// export { callGeminiAPI, extractGeminiText };
