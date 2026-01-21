export const questions = [
  {
    q: "What year was the OSI model created by the International Organization for Standardization (ISO)?",
    options: ["1974", "1984", "1994", "2004"],
    correct: 1,
    explanation: "The OSI model was created in 1984 by ISO.",
  },
  {
    q: "How many abstraction layers are in the OSI reference model?",
    options: ["4", "5", "7", "8"],
    correct: 2,
    explanation:
      "The OSI model is split into seven different abstraction layers.",
  },
  {
    q: "Which layer is the highest layer (Layer 7) in the OSI model?",
    options: ["Physical", "Network", "Session", "Application"],
    correct: 3,
    explanation:
      "The Application layer is the 7th and top layer of the OSI model.",
  },
  {
    q: "Which layer is responsible for transmitting raw bits over a physical medium (Layer 1)?",
    options: ["Data Link", "Physical", "Transport", "Presentation"],
    correct: 1,
    explanation: "The Physical layer is Layer 1 of the OSI model.",
  },
  {
    q: "What is the primary purpose of the OSI model?",
    options: [
      "To replace the Internet",
      "To provide a reference framework that standardizes network communication",
      "To define only hardware specifications",
      "To eliminate the need for protocols",
    ],
    correct: 1,
    explanation:
      "It is a reference framework to standardize network communication and explain data transmission.",
  },
  {
    q: "True or False: The OSI model supports interoperability between different products and software.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The model characterizes functions into rules to support interoperability.",
  },
  {
    q: "In the TCP/IP suite, functionality is divided into how many layers?",
    options: ["3", "4", "7", "10"],
    correct: 1,
    explanation: "TCP/IP functionality is divided into four layers.",
  },
  {
    q: "Which of the following is an Application layer protocol in the TCP/IP model?",
    options: ["IP", "TCP", "HTTP", "Ethernet"],
    correct: 2,
    explanation: "HTTP, FTP, and SMTP are Application layer protocols.",
  },
  {
    q: "Which layer in the TCP/IP model is responsible for maintaining end-to-end communications?",
    options: [
      "Link layer",
      "Internet layer",
      "Transport layer",
      "Application layer",
    ],
    correct: 2,
    explanation:
      "The Transport layer maintains end-to-end communications across the network.",
  },
  {
    q: "What is the TCP/IP Network layer also commonly called?",
    options: [
      "Link layer",
      "Internet layer",
      "Session layer",
      "Physical layer",
    ],
    correct: 1,
    explanation: "The network layer is also called the internet layer.",
  },
  {
    q: "Which protocol is used at the Network (Internet) layer for error reporting?",
    options: ["TCP", "UDP", "ICMP", "SNMP"],
    correct: 2,
    explanation:
      "ICMP (Internet Control Message Protocol) is used for error reporting.",
  },
  {
    q: "The TCP/IP 'Link' layer (Layer 1) is a combination of which two OSI layers?",
    options: [
      "Physical and Data Link",
      "Network and Transport",
      "Session and Presentation",
      "Data Link and Network",
    ],
    correct: 0,
    explanation:
      "The TCP/IP Link layer corresponds to the OSI Physical and Data Link layers.",
  },
  {
    q: "Which protocol operates at the lowest (Link) layer of the TCP/IP suite?",
    options: ["HTTP", "IP", "Ethernet", "POP3"],
    correct: 2,
    explanation: "Protocols in this lowest layer include Ethernet and ARP.",
  },
  {
    q: "What does the Application layer payload consist of?",
    options: [
      "Packets",
      "The actual application data",
      "Frames",
      "MAC addresses",
    ],
    correct: 1,
    explanation:
      "At the application layer, the payload is the actual application data.",
  },
  {
    q: "Which protocol handles host communication and provides flow control and reliability?",
    options: ["UDP", "IP", "TCP", "ICMP"],
    correct: 2,
    explanation:
      "TCP handles communications between hosts and provides flow control and reliability.",
  },
  {
    q: "True or False: User Datagram Protocol (UDP) is a Transport layer protocol.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Transport protocols include TCP and User Datagram Protocol (UDP).",
  },
  {
    q: "OSI Layer 3 (Network) maps directly to which TCP/IP layer?",
    options: ["Application", "Transport", "Internet", "Link"],
    correct: 2,
    explanation: "The OSI Network layer maps to the TCP/IP Internet layer.",
  },
  {
    q: "OSI Layer 4 (Transport) maps directly to which TCP/IP layer?",
    options: ["Application", "Transport", "Internet", "Link"],
    correct: 1,
    explanation: "The OSI Transport layer maps to the TCP/IP Transport layer.",
  },
  {
    q: "OSI Layers 5 (Session), 6 (Presentation), and 7 (Application) map to which single TCP/IP layer?",
    options: ["Transport", "Internet", "Application", "Link"],
    correct: 2,
    explanation:
      "These three upper OSI layers map to the TCP/IP Application layer.",
  },
  {
    q: "What does 'OSI' stand for?",
    options: [
      "Open Systems Interconnection",
      "Official Systems Interface",
      "Optical Signal Interconnect",
      "Operational System Integration",
    ],
    correct: 0,
    explanation: "OSI stands for Open Systems Interconnection.",
  },
  {
    q: "Which protocol is used for email retrieval as mentioned in the Application layer?",
    options: ["SMTP", "POP3", "FTP", "HTTP"],
    correct: 1,
    explanation:
      "Post Office Protocol 3 (POP3) is listed as an application layer protocol.",
  },
  {
    q: "Which protocol is used for transferring files?",
    options: ["SNMP", "HTTP", "FTP", "ICMP"],
    correct: 2,
    explanation:
      "FTP (File Transfer Protocol) is an application layer protocol.",
  },
  {
    q: "The term 'packets' is specifically associated with which TCP/IP layer?",
    options: ["Application", "Internet", "Transport", "Link"],
    correct: 1,
    explanation: "The network (internet) layer deals with packets.",
  },
  {
    q: "Which layer consists of protocols that operate only on a link interconnecting nodes?",
    options: [
      "Physical (Link) layer",
      "Internet layer",
      "Transport layer",
      "Application layer",
    ],
    correct: 0,
    explanation:
      "The physical/link layer consists of protocols that operate only on a link.",
  },
  {
    q: "True or False: ARP (Address Resolution Protocol) is a Network (Internet) layer protocol in the TCP/IP model.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "ARP is categorized under the Physical/Link layer in the TCP/IP functionality description.",
  },
  {
    q: "Which protocol is used for managing devices on an IP network?",
    options: ["SMTP", "SNMP", "TCP", "IP"],
    correct: 1,
    explanation:
      "SNMP (Simple Network Management Protocol) is an Application layer protocol.",
  },
  {
    q: "What does 'multiplexing' provide in the Transport layer?",
    options: [
      "Error reporting",
      "Physical connectivity",
      "Maintaining multiple communications",
      "Data encryption",
    ],
    correct: 2,
    explanation:
      "TCP provides flow control, multiplexing, and reliability at the transport layer.",
  },
  {
    q: "True or False: The OSI model was created by the ISO in 1984.",
    options: ["True", "False"],
    correct: 0,
    explanation: "This is the correct organization and year.",
  },
  {
    q: "Which layer handles the 'logical' transmission of data between different networks?",
    options: ["Application", "Network (Internet)", "Transport", "Physical"],
    correct: 1,
    explanation:
      "The network layer connects independent networks to transport packets across boundaries.",
  },
  {
    q: "Which OSI layer is Layer 2?",
    options: ["Physical", "Data Link", "Network", "Transport"],
    correct: 1,
    explanation: "The sequence is Physical (1), Data Link (2), Network (3).",
  },
  {
    q: "Which OSI layer is Layer 6?",
    options: ["Application", "Presentation", "Session", "Transport"],
    correct: 1,
    explanation:
      "The sequence is Transport (4), Session (5), Presentation (6), Application (7).",
  },
  {
    q: "True or False: TCP is connectionless.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "UDP is connectionless; TCP provides reliability and flow control.",
  },
  {
    q: "Which protocol is used to send emails?",
    options: ["POP3", "FTP", "SMTP", "SNMP"],
    correct: 2,
    explanation:
      "Simple Mail Transfer Protocol (SMTP) is used for standardized email exchange.",
  },
  {
    q: "Which layer provides standardized data exchange for applications?",
    options: [
      "Application Layer",
      "Transport Layer",
      "Network Layer",
      "Link Layer",
    ],
    correct: 0,
    explanation:
      "The application layer provides applications with standardized data exchange.",
  },
  {
    q: "Which OSI layer is responsible for managing communication sessions (Layer 5)?",
    options: ["Presentation", "Session", "Application", "Network"],
    correct: 1,
    explanation: "Layer 5 of the OSI model is the Session layer.",
  },
  {
    q: "Essay: Name all seven layers of the OSI model in order from 1 to 7.",
    options: [
      "1. Physical, 2. Data Link, 3. Network, 4. Transport, 5. Session, 6. Presentation, 7. Application",
    ],
    correct: 0,
    explanation: "Source:",
  },
  {
    q: "Essay: List the four layers of the TCP/IP suite as described in Lecture 4.",
    options: [
      "1. Application, 2. Transport, 3. Network (Internet), 4. Physical (Link)",
    ],
    correct: 0,
    explanation: "Source:",
  },
  {
    q: "Essay: Name three protocols that operate at the TCP/IP Application layer.",
    options: ["HTTP, FTP, POP3, SMTP, and SNMP"],
    correct: 0,
    explanation: "Source:",
  },
  {
    q: "Essay: What is the primary responsibility of the Transport layer?",
    options: [
      "Maintaining end-to-end communications across the network, including flow control, multiplexing, and reliability.",
    ],
    correct: 0,
    explanation: "Source:",
  },
  {
    q: "Essay: Which OSI layers map to the TCP/IP 'Link' layer?",
    options: ["The Physical layer and the Data Link layer."],
    correct: 0,
    explanation: "Source:",
  },
];
