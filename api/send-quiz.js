// api/send-quiz.js

/**
 * Serverless Function using EmailJS
 *
 * EmailJS Template ID: template_pr68e5e
 * Service ID: service_9p85svr
 * Public Key: a4SJ5icp3kpQPzHHK
 * Private Key: [obviously no]
 *
 * Template has these variables:
 *    - {{quiz_title}}
 *    - {{quiz_description}}
 *    - {{questions_count}}
 *    - {{created_date}}
 *    - {{quiz_content}}
 *
 * Vercel environment variables:
 *    - EMAILJS_SERVICE_ID=your_service_id
 *    - EMAILJS_TEMPLATE_ID=your_template_id
 *    - EMAILJS_PUBLIC_KEY=your_public_key
 *    - EMAILJS_PRIVATE_KEY=your_private_key (optional but recommended)
 */

export default async function handler(req, res) {
  // CORS headers
  const ALLOWED_ORIGINS = [
    "https://divquizzes.vercel.app",
    "https://www.divquizzes.vercel.app",
    "http://127.0.0.1:5500", // Common local server
    "http://localhost:3000", // Common local dev
    "http://localhost:5500"
  ];

  const origin = req.headers.origin;
  
  // Allow all Vercel preview deployments
  const isVercelPreview = origin && origin.endsWith(".vercel.app");
  
  if (ALLOWED_ORIGINS.includes(origin) || isVercelPreview) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error("EmailJS credentials not configured");
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    const { title, description, questions, createdAt } = req.body;

    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request",
      });
    }

    // Generate quiz file content
    const exportQuestions = questions.map((q) => {
      const question = { q: q.q, options: q.options, correct: q.correct };
      if (q.image) question.image = q.image;
      if (q.explanation) question.explanation = q.explanation;
      return question;
    });

    const fileContent = `// ${title}${description ? "\n// " + description : ""}
  // Submitted on ${new Date(createdAt).toLocaleDateString()}
  
  export const questions = ${JSON.stringify(exportQuestions, null, 2)};
  `;

    // Prepare template parameters
    const templateParams = {
      quiz_title: title,
      quiz_description: description || "N/A",
      questions_count: questions.length,
      created_date: new Date(createdAt).toLocaleString(),
      quiz_content: fileContent,
      // Preview of first 3 questions
      preview_questions: questions
        .slice(0, 3)
        .map(
          (q, i) => `
  Question ${i + 1}: ${q.q}
  Options: ${q.options.join(", ")}
  Correct: ${q.options[q.correct]}
        `,
        )
        .join("\n\n"),
    };

    // Send email using EmailJS REST API
    const emailResponse = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          accessToken: PRIVATE_KEY, // Optional but recommended
          template_params: templateParams,
        }),
      },
    );

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("EmailJS error:", errorText);
      return res.status(emailResponse.status).json({
        error: "Email service error",
        message: "Failed to send email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
