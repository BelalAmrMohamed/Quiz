export const questions = [
  {
    q: "Your company wants to purchase some network hardware to connect its separate networks together. What kind of network device is appropriate?",
    options: ["A host", "A Firewall", "A LAN", "A Router"],
    correct: 3,
    explanation:
      "Routers are the primary devices used to provide connectivity between different LANs and direct data packets across network boundaries.",
  },
  {
    q: "A host node could be...",
    options: ["A Router", "A client", "A Switch", "A Firewall"],
    correct: 1,
    explanation:
      "A host node (or endpoint) is any addressable device on a network, such as a client or a server.",
  },
  {
    q: "A network within a city of area around 30 kilometers, is more likely to be...",
    options: ["A LAN", "A MAN", "A WAN"],
    correct: 1,
    explanation:
      "Metropolitan Area Networks connect LANs within a common geographic area like a city, typically spanning 5 to 50 kilometers.",
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
      "Unlike hardware network firewalls, host-based firewalls are software applications installed on a host to filter its specific incoming and outgoing traffic.",
  },
  {
    q: "The topology in which nodes are only connected to the nodes they interact with most is known as...",
    options: ["Bus", "Full mesh", "Star", "Partial mesh"],
    correct: 3,
    explanation:
      "In this specific mesh variant, nodes are only connected to the devices they interact with most, rather than every node.",
  },
  {
    q: "The topology that consists of a central hub or switch, through which all of the data passes, along with all of the peripheral nodes connected to that central node is...",
    options: ["Bus", "Ring", "Star", "Mesh"],
    correct: 2,
    explanation:
      "In a star topology, all data passes through a central wiring point (the hub or switch) to which all peripheral nodes are connected.",
  },
  {
    q: "A campus network that is reside in an area around 800 meters, is more likely to be...",
    options: ["A LAN", "A MAN", "A WAN"],
    correct: 0,
    explanation:
      "Local Area Networks are used for limited areas like a campus or building and typically span up to 1 km in radius.",
  },
  {
    q: "A data has been encapsulated with three separate headers and one trailer. What is the appropriate name for this PDU?",
    options: ["Packet", "Segment", "Frame", "Data"],
    correct: 2,
    explanation:
      "During the encapsulation process, the Data Link layer adds a header and a trailer to the packet (which already contains L4 and L3 headers), resulting in three total headers.",
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
      "The Link layer in the TCP/IP suite corresponds to both the Physical and Data Link layers of the OSI reference model.",
  },
  {
    q: "The Layer that provides a node-to-node connectivity in the OSI Model is...",
    options: ["Session", "Transport", "Network", "Data Link"],
    correct: 3,
    explanation:
      "The Data Link layer is specifically responsible for providing node-to-node connectivity and data transfer, such as between a PC and a switch.",
  },
  {
    q: "Full mesh topology is considered a very expensive topology.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Mesh topologies are noted as being expensive and difficult to install because every node is connected to every other node.",
  },
  {
    q: "In Limited Broadcast the data reaches from a source to all the host in a same network.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The lecture states that in a limited broadcast, data travels from the source to every host within the same network.",
  },
  {
    q: "Video Conferencing is an example of half-duplex communication.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "Video conferencing is an example of Full-Duplex communication because it allows multiple parties to see, hear, and interact with each other simultaneously.",
  },
  {
    q: "Data in Transport Layer is called Segment.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Protocol Data Units (PDUs) in the Transport Layer (Layer 4) are specifically referred to as segments.",
  },
  {
    q: "Session establishment is handled by layer 5 in the OSI model.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The Session Layer (Layer 5) is responsible for establishing, managing, and terminating connections (sessions) between communicating hosts.",
  },
  {
    q: "A Network Node is",
    options: [
      "A connection point in a communication network or any addressable device connected to a network. These nodes have the capability to send, receive, store, process, or create information, and can forward transmissions to other nodes.",
    ],
    correct: 0,
    explanation: "Source:",
  },
  {
    q: "A host-based firewall is",
    options: [
      "A software application that filters traffic entering and exiting a specific host machine, such as a PC. Unlike hardware network firewalls that filter traffic between entire networks, these are installed directly on the device to protect it.",
    ],
    correct: 0,
    explanation: "Source:",
  },
];
