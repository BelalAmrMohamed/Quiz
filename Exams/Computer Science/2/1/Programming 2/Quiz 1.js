/* Exams/Programming 2/Quiz 1.js */
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
      "HTML stands for Hyper Text Markup Language. It is the standard markup language used to create and structure content on the web.",
  },
  {
    q: "Which protocol is used by web servers to serve documents?",
    options: ["FTP", "SMTP", "HTTP", "TCP"],
    correct: 2,
    explanation:
      "HTTP (HyperText Transfer Protocol) is the protocol used by web servers to transmit web pages and other resources to clients (browsers).",
  },
  {
    q: "What is the primary function of a web browser?",
    options: [
      "To create web pages",
      "To retrieve, present, and traverse information resources on the web",
      "To store web pages",
      "To design web pages",
    ],
    correct: 1,
    explanation:
      "A web browser's main function is to fetch content from web servers, render it visually, and allow users to navigate between different resources through hyperlinks.",
  },
  {
    q: "What is the main difference between a URL and a URI?",
    options: [
      "A URL specifies the location of a resource, while a URI can identify any type of resource.",
      "A URI specifies the location of a resource, while a URL can identify any type of resource.",
      "A URL is used for email, while a URI is used for web pages.",
      "There is no difference between a URL and a URI.",
    ],
    correct: 0,
    explanation:
      "URL (Uniform Resource Locator) is a specific type of URI that includes the location and access method. URI (Uniform Resource Identifier) is a broader concept that can identify resources without necessarily specifying their location.",
  },
  {
    q: "What is the purpose of a hyperlink in a web page?",
    options: [
      "To display images",
      "To navigate between web pages",
      "To format text",
      "To create tables",
    ],
    correct: 1,
    explanation:
      "Hyperlinks (or links) allow users to navigate from one web page to another, creating the interconnected web of information that defines the World Wide Web.",
  },
  {
    q: "What is the primary purpose of the World Wide Web (WWW)?",
    options: [
      "To send emails",
      "To share scientific information",
      "To provide an information space where documents are interlinked via hyperlinks",
      "To create databases",
    ],
    correct: 2,
    explanation:
      "The WWW was created to provide an information space where documents and resources are interconnected through hyperlinks, making information easily accessible and navigable.",
  },
  {
    q: "Which of the following is NOT a web browser?",
    options: ["Google Chrome", "Firefox", "Microsoft Word", "Safari"],
    correct: 2,
    explanation:
      "Microsoft Word is a word processing application, not a web browser. Chrome, Firefox, and Safari are all web browsers used to access and display web content.",
  },
  {
    q: 'What does the acronym "URL" stand for?',
    options: [
      "Uniform Resource Locator",
      "Universal Resource Locator",
      "Uniform Resource Link",
      "Universal Resource Link",
    ],
    correct: 0,
    explanation:
      "URL stands for Uniform Resource Locator. It specifies the address of a resource on the internet, including the protocol, domain, and path.",
  },
  {
    q: "What is the role of a web server?",
    options: [
      "To browse the internet",
      "To generate and transmit responses to client requests for web resources",
      "To create web pages",
      "To store emails",
    ],
    correct: 1,
    explanation:
      "A web server stores web content and responds to client requests by sending the requested resources (HTML pages, images, etc.) back to the client's browser.",
  },
  {
    q: "What is the main characteristic of Web 2.0?",
    options: [
      "Static web pages",
      "User-generated content and dynamic web pages",
      "No use of JavaScript",
      "Limited interactivity",
    ],
    correct: 1,
    explanation:
      "Web 2.0 represents a shift from static web pages to dynamic, interactive platforms that emphasize user-generated content, collaboration, and social media features.",
  },
  {
    q: "Which tag is used to define the title of an HTML document?",
    options: ["<head>", "<title>", "<body>", "<html>"],
    correct: 1,
    explanation:
      "The <title> tag defines the title of the HTML document, which appears in the browser's title bar or tab. It's placed within the <head> section.",
  },
  {
    q: "What is the correct HTML tag for the largest heading?",
    options: ["<h6>", "<h1>", "<heading>", "<head>"],
    correct: 1,
    explanation:
      "The <h1> tag represents the largest and most important heading in HTML. Heading tags range from <h1> (largest) to <h6> (smallest).",
  },
  {
    q: "HTML stands for Hyper Text Markup Language.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. HTML is an acronym for Hyper Text Markup Language, which is the standard language for creating web pages.",
  },
  {
    q: "The World Wide Web (WWW) is an example of client/server computing.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The WWW follows a client-server model where browsers (clients) request resources from web servers, which then respond with the requested content.",
  },
  {
    q: "A web browser is used to create web pages.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. A web browser is used to view and navigate web pages, not create them. Web pages are created using text editors or specialized web development tools.",
  },
  {
    q: "A URL specifies the location of a resource on the internet.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. A URL (Uniform Resource Locator) provides the complete address needed to locate a specific resource on the internet.",
  },
  {
    q: "The primary purpose of a hyperlink is to display images.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The primary purpose of a hyperlink is to navigate between web pages or different sections of content, not to display images.",
  },
  {
    q: "Web 2.0 is characterized by static web pages.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. Web 2.0 is characterized by dynamic, interactive web pages with user-generated content, not static pages. Static pages were more common in Web 1.0.",
  },
  {
    q: "A web server is responsible for generating and transmitting responses to client requests.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Web servers process incoming HTTP requests from clients and generate appropriate responses, sending back the requested resources.",
  },
  {
    q: "The Internet and the World Wide Web (WWW) are the same thing.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The Internet is the global network infrastructure, while the WWW is a service that runs on the Internet. The WWW is just one of many services available on the Internet.",
  },
  {
    q: "HTTP is the protocol used by web servers to serve documents.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. HTTP (HyperText Transfer Protocol) is the primary protocol used for transmitting web pages and other resources over the Internet.",
  },
  {
    q: "A web page can only contain text and no multimedia content.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. Modern web pages can contain various types of multimedia content including images, videos, audio, animations, and interactive elements.",
  },
];
