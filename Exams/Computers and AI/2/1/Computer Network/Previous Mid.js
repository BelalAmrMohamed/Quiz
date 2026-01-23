export const questions = [
  {
    q: "A company wants to purchase some network hardware to which they can plug 30 PCs in your department. Which network device is appropriate?",
    options: ["Router", "Firewall", "Switch", "A server"],
    correct: 2,
    explanation:
      "Switches have many network interfaces (usually 24+) and are used to aggregate connections for end hosts within the same LAN.",
  },
  {
    q: "You received a video from your friend's Apple iPhone using Airdrop. What was his iPhone functioning as in this transaction?",
    options: ["A Router", "A client", "A Switch", "A server"],
    correct: 3,
    explanation:
      "In this transaction, the sender functions as a server because it provides the function or service (the video) to the recipient.",
  },
  {
    q: "Your company wants to purchase some network hardware to connect its separate networks together. What kind of network device is appropriate?",
    options: ["A host", "A Firewall", "A LAN", "A Router"],
    correct: 3,
    explanation:
      "Routers are specifically designed to provide connectivity between different LANs and direct data packets across network boundaries.",
  },
  {
    q: "A host node could be...",
    options: ["A Router", "A client", "A Switch", "A Firewall"],
    correct: 1,
    explanation:
      "Host nodes (or endpoints) are addressable devices on a network, such as clients or servers.",
  },
  {
    q: "A network within a city of area around 30 kilometers, is more likely to be...",
    options: ["A LAN", "A MAN", "A WAN"],
    correct: 1,
    explanation:
      "Metropolitan Area Networks (MAN) connect LANs across a city and typically span a range of 5 to 50 kilometers.",
  },
  {
    q: "A software application that filters traffic entering and exiting a PC is",
    options: [
      "Network Firewall",
      "A Switch",
      "Host-based Firewall",
      "A Router",
    ],
    correct: 2,
    explanation:
      "Host-based firewalls are software applications that filter traffic specifically entering and exiting a host machine.",
  },
  {
    q: "The topology in which nodes are only connected to the nodes they interact with most is known as...",
    options: ["Bus", "Full mesh", "Star", "Partial mesh"],
    correct: 3,
    explanation:
      "In a partial mesh topology, nodes are only connected to the specific nodes they communicate with frequently.",
  },
  {
    q: "The topology in which nodes are connected in a circular pattern is...",
    options: ["Bus", "Ring", "Star", "Mesh"],
    correct: 1,
    explanation:
      "Devices are connected in a circle, and packets travel through the ring until they reach their destination.",
  },
  {
    q: "The topology that consists of a central hub or switch, through which all of the data passes, along with all of the peripheral nodes connected to that central node is...",
    options: ["Bus", "Ring", "Star", "Mesh"],
    correct: 2,
    explanation:
      "This topology uses a central hub or switch as a common wiring point for all connected devices.",
  },
  {
    q: "A campus network that is reside in an area around 800 meters, is more likely to be...",
    options: ["A LAN", "A MAN", "A WAN"],
    correct: 0,
    explanation:
      "Local Area Networks typically cover limited areas such as a building or campus up to approximately 1,000 meters.",
  },
  {
    q: "A data has been encapsulated with three separate headers and one trailer. What is the appropriate name for this PDU?",
    options: ["Packet", "Segment", "Frame", "Data"],
    correct: 2,
    explanation:
      "During encapsulation, the Data Link layer adds its own header and a trailer to the packet (which already contains the L4 and L3 headers).",
  },
  {
    q: "The Link Layer of the TCP/IP Model is equivalent to which layer in the OSI Model",
    options: [
      "Transport - Network",
      "Network - Data Link",
      "Data Link",
      "Data link - Physical",
    ],
    correct: 3,
    explanation:
      "The Link layer in the TCP/IP suite corresponds to both the Physical and Data Link layers of the OSI model.",
  },
  {
    q: "The Layer that provides a node-to-node connectivity in the OSI Model is...",
    options: ["Session", "Transport", "Network", "Data Link"],
    correct: 3,
    explanation:
      "This layer provides node-to-node connectivity and handles data transfer between devices like a PC to a switch.",
  },
  {
    q: "The Layer that provides a host-to-host connectivity in the OSI Model is...",
    options: ["Session", "Transport", "Network", "Data Link"],
    correct: 1,
    explanation:
      "The Transport layer is responsible for end-to-end or host-to-host communication.",
  },
  {
    q: "The Layer that is responsible for establishing, managing, terminating connections is....",
    options: ["Session", "Transport", "Network", "Data Link"],
    correct: 0,
    explanation:
      "The Session layer controls the dialogues (sessions) between communicating hosts.",
  },
];
