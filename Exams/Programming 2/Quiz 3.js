/* Exams/Programming 2/Quiz 3.js */
export const questions = [
  {
    q: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<a>", "<href>", "<hyperlink>"],
    correct: 1,
    explanation:
      "The <a> (anchor) tag is used to create hyperlinks. The 'href' attribute specifies the destination URL.",
  },
  {
    q: "What is the purpose of the class attribute in HTML?",
    options: [
      "To uniquely identify an element",
      "To group elements for styling with CSS",
      "To define the language of the document",
      "To create a hyperlink",
    ],
    correct: 1,
    explanation:
      "The 'class' attribute is used to assign one or more class names to elements, allowing multiple elements to share the same styling or behavior. Unlike 'id', class names can be reused.",
  },
  {
    q: "Which attribute is used to specify the direction of text in HTML?",
    options: ["lang", "dir", "align", "text-direction"],
    correct: 1,
    explanation:
      "The 'dir' attribute specifies the text direction, with values 'ltr' (left-to-right) or 'rtl' (right-to-left), important for languages like Arabic or Hebrew.",
  },
  {
    q: "What does the xml:lang attribute do in HTML?",
    options: [
      "Specifies the language of the document for XML parsers",
      "Specifies the alignment of text",
      "Specifies the direction of text",
      "Specifies the color of text",
    ],
    correct: 0,
    explanation:
      "The 'xml:lang' attribute specifies the language for XML documents and XHTML, ensuring proper language handling by XML parsers.",
  },
  {
    q: "Which attribute is used to define the background color of an HTML element?",
    options: ["bgcolor", "background", "color", "bg"],
    correct: 0,
    explanation:
      "The 'bgcolor' attribute sets the background color of an element. However, this attribute is deprecated in HTML5, and CSS background-color property should be used instead.",
  },
  {
    q: "What is the purpose of the style attribute in HTML?",
    options: [
      "To define the structure of the document",
      "To apply inline CSS styles to an element",
      "To create a hyperlink",
      "To define the language of the document",
    ],
    correct: 1,
    explanation:
      "The 'style' attribute applies inline CSS directly to an element, allowing you to set styles without using external or internal stylesheets.",
  },
  {
    q: "Which tag is used to make text bold in HTML?",
    options: ["<bold>", "<b>", "<strong>", "Both b and c"],
    correct: 3,
    explanation:
      "Both <b> and <strong> make text bold. However, <strong> indicates semantic importance while <b> is purely presentational. Modern practice favors <strong> for important text.",
  },
  {
    q: "What is the purpose of the <sub> tag in HTML?",
    options: [
      "To create superscript text",
      "To create subscript text",
      "To underline text",
      "To italicize text",
    ],
    correct: 1,
    explanation:
      "The <sub> tag creates subscript text that appears below the baseline, commonly used in chemical formulas (H₂O) or mathematical expressions.",
  },
  {
    q: "Which tag is used to create a numbered list in HTML?",
    options: ["<ul>", "<ol>", "<li>", "<list>"],
    correct: 1,
    explanation:
      "The <ol> (ordered list) tag creates a numbered list. Each list item is defined with <li> tags, and numbers are automatically generated.",
  },
  {
    q: "What does the <blockquote> tag do in HTML?",
    options: [
      "Creates a block of code",
      "Indents a block of text as a quotation",
      "Creates a bulleted list",
      "Creates a hyperlink",
    ],
    correct: 1,
    explanation:
      "The <blockquote> tag is used for longer quotations that are displayed as indented blocks, typically indicating content quoted from another source.",
  },
  {
    q: "Which tag is used to define a section in an HTML document?",
    options: ["<section>", "<div>", "<span>", "<area>"],
    correct: 1,
    explanation:
      "The <div> tag is a generic container used to group content and define sections. While <section> is also valid in HTML5, <div> is the most commonly used for general divisions.",
  },
  {
    q: "Which tag is used to create a bulleted list in HTML?",
    options: ["<ol>", "<ul>", "<li>", "<list>"],
    correct: 1,
    explanation:
      "The <ul> (unordered list) tag creates a bulleted list. Each list item is marked with <li> tags, and bullets are automatically added.",
  },
  {
    q: "The id attribute is used to uniquely identify an HTML element.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The 'id' attribute must be unique within a document and serves as a unique identifier for styling, scripting, or linking purposes.",
  },
  {
    q: "The title attribute is used to define the title of the document.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The 'title' attribute provides tooltip information for elements. The document title is defined by the <title> tag in the <head> section.",
  },
  {
    q: "The style attribute is used to apply inline CSS styles to an element.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The 'style' attribute allows direct application of CSS properties to individual HTML elements.",
  },
  {
    q: "The lang attribute specifies the direction of text in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The 'lang' attribute specifies the language of content, not text direction. The 'dir' attribute specifies text direction.",
  },
  {
    q: "The <a> tag is used to create a hyperlink in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The <a> (anchor) tag creates clickable hyperlinks that navigate to other pages or locations.",
  },
  {
    q: "The class attribute is used to uniquely identify an element.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The 'class' attribute groups multiple elements together; it's not unique. The 'id' attribute is used for unique identification.",
  },
  {
    q: "The dir attribute is used to specify the direction of text in HTML.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The 'dir' attribute sets text direction as either 'ltr' (left-to-right) or 'rtl' (right-to-left).",
  },
  {
    q: "The xml:lang attribute specifies the alignment of text in HTML.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The 'xml:lang' attribute specifies the language for XML parsers, not text alignment. Text alignment is controlled by CSS.",
  },
  {
    q: "The bgcolor attribute is used to define the background color of an HTML element.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. The 'bgcolor' attribute sets background color, though it's deprecated in HTML5 in favor of CSS.",
  },
  {
    q: "The style attribute is used to define the structure of the document.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The 'style' attribute applies visual styling to elements, not document structure. Document structure is defined by HTML tags like <html>, <head>, and <body>.",
  },
];
