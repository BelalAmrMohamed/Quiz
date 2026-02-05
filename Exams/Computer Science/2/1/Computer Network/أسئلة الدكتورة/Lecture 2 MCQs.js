export const questions = [
  {
    q: "What is the primary function of a switch in a network?",
    options: [
      "To route data between different networks",
      "To filter and forward packets within the same network",
      "To provide security by blocking unauthorized access",
      "To connect end devices to the internet",
    ],
    correct: 1,
    explanation:
      "Switches primarily filter and forward packets within the same network [1].",
  },
  {
    q: "Which device is primarily responsible for directing data packets between different networks?",
    options: ["Switch", "Hub", "Router", "Firewall"],
    correct: 2,
    explanation: "Routers direct data packets between separate networks [1].",
  },
  {
    q: "What is the main purpose of a firewall in a network?",
    options: [
      "To increase the speed of data transmission",
      "To connect multiple devices within a local area network",
      "To monitor and control incoming and outgoing network traffic",
      "To store data for backup purposes",
    ],
    correct: 2,
    explanation:
      "A firewall's main purpose is to monitor and control network traffic [1, 2].",
  },
  {
    q: "Which of the following statements is true about routers?",
    options: [
      "They operate only at the physical layer of the OSI model.",
      "They can connect different types of networks.",
      "They are used to connect devices within the same local area network.",
      "They do not perform any filtering of data packets.",
    ],
    correct: 1,
    explanation:
      "Routers are capable of connecting different types of networks [2].",
  },
  {
    q: "In a network, what role does a client typically play?",
    options: [
      "It provides resources and services to other devices.",
      "It requests services and resources from servers.",
      "It routes data between different networks.",
      "It secures the network from unauthorized access.",
    ],
    correct: 1,
    explanation:
      "A client requests services and resources from servers [2, 3].",
  },
  {
    q: "Which of the following is NOT a function of a switch?",
    options: [
      "Learning MAC addresses",
      "Forwarding frames based on MAC addresses",
      "Routing packets between different networks",
      "Creating a separate collision domain for each port",
    ],
    correct: 2,
    explanation:
      "Routing packets between different networks is a router function, not a switch function [3].",
  },
  {
    q: "What type of network device can be used to create a barrier between a trusted internal network and untrusted external networks?",
    options: ["Switch", "Router", "Firewall", "Hub"],
    correct: 2,
    explanation:
      "Firewalls create a barrier between trusted and untrusted networks [3, 4].",
  },
  {
    q: "Which layer of the OSI model do switches primarily operate at?",
    options: [
      "Application layer",
      "Transport layer",
      "Network layer",
      "Data link layer",
    ],
    correct: 3,
    explanation: "Switches primarily operate at the Data link layer [4].",
  },
  {
    q: "What is the main difference between a hub and a switch?",
    options: [
      "A hub can filter traffic, while a switch cannot.",
      "A switch can connect to multiple networks, while a hub cannot.",
      "A switch sends data only to the intended recipient, while a hub broadcasts to all ports.",
      "A hub operates at the network layer, while a switch operates at the data link layer.",
    ],
    correct: 2,
    explanation:
      "A switch sends data specifically to the intended recipient, unlike a hub which broadcasts to all ports [4, 5].",
  },
  {
    q: "Which of the following devices is essential for connecting a local area network (LAN) to the internet?",
    options: ["Switch", "Router", "Firewall", "Repeater"],
    correct: 1,
    explanation:
      "A router is essential for connecting a LAN to the internet [5].",
  },
  {
    q: "Which of the following best describes a switch's operation?",
    options: [
      "It operates at the application layer and manages user requests.",
      "It uses IP addresses to forward data packets.",
      "It creates a dedicated path for data between devices.",
      "It broadcasts data to all connected devices.",
    ],
    correct: 2,
    explanation:
      "A switch creates a dedicated path for data between devices [5].",
  },
  {
    q: "Firewalls can be categorized into which of the following types?",
    options: [
      "Hardware and software firewalls",
      "Static and dynamic firewalls",
      "Open and closed firewalls",
      "Local and remote firewalls",
    ],
    correct: 0,
    explanation:
      "Firewalls are categorized into hardware and software types [6].",
  },
  {
    q: "What is a common feature of managed switches compared to unmanaged switches?",
    options: [
      "They are less expensive.",
      "They provide advanced configuration options.",
      "They do not require power.",
      "They have fewer ports.",
    ],
    correct: 1,
    explanation: "Managed switches provide advanced configuration options [6].",
  },
  {
    q: "What type of network topology is commonly used with switches?",
    options: [
      "Star topology",
      "Ring topology",
      "Bus topology",
      "Mesh topology",
    ],
    correct: 0,
    explanation: "Star topology is commonly used with switches [6, 7].",
  },
  {
    q: "Which of the following statements about firewalls is true?",
    options: [
      "Firewalls can only be hardware-based.",
      "Firewalls do not require configuration.",
      "Firewalls can be used to create a DMZ (Demilitarized Zone).",
      "Firewalls are only necessary for large networks.",
    ],
    correct: 2,
    explanation:
      "Firewalls can be used to create a Demilitarized Zone (DMZ) [7].",
  },
  {
    q: "What is the primary function of a network interface card (NIC)?",
    options: [
      "To connect a computer to a network",
      "To manage network traffic",
      "To provide wireless connectivity",
      "To store network configurations",
    ],
    correct: 0,
    explanation:
      "The NIC's function is to connect a computer to a network [7, 8].",
  },
];
