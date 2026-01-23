export const questions = [
  {
    q: "What is the primary function of a subnet mask?",
    options: [
      "To identify the host and network portions of an IP address",
      "To assign a hardware address to a NIC",
      "To encrypt data packets",
      "To route data between different continents",
    ],
    correct: 0,
    explanation:
      "A subnet mask specifies which parts of an IP address represent the host and network portions.",
  },
  {
    q: "How many bits are in an IPv4 subnet mask?",
    options: ["8 bits", "16 bits", "32 bits", "128 bits"],
    correct: 2,
    explanation: "Subnet masks are 32 bits in IPv4 networks.",
  },
  {
    q: "In a binary subnet mask, what do 'ones' represent?",
    options: ["Host bits", "Network bits", "Broadcast bits", "Loopback bits"],
    correct: 1,
    explanation:
      "Network bits are represented by ones in a binary format subnet mask.",
  },
  {
    q: "In a binary subnet mask, what do 'zeros' represent?",
    options: [
      "Host bits",
      "Network bits",
      "Reserved bits",
      "Experimental bits",
    ],
    correct: 0,
    explanation:
      "Host bits are represented by zeros in a binary format subnet mask.",
  },
  {
    q: "What does an octet value of 255 in a subnet mask indicate?",
    options: [
      "The value can be anything",
      "The value of that octet must be identical",
      "The octet belongs to the host portion",
      "The address is a Class D multicast",
    ],
    correct: 1,
    explanation:
      "255 means that the value of that octet must be identical for devices on the same network.",
  },
  {
    q: "What does an octet value of 0 in a subnet mask (like 255.255.255.0) indicate?",
    options: [
      "The network portion",
      "The broadcast ID",
      "The value can be anything (host portion)",
      "The address is invalid",
    ],
    correct: 2,
    explanation:
      "A 0 means that the value can be anything, representing the host portion.",
  },
  {
    q: "What does CIDR stand for?",
    options: [
      "Computer Internal Data Routing",
      "Classless Inter-Domain Routing",
      "Centralized Internet Data Registry",
      "Connected Interface Data Router",
    ],
    correct: 1,
    explanation: "CIDR stands for Classless Inter-Domain Routing.",
  },
  {
    q: "How is a CIDR notation represented?",
    options: [
      "IP address followed by a colon and port",
      "IP address followed by a slash and suffix of bits",
      "Binary string of 32 characters",
      "Hexadecimal string",
    ],
    correct: 1,
    explanation:
      "CIDR is made up of the network address followed by a slash and a suffix declaring total network bits.",
  },
  {
    q: "What is the definition of Subnetting?",
    options: [
      "Combining multiple small networks into one large one",
      "Assigning public IPs to private devices",
      "Dividing one single network into multiple smaller networks",
      "Testing the internal path of TCP/IP",
    ],
    correct: 2,
    explanation:
      "Subnetting is the process where one single network is divided into multiple smaller networks called subnets.",
  },
  {
    q: "What is the IP range for Class A in the first octet?",
    options: ["0 – 127", "128 – 191", "192 – 223", "224 – 239"],
    correct: 0,
    explanation:
      "Class A range is defined as 0 – 127 (or 1-126 depending on excluding reserved).",
  },
  {
    q: "What is the default CIDR notation for a Class A network?",
    options: ["/8", "/16", "/24", "/32"],
    correct: 0,
    explanation:
      "Class A has a length of 8 bits for the network portion, noted as /8.",
  },
  {
    q: "What is the default CIDR notation for a Class B network?",
    options: ["/8", "/16", "/24", "/30"],
    correct: 1,
    explanation: "Class B default CIDR is /16.",
  },
  {
    q: "What is the default CIDR notation for a Class C network?",
    options: ["/8", "/16", "/24", "/28"],
    correct: 2,
    explanation: "Class C default CIDR is /24.",
  },
  {
    q: "What is the formula to calculate the number of subnets created?",
    options: [
      "2^n where n is host bits",
      "2^n where n is borrowed network bits",
      "2^n - 2",
      "Subnet mask - 256",
    ],
    correct: 1,
    explanation:
      "Number of subnets = 2^n, where you find n that satisfies network requirements.",
  },
  {
    q: "What is the formula to calculate the number of hosts per network?",
    options: ["2^n", "2^n - 2", "256 - n", "n^2"],
    correct: 1,
    explanation: "Number of Hosts = 2^(number of host bits) – 2.",
  },
  {
    q: "In Class C, if you need 4 subnets, how many bits must you borrow?",
    options: ["1 bit", "2 bits", "3 bits", "4 bits"],
    correct: 1,
    explanation: "To get 4 subnets, you need 2^2 = 4, so you borrow 2 bits.",
  },
  {
    q: "Borrowing 2 bits from a Class C (/24) default mask results in what new CIDR?",
    options: ["/22", "/24", "/26", "/28"],
    correct: 2,
    explanation: "Adding 2 borrowed bits to the default 24 results in /26.",
  },
  {
    q: "What is the decimal value of the last octet in a /26 mask?",
    options: ["128", "192", "224", "240"],
    correct: 1,
    explanation: "A /26 binary mask ends in 11000000, which is 192.",
  },
  {
    q: "What is the 'Subnet generator' or 'Hop count' for a /26 subnet?",
    options: ["32", "64", "128", "256"],
    correct: 1,
    explanation: "The hop count is 2^6 (remaining host bits) = 64.",
  },
  {
    q: "If the first network ID is 192.168.1.0 with a /26 mask, what is the second network ID?",
    options: ["192.168.1.32", "192.168.1.64", "192.168.1.1", "192.168.1.128"],
    correct: 1,
    explanation: "With a hop count of 64, the next network starts at .64.",
  },
  {
    q: "What is the broadcast ID for the network 192.168.1.0/26?",
    options: ["192.168.1.255", "192.168.1.64", "192.168.1.63", "192.168.1.1"],
    correct: 2,
    explanation:
      "The broadcast ID is one address before the next network ID (.64), which is .63.",
  },
  {
    q: "How many valid hosts are available in a /26 subnet?",
    options: ["64", "62", "30", "126"],
    correct: 1,
    explanation: "2^6 - 2 = 62 valid hosts.",
  },
  {
    q: "If you borrow 3 bits from a Class C network, how many subnets are created?",
    options: ["4", "6", "8", "16"],
    correct: 2,
    explanation: "2^3 = 8 subnets.",
  },
  {
    q: "A Class C network with 3 borrowed bits has what new CIDR?",
    options: ["/25", "/26", "/27", "/30"],
    correct: 2,
    explanation: "24 + 3 = /27.",
  },
  {
    q: "What is the decimal mask for a /27 CIDR?",
    options: [
      "255.255.255.192",
      "255.255.255.224",
      "255.255.255.240",
      "255.255.255.248",
    ],
    correct: 1,
    explanation: "A /27 mask ends in 11100000, which is 224.",
  },
  {
    q: "What is the hop count for a /27 subnet mask?",
    options: ["16", "32", "64", "128"],
    correct: 1,
    explanation: "Host bits remaining are 5; 2^5 = 32.",
  },
  {
    q: "Which step in the subnetting algorithm involves identifying the IP class?",
    options: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correct: 0,
    explanation: "Step 1 is to identify the class and the default subnet mask.",
  },
  {
    q: "What is the 'Subnet Generator' (SG) defined as in the algorithm?",
    options: [
      "The first 0 from left to right",
      "The first 1 encountered from right to left in binary mask",
      "The total number of hosts",
      "The CIDR prefix",
    ],
    correct: 1,
    explanation:
      "SG is the first 1 encountered from right to left in the binary subnet mask.",
  },
  {
    q: "To support 52 hosts in a Class C subnet, how many host bits are required?",
    options: ["4 bits", "5 bits", "6 bits", "7 bits"],
    correct: 2,
    explanation: "2^6 = 64 (which fits 52), whereas 2^5 = 32 (too small).",
  },
  {
    q: "Supporting 52 hosts in a Class C network requires which CIDR?",
    options: ["/24", "/25", "/26", "/27"],
    correct: 2,
    explanation: "6 host bits leaves 26 network bits (32 - 6 = 26).",
  },
  {
    q: "How many bits are needed to support 500 hosts per subnet?",
    options: ["7 bits", "8 bits", "9 bits", "10 bits"],
    correct: 2,
    explanation: "2^9 = 512, which covers 500 hosts.",
  },
  {
    q: "A Class B network (/16) modified to support 500 hosts results in which CIDR?",
    options: ["/23", "/24", "/25", "/26"],
    correct: 0,
    explanation: "32 total bits - 9 host bits = 23 network bits.",
  },
  {
    q: "What is the decimal subnet mask for a /23 CIDR?",
    options: ["255.255.255.0", "255.255.254.0", "255.255.252.0", "255.254.0.0"],
    correct: 1,
    explanation: "23 bits is 255.255.11111110.00000000, or 255.255.254.0.",
  },
  {
    q: "What is the hop count for a /23 mask?",
    options: ["1", "2", "4", "8"],
    correct: 1,
    explanation:
      "The last bit of the network portion is in the 2nd position of the 3rd octet; hop count is 2.",
  },
  {
    q: "What is the default subnet mask for a Class A IP address?",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "0.0.0.0"],
    correct: 0,
    explanation: "Class A default mask is 255.0.0.0 (/8).",
  },
  {
    q: "To support 100 hosts in a Class A subnet, how many host bits are needed?",
    options: ["6 bits", "7 bits", "8 bits", "10 bits"],
    correct: 1,
    explanation: "2^7 = 128, which covers 100 hosts.",
  },
  {
    q: "A Class A network modified for 100 hosts (/7 host bits) has which CIDR?",
    options: ["/8", "/24", "/25", "/26"],
    correct: 2,
    explanation: "32 - 7 = /25.",
  },
  {
    q: "What is the decimal mask for a /25 CIDR?",
    options: [
      "255.255.255.0",
      "255.255.255.128",
      "255.255.255.192",
      "255.255.255.224",
    ],
    correct: 1,
    explanation: "A /25 mask ends in 10000000, which is 128.",
  },
  {
    q: "What is the Network ID for the first subnet of 10.0.0.0/25?",
    options: ["10.0.0.0", "10.0.0.1", "10.0.0.128", "10.1.0.0"],
    correct: 0,
    explanation: "The first subnet always starts at the base network address.",
  },
  {
    q: "Essay: Describe the 3 main steps of the subnetting algorithm provided in the lecture.",
    options: [
      "1. Identify the class and default mask. 2. Convert default mask to binary. 3. Note the required hosts, find the Subnet Generator (SG), and determine the SG octet position.",
    ],
    correct: 0,
    explanation: "Refer to the Algorithm for Subnetting.",
  },
];
