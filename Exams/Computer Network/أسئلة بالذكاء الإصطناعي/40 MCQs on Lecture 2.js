export const questions = [
  // --- Multiple Choice Questions ---
  {
    q: "What is a computer network?",
    options: [
      "A single computer with multiple users",
      "Two or more computing devices connected to exchange information and share resources",
      "A device used only for internet access",
      "A software application for communication",
    ],
    correct: 1,
    explanation:
      "A network is defined by the connection of multiple devices for resource sharing.",
  },
  {
    q: "A network node is best described as:",
    options: [
      "A physical cable",
      "A connection point capable of sending, receiving, or processing data",
      "A type of software",
      "Only a server",
    ],
    correct: 1,
    explanation:
      "Any device connected to a network that can communicate is considered a node.",
  },
  {
    q: "Which of the following is an example of a network node?",
    options: ["A printer", "A switch", "A router", "All of the above"],
    correct: 3,
    explanation:
      "Printers, switches, and routers are all addressable points on a network.",
  },
  {
    q: "What is a client in a network?",
    options: [
      "A device that provides services",
      "A device that requests and accesses services",
      "A device that only stores data",
      "A device that connects networks",
    ],
    correct: 1,
    explanation: "Clients are the 'consumers' in the network relationship.",
  },
  {
    q: "What is a server in a network?",
    options: [
      "A device that requests services",
      "A device that provides services or functions for clients",
      "A device that only connects to the internet",
      "A device that filters traffic",
    ],
    correct: 1,
    explanation:
      "Servers 'serve' resources such as files, web pages, or email to clients.",
  },
  {
    q: "The world’s largest server room is located in:",
    options: ["United States", "China", "Japan", "Germany"],
    correct: 1,
    explanation:
      "The China Telecom Data Center is currently the largest in the world.",
  },
  {
    q: "A switch is primarily used to:",
    options: [
      "Connect different LANs",
      "Connect devices within the same LAN",
      "Filter network traffic",
      "Provide internet connectivity",
    ],
    correct: 1,
    explanation:
      "Switches create a network by connecting devices locally (Intra-network).",
  },
  {
    q: "How many ports does a typical switch have?",
    options: ["Less than 10", "12–16", "24 or more", "Only 2"],
    correct: 2,
    explanation:
      "Enterprise switches commonly come in 24 or 48 port configurations.",
  },
  {
    q: "Which device is used to connect different LANs or provide internet connectivity?",
    options: ["Switch", "Hub", "Router", "Firewall"],
    correct: 2,
    explanation: "Routers connect different networks (Inter-network).",
  },
  {
    q: "A router generally has ______ network interfaces compared to a switch.",
    options: ["More", "Fewer", "The same number", "No"],
    correct: 1,
    explanation:
      "Routers usually have a few high-speed interfaces, while switches have many ports for end-user devices.",
  },
  {
    q: "What is the main function of a firewall?",
    options: [
      "To increase network speed",
      "To monitor and control network traffic based on rules",
      "To connect devices in a LAN",
      "To store data",
    ],
    correct: 1,
    explanation:
      "Firewalls act as a security barrier based on a set of security rules.",
  },
  {
    q: "Where can a firewall be placed in a network?",
    options: [
      "Only outside the network",
      "Only inside the network",
      "Both inside and outside",
      "Only between switches",
    ],
    correct: 2,
    explanation:
      "Firewalls can protect the perimeter or segments within the internal network.",
  },
  {
    q: "A Next-Generation Firewall (NGFW) includes:",
    options: [
      "Only basic filtering",
      "More advanced and modern filtering capabilities",
      "Only hardware components",
      "Only software components",
    ],
    correct: 1,
    explanation:
      "NGFWs go beyond simple packet filtering to include deep packet inspection and encrypted traffic analysis.",
  },
  {
    q: "Which device operates at the Data Link layer (Layer 2) of the OSI model?",
    options: ["Router", "Firewall", "Switch", "Hub"],
    correct: 2,
    explanation: "Switches use MAC addresses, which are Layer 2 identifiers.",
  },
  {
    q: "Which device operates at the Network layer (Layer 3) of the OSI model?",
    options: ["Switch", "Router", "Hub", "Firewall"],
    correct: 1,
    explanation: "Routers use IP addresses, which are Layer 3 identifiers.",
  },
  {
    q: "A device that can act as both a client and a server is called:",
    options: ["A peer", "A node", "A hybrid device", "All of the above"],
    correct: 0,
    explanation:
      "In Peer-to-Peer (P2P) networking, devices share resources equally.",
  },
  {
    q: "Which of the following is NOT a function of a network node?",
    options: [
      "Sending data",
      "Receiving data",
      "Creating physical cables",
      "Storing data",
    ],
    correct: 2,
    explanation:
      "Cables are the transmission media, not a function performed by a node.",
  },
  {
    q: "In a client/server model, the client:",
    options: [
      "Provides services",
      "Requests services",
      "Stores all network data",
      "Routes traffic between networks",
    ],
    correct: 1,
    explanation: "Clients initiate the request for service.",
  },
  {
    q: "Which company is mentioned as using the China Telecom Data Center?",
    options: ["Google", "Microsoft", "Alibaba", "Amazon"],
    correct: 2,
    explanation: "Alibaba is a major user of the China Telecom infrastructure.",
  },
  {
    q: "What is the main purpose of a switch in a LAN?",
    options: [
      "To connect to the internet",
      "To forward traffic within the same LAN",
      "To filter malicious traffic",
      "To provide wireless access",
    ],
    correct: 1,
    explanation:
      "Switches facilitate communication between local devices like PCs and printers.",
  },
  {
    q: "A firewall that filters traffic entering and exiting a single host is called:",
    options: [
      "Network firewall",
      "Host-based firewall",
      "Router firewall",
      "Switch firewall",
    ],
    correct: 1,
    explanation:
      "Host-based firewalls (like Windows Firewall) protect individual devices.",
  },
  {
    q: "Which device is often placed between a LAN and the internet?",
    options: ["Switch", "Hub", "Router", "Repeater"],
    correct: 2,
    explanation: "The router serves as the gateway to external networks.",
  },
  {
    q: "What does a firewall use to decide whether to allow or deny traffic?",
    options: [
      "Random selection",
      "Configured security rules",
      "Device manufacturer",
      "Network speed",
    ],
    correct: 1,
    explanation:
      "Access Control Lists (ACLs) and security rules define what traffic is permitted.",
  },
  {
    q: "If PC1 in New York tries to access SRV1 in Tokyo, what should the firewall do if configured correctly?",
    options: [
      "Block the traffic",
      "Allow the traffic",
      "Slow down the traffic",
      "Encrypt the traffic",
    ],
    correct: 1,
    explanation:
      "Firewalls are configured to allow legitimate business traffic while blocking threats.",
  },
  {
    q: "Which of the following is a hardware device?",
    options: ["Host-based firewall", "Network firewall", "Both", "Neither"],
    correct: 1,
    explanation:
      "While software firewalls exist, 'Network firewalls' are typically dedicated hardware appliances.",
  },
  {
    q: "A switch CANNOT:",
    options: [
      "Connect devices in a LAN",
      "Provide internet connectivity directly",
      "Have multiple ports",
      "Forward data within a LAN",
    ],
    correct: 1,
    explanation:
      "A switch does not perform routing; a router is needed for internet connectivity.",
  },
  {
    q: "Which device is responsible for logical addressing and routing?",
    options: ["Switch", "Hub", "Router", "Firewall"],
    correct: 2,
    explanation: "Routing is the core function of a router.",
  },
  {
    q: "What is the role of a firewall in network security?",
    options: [
      "To increase bandwidth",
      "To prevent unauthorized access",
      "To connect devices wirelessly",
      "To store backup data",
    ],
    correct: 1,
    explanation:
      "Firewalls are primarily security tools to prevent unauthorized entry.",
  },
  {
    q: "A network node must always be:",
    options: ["A physical device", "Addressable", "A server", "A router"],
    correct: 1,
    explanation:
      "To participate in a network, a node must have a unique address (IP or MAC).",
  },
  {
    q: "In the client/server relationship, the server:",
    options: [
      "Always has fewer resources than the client",
      "Provides services to the client",
      "Cannot be a node",
      "Must be located in the same room as the client",
    ],
    correct: 1,
    explanation:
      "Servers provide functionality; they do not need to be physically near the client.",
  },

  // --- True or False Questions ---
  {
    q: "A computer network requires at least three devices to function.",
    options: ["True", "False"],
    correct: 1,
    explanation: "A network can be formed with as few as two devices.",
  },
  {
    q: "A network node can only be a computer or server.",
    options: ["True", "False"],
    correct: 1,
    explanation: "Nodes include printers, switches, routers, and IoT devices.",
  },
  {
    q: "A client can never act as a server.",
    options: ["True", "False"],
    correct: 1,
    explanation: "In peer-to-peer networks, a client can act as a server.",
  },
  {
    q: "A switch is used to connect different LANs.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "Routers connect different LANs; switches connect devices within a LAN.",
  },
  {
    q: "Routers have more network interfaces than switches.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "Switches typically have many more interfaces (ports) than routers.",
  },
  {
    q: "A firewall can be placed both inside and outside a network.",
    options: ["True", "False"],
    correct: 0,
    explanation: "True. Internal firewalls are used for segmentation.",
  },
  {
    q: "A Next-Generation Firewall has fewer features than a traditional firewall.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "NGFWs have significantly more features than traditional ones.",
  },
  {
    q: "A host-based firewall is a hardware device.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "Host-based firewalls are software applications installed on an OS.",
  },
  {
    q: "A switch operates at the Network layer (Layer 3).",
    options: ["True", "False"],
    correct: 1,
    explanation: "Standard switches operate at Layer 2 (Data Link).",
  },
  {
    q: "The China Telecom Data Center is located in Japan.",
    options: ["True", "False"],
    correct: 1,
    explanation: "It is located in China.",
  },
];
