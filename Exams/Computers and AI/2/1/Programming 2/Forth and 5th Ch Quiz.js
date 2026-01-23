export const questions = [
  {
    q: "Which tag is used to define the start of an HTML table?",
    options: ["<tab>", "<thead>", "<table>", "<tr>"],
    correct: 2,
    explanation: "Tables are defined with the <table> tag [1].",
  },
  {
    q: "In an HTML table, what does the 'td' in the <td> tag stand for?",
    options: ["Table Division", "Table Data", "Table Design", "Table Document"],
    correct: 1,
    explanation:
      "The letters td stand for 'table data,' which represents the content of a data cell [1].",
  },
  {
    q: "Which tag is used to define a table header, and what is its default styling?",
    options: [
      "<th>; bold and centered",
      "<thead>; italicized",
      "<header>; bold and left-aligned",
      "<td>; bold and centered",
    ],
    correct: 0,
    explanation:
      "Table headings are defined using the <th> tag and are centered and bold by default [2].",
  },
  {
    q: "Which attribute defines the space between the table cell borders and the content within the cell?",
    options: ["cellspacing", "border", "cellpadding", "margin"],
    correct: 2,
    explanation:
      "The cellpadding attribute represents the distance between cell borders and the content within a cell [3, 4].",
  },
  {
    q: "If you want a table cell to span across three columns, which attribute should you use?",
    options: ["rowspan='3'", "colspan='3'", "width='3'", "merge='3'"],
    correct: 1,
    explanation:
      "The colspan attribute is used to merge two or more columns into a single column [5, 6].",
  },
  {
    q: "What is the purpose of the <form> tag in HTML?",
    options: [
      "To create a table for data",
      "To collect data from a site visitor",
      "To style the background of a page",
      "To link multiple web pages together",
    ],
    correct: 1,
    explanation:
      "HTML Forms are required when you want to collect some data from the site visitor, such as during user registration [7].",
  },
  {
    q: "Which attribute of the <form> tag specifies where the user input is sent for processing?",
    options: ["method", "target", "action", "submit"],
    correct: 2,
    explanation:
      "The action attribute defines where the data is sent, such as a back-end file (e.g., test.php) [8, 9].",
  },
  {
    q: "What is a primary characteristic of the 'GET' method in form submission?",
    options: [
      "It is the most secure way to send sensitive data.",
      "It appends form data to the URL as name/value pairs.",
      "It has no size limitations for data transfer.",
      "The submitted data is hidden from the user.",
    ],
    correct: 1,
    explanation:
      "The GET method appends form data to the URL, making it visible and subject to character limits [10].",
  },
  {
    q: "Which input type should be used if the user needs to enter a password so that the characters are masked?",
    options: [
      "type='text'",
      "type='hidden'",
      "type='password'",
      "type='email'",
    ],
    correct: 2,
    explanation:
      "The type='password' attribute is used for fields where characters should not be visible [11, 12].",
  },
  {
    q: "Which attribute is used to display a short hint in an input field before the user enters a value?",
    options: ["value", "required", "placeholder", "name"],
    correct: 2,
    explanation:
      "The placeholder attribute provides a hint or example text inside the input field [13].",
  },
  {
    q: "In a form, which tags are used together to create a group of related elements with a caption?",
    options: [
      "<div> and <label>",
      "<section> and <header>",
      "<fieldset> and <legend>",
      "<table> and <caption>",
    ],
    correct: 2,
    explanation:
      "A <fieldset> is used to group related elements, and a <legend> provides a caption for that group [14].",
  },
  {
    q: "To ensure that a user can only select one option from a list of several choices, which input type and requirement must be met?",
    options: [
      "type='checkbox'; all must have different names",
      "type='radio'; all must have the same name attribute",
      "type='select'; all must have different values",
      "type='button'; all must have the same id",
    ],
    correct: 1,
    explanation:
      "Radio buttons are used for selecting one option among many, and they must share the same name attribute to function as a group [15, 16].",
  },
  {
    q: "Which tag is used to create a multi-line text input area in an HTML form?",
    options: [
      "<input type='text'>",
      "<input type='multiline'>",
      "<textarea>",
      "<text>",
    ],
    correct: 2,
    explanation:
      "The <textarea> tag is used to create a multi-line text input field [17, 18].",
  },
  {
    q: "How can you make a checkbox or radio button selected by default when the page loads?",
    options: [
      "Add the selected attribute",
      "Add the checked attribute",
      "Add the default attribute",
      "Add the value='on' attribute",
    ],
    correct: 1,
    explanation:
      "The checked attribute is set if you want an input to be selected by default [16, 19].",
  },
  {
    q: "Which tag is used to define a drop-down list in an HTML form?",
    options: ["<list>", "<dropdown>", "<select>", "<option>"],
    correct: 2,
    explanation:
      "The <select> tag is used to create a drop-down list, with <option> tags defining the items within it [20, 21].",
  },
];
