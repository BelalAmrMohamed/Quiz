/* Exams/Programming 2/Quiz 5.js */
export const questions = [
  {
    q: "What does the <form> tag do in HTML?",
    options: [
      "Creates a table",
      "Creates a form for user input",
      "Creates a list",
      "Creates a hyperlink",
    ],
    correct: 1,
    explanation:
      "The <form> tag creates an interactive form that can collect user input through various input elements and submit that data to a server.",
  },
  {
    q: "Which tag is used to create a text input field in HTML?",
    options: ['<input type="text">', "<text>", "<textarea>", "<textfield>"],
    correct: 0,
    explanation:
      'The <input type="text"> creates a single-line text input field where users can enter text data.',
  },
  {
    q: "What is the purpose of the <meta> tag in HTML?",
    options: [
      "To define the structure of the document",
      "To provide metadata about the document",
      "To create a hyperlink",
      "To insert an image",
    ],
    correct: 1,
    explanation:
      "The <meta> tag provides metadata such as character encoding, page description, keywords, author, and viewport settings for responsive design.",
  },
  {
    q: "Which tag is used to create a hyperlink that opens in a new tab?",
    options: [
      '<a href="url" target="_blank">',
      '<a href="url" target="_new">',
      '<a href="url" newtab>',
      '<a href="url" open="_blank">',
    ],
    correct: 0,
    explanation:
      'Adding target="_blank" to an anchor tag makes the link open in a new browser tab or window.',
  },
  {
    q: "What does the <marquee> tag do in HTML?",
    options: [
      "Creates a scrolling text effect",
      "Creates a hyperlink",
      "Creates a table",
      "Creates a form",
    ],
    correct: 0,
    explanation:
      "The <marquee> tag creates scrolling or sliding text. However, it's deprecated and should not be used; CSS animations are the modern alternative.",
  },
  {
    q: "Which tag is used to create a dropdown list in HTML?",
    options: ["<select>", "<option>", "<dropdown>", "<list>"],
    correct: 0,
    explanation:
      "The <select> tag creates a dropdown menu. The <option> tags nested inside define the selectable items.",
  },
  {
    q: "What is the purpose of the <iframe> tag in HTML?",
    options: [
      "To embed another HTML document within the current document",
      "To create a hyperlink",
      "To create a table",
      "To create a form",
    ],
    correct: 0,
    explanation:
      "The <iframe> tag embeds another HTML document within the current page, commonly used for embedding videos, maps, or other external content.",
  },
  {
    q: "Which tag is used to create a button in HTML?",
    options: ["<button>", '<input type="button">', "<click>", "Both a and b"],
    correct: 3,
    explanation:
      'Both <button> and <input type="button"> create clickable buttons. The <button> tag offers more flexibility with content.',
  },
  {
    q: "What does the <abbr> tag do in HTML?",
    options: [
      "Creates an abbreviation or acronym",
      "Creates a hyperlink",
      "Creates a table",
      "Creates a form",
    ],
    correct: 0,
    explanation:
      "The <abbr> tag marks abbreviations or acronyms. The title attribute can provide the full form, shown as a tooltip on hover.",
  },
  {
    q: "Which tag is used to create a numbered list in HTML?",
    options: ["<ul>", "<ol>", "<li>", "<list>"],
    correct: 1,
    explanation:
      "The <ol> (ordered list) tag creates a numbered list with automatically generated numbers for each <li> (list item).",
  },
  {
    q: "What is the purpose of the <caption> tag in HTML?",
    options: [
      "To define a table caption",
      "To define a table header",
      "To define a table row",
      "To define a table footer",
    ],
    correct: 0,
    explanation:
      "The <caption> tag provides a title or caption for a table, appearing above the table by default and describing its content.",
  },
  {
    q: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<a>", "<href>", "<hyperlink>"],
    correct: 1,
    explanation:
      "The <a> (anchor) tag creates hyperlinks. The href attribute specifies the destination URL or page location.",
  },
  {
    q: "The <table> tag is used to create a table in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <table> tag is the main container for creating tables, which contain rows and cells for organizing data.",
  },
  {
    q: "The <form> tag is used to create a table in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <form> tag creates forms for user input, not tables. The <table> tag is used to create tables.",
  },
  {
    q: "The align attribute is used to specify the alignment of text in a table cell.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The 'align' attribute controls horizontal alignment in table cells, though CSS text-align is now preferred.",
  },
  {
    q: "The <select> tag is used to create a dropdown list in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <select> tag creates a dropdown menu with selectable options defined by <option> tags.",
  },
  {
    q: "The <textarea> tag creates a single-line text input field in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <textarea> tag creates a multi-line text input field. Single-line inputs use <input type='text'>.",
  },
  {
    q: "The <tr> tag is used to define a table row in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <tr> tag defines a row in a table, which contains individual cells (<td>) or header cells (<th>).",
  },
  {
    q: "The <th> tag is used to define a table cell in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The <th> tag defines a header cell, which is typically bold and centered. Regular table cells use the <td> tag.",
  },
  {
    q: "The width attribute is used to specify the width of a table in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The 'width' attribute sets table width in pixels or percentage, though CSS is now the preferred method.",
  },
  {
    q: "The <form> tag is used to create a form for user input in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <form> tag creates an interactive form that can contain various input elements like text fields, buttons, and checkboxes.",
  },
  {
    q: 'The <input type="text"> tag is used to create a text input field in HTML.',
    options: ["True", "False"],
    correct: 0,
    explanation:
      'True. The <input type="text"> creates a single-line text input field for user data entry.',
  },
];
