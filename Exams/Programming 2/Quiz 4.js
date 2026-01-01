/* Exams/Programming 2/Quiz 4.js */
export const questions = [
  {
    q: "What does the <strong> tag do in HTML?",
    options: [
      "Makes text bold",
      "Makes text italic",
      "Underlines text",
      "Makes text superscript",
    ],
    correct: 0,
    explanation:
      "The <strong> tag makes text bold while also indicating semantic importance or emphasis. Browsers typically render it in bold font.",
  },
  {
    q: "Which tag is used to create a definition list in HTML?",
    options: ["<dl>", "<dt>", "<dd>", "All of the above"],
    correct: 3,
    explanation:
      "A definition list uses all three tags: <dl> wraps the list, <dt> defines the term, and <dd> provides the definition or description.",
  },
  {
    q: "What is the purpose of the <q> tag in HTML?",
    options: [
      "To create a blockquote",
      "To create a short inline quotation",
      "To create a numbered list",
      "To create a hyperlink",
    ],
    correct: 1,
    explanation:
      "The <q> tag is used for short, inline quotations. Browsers typically add quotation marks around the content automatically.",
  },
  {
    q: "Which tag is used to display computer code in HTML?",
    options: ["<code>", "<pre>", "<kbd>", "<var>"],
    correct: 0,
    explanation:
      "The <code> tag is specifically designed to display inline code snippets in a monospace font, indicating computer code within text.",
  },
  {
    q: "Which tag is used to create a table in HTML?",
    options: ["<table>", "<tr>", "<td>", "<th>"],
    correct: 0,
    explanation:
      "The <table> tag is the container element that creates a table. It contains rows (<tr>) with cells (<td>) or headers (<th>).",
  },
  {
    q: "What is the purpose of the <form> tag in HTML?",
    options: [
      "To create a table",
      "To create a form for user input",
      "To create a list",
      "To create a hyperlink",
    ],
    correct: 1,
    explanation:
      "The <form> tag creates an interactive form that collects user input and submits it to a server for processing.",
  },
  {
    q: "Which attribute is used to specify the alignment of text in a table cell?",
    options: ["align", "valign", "text-align", "center"],
    correct: 0,
    explanation:
      "The 'align' attribute specifies horizontal alignment in table cells. Though deprecated in HTML5, it was commonly used for 'left', 'center', or 'right' alignment.",
  },
  {
    q: "Which tag is used to create a dropdown list in HTML?",
    options: ["<select>", "<option>", "<dropdown>", "<list>"],
    correct: 0,
    explanation:
      "The <select> tag creates a dropdown list. Individual options within the list are defined using <option> tags.",
  },
  {
    q: "What does the <textarea> tag do in HTML?",
    options: [
      "Creates a single-line text input field",
      "Creates a multi-line text input field",
      "Creates a dropdown list",
      "Creates a button",
    ],
    correct: 1,
    explanation:
      "The <textarea> tag creates a multi-line text input field where users can enter larger amounts of text, such as comments or messages.",
  },
  {
    q: "Which tag is used to define a table row in HTML?",
    options: ["<tr>", "<td>", "<th>", "<table>"],
    correct: 0,
    explanation:
      "The <tr> (table row) tag defines a horizontal row in a table. Each row contains cell data (<td>) or header cells (<th>).",
  },
  {
    q: "What is the purpose of the <th> tag in HTML?",
    options: [
      "To define a table cell",
      "To define a table header",
      "To define a table row",
      "To define a table footer",
    ],
    correct: 1,
    explanation:
      "The <th> tag defines a header cell in a table. These cells typically appear bold and centered, distinguishing them from regular data cells (<td>).",
  },
  {
    q: "Which attribute is used to specify the width of a table in HTML?",
    options: ["width", "size", "table-width", "colspan"],
    correct: 0,
    explanation:
      "The 'width' attribute specifies the width of a table, either in pixels or percentage. However, CSS width property is now preferred.",
  },
  {
    q: "The <b> tag is used to make text bold in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <b> tag renders text in bold. While it doesn't convey semantic importance (unlike <strong>), it's still valid for styling.",
  },
  {
    q: "The <sub> tag is used to create superscript text in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <sub> tag creates subscript text (below baseline). Superscript text (above baseline) uses the <sup> tag.",
  },
  {
    q: "The <ol> tag is used to create a bulleted list in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <ol> tag creates an ordered (numbered) list. The <ul> tag creates unordered (bulleted) lists.",
  },
  {
    q: "The <blockquote> tag is used to create a block of code in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <blockquote> tag is for quotations, not code. Code blocks typically use <pre> or <code> tags.",
  },
  {
    q: "The <div> tag is used to define a section in an HTML document.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <div> tag is a generic container that defines divisions or sections in a document for organization and styling.",
  },
  {
    q: "The <ul> tag is used to create a numbered list in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <ul> tag creates an unordered (bulleted) list. The <ol> tag is used for ordered (numbered) lists.",
  },
  {
    q: "The <strong> tag makes text italic in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <strong> tag makes text bold and indicates importance. The <em> or <i> tags are used for italic text.",
  },
  {
    q: "The <dl> tag is used to create a definition list in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <dl> tag creates a definition list, which contains terms (<dt>) and their definitions (<dd>).",
  },
  {
    q: "The <q> tag is used to create a blockquote in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <q> tag is for short inline quotations. The <blockquote> tag is used for longer block-level quotations.",
  },
  {
    q: "The <code> tag is used to display computer code in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <code> tag is specifically designed to display inline code snippets in a monospace font.",
  },
];
