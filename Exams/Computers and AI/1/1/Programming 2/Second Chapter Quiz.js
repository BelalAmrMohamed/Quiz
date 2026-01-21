export const questions = [
  {
    q: "What does HTML stand for?",
    options: [
      "Hyperlinks and Text Markup Language",
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyper Tool Markup Language",
    ],
    correct: 1,
    explanation:
      "According to the sources, HTML stands for Hyper Text Markup Language.",
  },
  {
    q: "Is HTML considered a programming language?",
    options: [
      "Yes, it is a standard programming language",
      "No, it is a markup language",
    ],
    correct: 1,
    explanation:
      "The sources explicitly state that HTML is not a programming language; it is a markup language used to describe the structure of web pages.",
  },
  {
    q: "In what year was the HTML5 version released?",
    options: ["1991", "1999", "2000", "2014"],
    correct: 3,
    explanation:
      "The HTML Versions table in the sources lists HTML5 as being released in 2014.",
  },
  {
    q: "Which simple text editor is recommended for the course examples on Windows?",
    options: ["Adobe Dreamweaver", "CoffeeCup HTML Editor", "Notepad", "Microsoft Word"],
    correct: 2,
    explanation:
      "While Dreamweaver and CoffeeCup are professional editors, the sources state that for simple examples, only Notepad (Windows) is needed.",
  },
  {
    q: "What is the primary purpose of a web browser regarding HTML tags?",
    options: [
      "To display the HTML tags to the user",
      "To edit the HTML tags within the browser",
      "To read HTML documents and use tags to determine how to display content, without displaying the tags themselves",
      "To compile HTML into machine code",
    ],
    correct: 2,
    explanation:
      "The sources state that browsers do not display HTML tags but use them to determine how to display the document.",
  },
  {
    q: "How is an HTML 'end tag' correctly written?",
    options: [
      "The same as the start tag",
      "With a backslash (\\) before the tag name",
      "With a forward slash (/) before the tag name",
      "With a dot (.) before the tag name",
    ],
    correct: 2,
    explanation:
      "According to the sources, an end tag is written like a start tag but with a forward slash inserted before the tag name, such as </p>.",
  },
  {
    q: "Which tag represents the root element of an HTML page?",
    options: ["<head>", "<body>", "<html>", "<!DOCTYPE>"],
    correct: 2,
    explanation:
      "The sources identify the <html> tag as the root element that encloses the complete HTML document.",
  },
  {
    q: "Which heading tag defines the least important heading?",
    options: ["<h1>", "<h3>", "<h5>", "<h6>"],
    correct: 3,
    explanation:
      "The sources state that <h1> defines the most important heading and <h6> defines the least important heading.",
  },
  {
    q: "Which of the following statements about HTML is TRUE?",
    options: [
      "HTML is highly case sensitive",
      "HTML is affected by extra spaces and line breaks in the code",
      "HTML language is not case sensitive and is not affected by spaces and line breaks",
      "HTML only supports text and graphics, not sound or video",
    ],
    correct: 2,
    explanation:
      "The sources mention that HTML is not case sensitive and does not get affected by spaces or line breaks.",
  },
  {
    q: "What is the purpose of the <br> element?",
    options: [
      "To create a new paragraph",
      "To define a line break without starting a new paragraph",
      "To bold the text",
      "To insert a horizontal line",
    ],
    correct: 1,
    explanation:
      "The sources define <br> as the element for a line break when a new line is needed without a new paragraph.",
  },
  {
    q: "Which tag is used to define 'subscripted' text?",
    options: ["<sup>", "<sub>", "<small>", "<mark>"],
    correct: 1,
    explanation:
      "Based on the HTML Text Formatting Elements table, <sub> is used for subscripted text and <sup> is for superscripted text.",
  },
  {
    q: "Which tag contains meta information about the document and is not visible on the page itself?",
    options: ["<html>", "<body>", "<head>", "<h1>"],
    correct: 2,
    explanation:
      "The sources state that the <head> tag contains meta information about the document, while the <body> contains the visible page content.",
  },
];