export const questions = [
  {
    q: "What is a common disadvantage of networking in terms of costs?",
    options: [
      "Reduced efficiency",
      "Increased security",
      "Higher initial setup expenses",
      "Simplified data management",
    ],
    correct: 2,
    explanation:
      "Setting up a network requires significant upfront investment in hardware (routers, switches, cabling) and labor.",
  },
  {
    q: "Which of the following is a fundamental network classification based on geographical area coverage?",
    options: [
      "Intranet",
      "LAN (Local Area Network)",
      "PAN (Personal Area Network)",
      "WAN (Wide Area Network)",
    ],
    correct: 1,
    explanation:
      "While PAN and WAN are also geographical classifications, LAN is the most fundamental classification for local area coverage.",
  },
  {
    q: "What is the primary function of a server computer in a network?",
    options: [
      "It requests services from client computers",
      "It provides resources and services to client computers",
      "It stores only personal files",
      "It serves as a standalone workstation",
    ],
    correct: 1,
    explanation:
      "In a client-server model, the server's role is to serve requests and provide resources to the clients.",
  },
  {
    q: "Which network topology connects each device to a single, central point?",
    options: ["Mesh", "Ring", "Bus", "Star"],
    correct: 3,
    explanation:
      "In a Star topology, all nodes are connected to a central hub or switch.",
  },
  {
    q: "Which OSI layer is responsible for translating data between formats used by different networking devices?",
    options: [
      "Physical Layer",
      "Data Link Layer",
      "Presentation Layer",
      "Transport Layer",
    ],
    correct: 2,
    explanation:
      "The Presentation Layer (Layer 6) handles data encryption, compression, and translation.",
  },
  {
    q: "At which OSI layer does routing and forwarding of packets occur?",
    options: [
      "Network Layer",
      "Transport Layer",
      "Session Layer",
      "Data Link Layer",
    ],
    correct: 0,
    explanation:
      "The Network Layer (Layer 3) is responsible for logical addressing and routing packets.",
  },
  {
    q: "Which OSI layer establishes, manages, and terminates connections between applications?",
    options: [
      "Transport Layer",
      "Presentation Layer",
      "Session Layer",
      "Application Layer",
    ],
    correct: 2,
    explanation:
      "The Session Layer (Layer 5) manages the dialogues (sessions) between computers.",
  },
  {
    q: "At which OSI layer do switches operate to forward frames based on MAC addresses?",
    options: [
      "Network Layer",
      "Transport Layer",
      "Data Link Layer",
      "Physical Layer",
    ],
    correct: 2,
    explanation: "Layer 2 switches use MAC addresses to forward data frames.",
  },
  {
    q: "Which Application Layer protocol is primarily used for transferring web pages and related files over the Internet?",
    options: ["DNS", "FTP", "HTTP", "SMTP"],
    correct: 2,
    explanation:
      "HTTP (Hypertext Transfer Protocol) is the foundation of data communication for the World Wide Web.",
  },
  {
    q: "Which protocol translates domain names into IP addresses to locate resources on the Internet?",
    options: ["HTTP", "DNS", "FTP", "DHCP"],
    correct: 1,
    explanation:
      "DNS (Domain Name System) acts like a phonebook for the internet.",
  },
  {
    q: "What protocol is commonly used for transferring files between a client and a server over a network?",
    options: ["DHCP", "FTP", "SMTP", "HTTP"],
    correct: 1,
    explanation: "FTP stands for File Transfer Protocol.",
  },
  {
    q: "Which protocol dynamically assigns IP addresses to network devices?",
    options: ["DHCP", "FTP", "SMTP", "HTTP"],
    correct: 0,
    explanation:
      "DHCP (Dynamic Host Configuration Protocol) automates the assignment of IP addresses.",
  },
  {
    q: "Which protocol is used for sending email messages between servers?",
    options: ["SMTP", "DNS", "FTP", "HTTP"],
    correct: 0,
    explanation:
      "SMTP (Simple Mail Transfer Protocol) is used for sending/pushing mail.",
  },
  {
    q: "Which command is used to display the IP configuration details of a Windows computer?",
    options: ["ipconfig", "nslookup", "netstat", "tracert"],
    correct: 0,
    explanation:
      "The ipconfig command displays all current TCP/IP network configuration values.",
  },
  {
    q: "What does the 'ipconfig /renew' command do in Windows?",
    options: [
      "It releases the IP address",
      "It renews the lease of the IP address from the DHCP server",
      "It registers the DNS records",
      "It displays the routing table",
    ],
    correct: 1,
    explanation:
      "The /renew switch sends a request to the DHCP server to update the current IP lease.",
  },
  {
    q: "Which command provides information about active TCP connections, listening ports, and other network statistics on a Windows system?",
    options: ["ipconfig", "nslookup", "tracert", "netstat"],
    correct: 3,
    explanation:
      "Netstat (network statistics) displays incoming and outgoing network connections.",
  },
  {
    q: "Which IP address class ranges from 1.0.0.0 to 126.255.255.255?",
    options: ["Class A", "Class B", "Class C", "Class D"],
    correct: 0,
    explanation:
      "Class A addresses use the first octet for the network ID (1-126).",
  },
  {
    q: "What is the maximum number of hosts per subnet with a subnet mask of 255.255.255.224?",
    options: ["14", "30", "62", "Non"],
    correct: 1,
    explanation:
      "224 in the last octet leaves 5 bits for hosts (2^5 = 32). Subtracting 2 for network and broadcast gives 30.",
  },
  {
    q: "What is the default subnet mask for a Class C network?",
    options: ["255.255.255.0", "255.0.0.0", "255.255.0.0", "255.255.255.255"],
    correct: 0,
    explanation:
      "Class C uses 24 bits for the network, represented as 255.255.255.0.",
  },
  {
    q: "Which of the following is an invalid IP address?",
    options: ["192.168.1.256", "172.16.254.1", "10.0.0.1", "255.255.255.255"],
    correct: 0,
    explanation:
      "Each octet in an IP address must be between 0 and 255. 256 is out of range.",
  },
  {
    q: "Which IP address is commonly utilized for loop-back testing and refers to the local host?",
    options: ["0.0.0.0", "127.0.0.0", "255.255.255.255", "192.168.1.1"],
    correct: 1,
    explanation:
      "The 127.x.x.x range is reserved for loopback; 127.0.0.1 is most commonly used.",
  },
  {
    q: "Why is 255.255.255.255 considered an invalid IP address for a host?",
    options: [
      "It belongs to Class E",
      "It represents a network address",
      "It is a reserved broadcast address",
      "It falls within the private address range",
    ],
    correct: 2,
    explanation:
      "255.255.255.255 is the limited broadcast address for the current network.",
  },
  {
    q: "Which IP address range cannot be used as part of a public IP address due to its private designation?",
    options: [
      "10.0.0.0 to 10.255.255.255",
      "127.0.0.0 to 127.255.255.255",
      "172.16.0.0 to 172.31.255.255",
      "192.168.0.0 to 192.168.255.255",
    ],
    correct: 0,
    explanation:
      "All options listed are actually non-public, but 10.x.x.x is a primary RFC 1918 private range.",
  },
  {
    q: "Which networking device operates at both the Physical Layer (Layer 1) and the Data Link Layer (Layer 2) of the OSI model?",
    options: ["Router", "Switch", "Repeater", "Hub"],
    correct: 1,
    explanation:
      "Standard switches work at Layer 2 to handle frames, but involve Layer 1 for physical connectivity.",
  },
  {
    q: "In a TCP/IP network, what is the purpose of subnetting?",
    options: [
      "To establish a secure connection between two remote networks",
      "To divide a large network into smaller, more manageable segments",
      "To dynamically assign IP addresses to network devices",
      "To facilitate communication between devices within the same LAN",
    ],
    correct: 1,
    explanation:
      "Subnetting improves network performance and security by localizing traffic.",
  },
];
