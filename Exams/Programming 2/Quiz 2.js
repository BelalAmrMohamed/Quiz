/* Exams/Programming 2/Quiz 2.js */
export const questions = [
  {
    q: "Which tag is used to create a line break in HTML?",
    options: ["<br>", "<lb>", "<break>", "<newline>"],
    correct: 0,
    explanation:
      "The <br> tag creates a line break in HTML. It's a self-closing tag that forces content to continue on the next line.",
  },
  {
    q: "What does the <hr> tag do in HTML?",
    options: [
      "Creates a hyperlink",
      "Inserts a horizontal line",
      "Creates a heading",
      "Inserts a line break",
    ],
    correct: 1,
    explanation:
      "The <hr> tag inserts a horizontal rule (line) across the page, often used to separate content sections or create visual breaks.",
  },
  {
    q: "Which tag is used to preserve the formatting of text in HTML?",
    options: ["<pre>", "<format>", "<text>", "<keep>"],
    correct: 0,
    explanation:
      "The <pre> tag (preformatted text) preserves both spaces and line breaks exactly as they appear in the code, using a monospace font.",
  },
  {
    q: "Which tag is used to define the structure of an HTML document?",
    options: ["<html>", "<head>", "<body>", "All of the above"],
    correct: 3,
    explanation:
      "All three tags are essential for HTML document structure: <html> wraps the entire document, <head> contains metadata, and <body> contains the visible content.",
  },
  {
    q: "What is the purpose of the <head> tag in HTML?",
    options: [
      "To define the main content of the document",
      "To contain metadata and other header information",
      "To create a heading",
      "To insert images",
    ],
    correct: 1,
    explanation:
      "The <head> section contains metadata about the document, including the title, character encoding, stylesheets, scripts, and other information not directly visible on the page.",
  },
  {
    q: "Which tag is used to create a paragraph in HTML?",
    options: ["<para>", "<p>", "<paragraph>", "<pg>"],
    correct: 1,
    explanation:
      "The <p> tag defines a paragraph in HTML. Browsers automatically add spacing before and after paragraph elements.",
  },
  {
    q: "What does the <center> tag do in HTML?",
    options: [
      "Centers the content horizontally",
      "Centers the content vertically",
      "Creates a centered heading",
      "Creates a centered image",
    ],
    correct: 0,
    explanation:
      "The <center> tag centers content horizontally on the page. However, this tag is deprecated in HTML5 and CSS should be used instead.",
  },
  {
    q: "Which tag is used to create a horizontal line in HTML?",
    options: ["<line>", "<hr>", "<hl>", "<horizontal>"],
    correct: 1,
    explanation:
      "The <hr> tag creates a horizontal rule (line) in HTML, serving as a thematic break or visual separator between content sections.",
  },
  {
    q: "Which attribute is used to uniquely identify an HTML element?",
    options: ["class", "id", "name", "style"],
    correct: 1,
    explanation:
      "The 'id' attribute provides a unique identifier for an HTML element. Each id must be unique within a page and can be used for CSS styling, JavaScript manipulation, or creating anchor links.",
  },
  {
    q: "What is the purpose of the title attribute in HTML?",
    options: [
      "To define the title of the document",
      "To provide additional information about an element, often displayed as a tooltip",
      "To create a hyperlink",
      "To format text",
    ],
    correct: 1,
    explanation:
      "The 'title' attribute provides supplementary information about an element. When users hover over the element, this information is typically displayed as a tooltip.",
  },
  {
    q: "Which attribute is used to define inline styles in HTML?",
    options: ["class", "id", "style", "font"],
    correct: 2,
    explanation:
      "The 'style' attribute allows you to apply CSS styles directly to an HTML element inline, though external stylesheets are generally preferred for better maintainability.",
  },
  {
    q: "What does the lang attribute in HTML specify?",
    options: [
      "The direction of the text",
      "The language of the document",
      "The alignment of the text",
      "The color of the text",
    ],
    correct: 1,
    explanation:
      "The 'lang' attribute specifies the language of the element's content, helping browsers, search engines, and assistive technologies properly handle the content.",
  },
  {
    q: "The <title> tag is used to define the title of an HTML document.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <title> tag, placed in the <head> section, defines the document's title that appears in the browser tab and search results.",
  },
  {
    q: "The <h1> tag is used for the smallest heading in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <h1> tag creates the largest heading. Headings range from <h1> (largest and most important) to <h6> (smallest).",
  },
  {
    q: "The <br> tag is used to create a line break in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <br> tag inserts a single line break, moving subsequent content to the next line without creating a new paragraph.",
  },
  {
    q: "The <hr> tag is used to create a hyperlink.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <hr> tag creates a horizontal rule (line), not a hyperlink. Hyperlinks are created with the <a> tag.",
  },
  {
    q: "The <pre> tag is used to preserve the formatting of text in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <pre> tag displays text with preserved whitespace and line breaks, exactly as written in the HTML code.",
  },
  {
    q: "The <head> tag contains the main content of an HTML document.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <head> tag contains metadata and document information. The main visible content is contained in the <body> tag.",
  },
  {
    q: "The <p> tag is used to create a paragraph in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <p> tag defines a paragraph element, which browsers render with automatic spacing before and after.",
  },
  {
    q: "The <center> tag is used to center content vertically in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <center> tag centers content horizontally, not vertically. Note that this tag is deprecated in modern HTML.",
  },
  {
    q: "The <hr> tag inserts a horizontal line in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <hr> tag creates a horizontal rule that spans the width of its container, used for visual separation.",
  },
  {
    q: "The <html> tag is optional in an HTML document.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. While browsers may render pages without it, the <html> tag is a required part of proper HTML document structure and should always be included.",
  },
];
