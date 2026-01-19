export const meta = {
  title: "General Knowledge Quiz",
  category: "Science",
  description: "This quiz covers basic physics and biology.",
};

export const questions = [
  // First page - Find the Network ID, Broadcast ID, and First/Last Usable Host
  {
    q: "Find the Network ID, Broadcast ID, and First/Last Usable Host for Host IP: 10.0.20.5 with Mask: 255.0.0.0",
    options: [
      "Network ID: 10.0.0.0, Broadcast ID: 10.255.255.255, First Host: 10.0.0.1, Last Host: 10.255.255.254",
    ],
    correct: 0,
    explanation:
      "This is a Class A default mask (/8). The first octet is the network portion, and the remaining three are the host portion.",
  },
  {
    q: "Find the Network ID, Broadcast ID, and First/Last Usable Host for Host IP: 172.200.10.5 with Mask: 255.255.0.0",
    options: [
      "Network ID: 172.200.0.0, Broadcast ID: 172.200.255.255, First Host: 172.200.0.1, Last Host: 172.200.255.254",
    ],
    correct: 0,
    explanation:
      "This is a Class B default mask (/16). The first two octets represent the network.",
  },
  {
    q: "Find the Network ID, Broadcast ID, and First/Last Usable Host for Host IP: 192.168.20.73 with Mask: 255.255.255.240",
    options: [
      "Network ID: 192.168.20.64, Broadcast ID: 192.168.20.79, First Host: 192.168.20.65, Last Host: 192.168.20.78",
    ],
    correct: 0,
    explanation:
      "The mask 240 (/28) has a block size of 16. Multiples of 16 include 64 and 80. Since .73 falls between them, the network is .64.",
  },
  {
    q: "Find the Network ID, Broadcast ID, and First/Last Usable Host for Host IP: 192.168.2.33 with Mask: 255.255.255.248",
    options: [
      "Network ID: 192.168.2.32, Broadcast ID: 192.168.2.39, First Host: 192.168.2.33, Last Host: 192.168.2.38",
    ],
    correct: 0,
    explanation:
      "The mask 248 (/29) has a block size of 8. Multiples of 8 include 32 and 40. Since .33 falls in this range, the network is .32.",
  },
  {
    q: "Find the Network ID, Broadcast ID, and First/Last Usable Host for Host IP: 172.16.20.19 with Mask: 255.255.240.0",
    options: [
      "Network ID: 172.16.16.0, Broadcast ID: 172.16.31.255, First Host: 172.16.16.1, Last Host: 172.16.31.254",
    ],
    correct: 0,
    explanation:
      "The mask 240.0 (/20) has a block size of 16 in the third octet. Multiples are 0, 16, 32. Since the third octet is 20, the network starts at 16.0.",
  },

  // Second page
  // --- Section 1: Subnetting by Number of Subnets ---
  {
    q: "Subnet the following Network IP address: 192.168.10.0 into 5 Subnets.",
    options: ["New Subnet Mask: 255.255.255.224 (/27)"],
    correct: 0,
    explanation:
      "To get at least 5 subnets, we need to borrow 3 bits ($2^3 = 8$). Adding 3 bits to the default Class C mask (/24) gives /27.",
  },
  {
    q: "Subnet the following Network IP address: 10.0.0.0 into 5 Subnets.",
    options: ["New Subnet Mask: 255.224.0.0 (/11)"],
    correct: 0,
    explanation:
      "Borrowing 3 bits from the default Class A mask (/8) results in a /11 prefix.",
  },
  {
    q: "Subnet the following Network IP address: 172.16.0.0 into 5 Subnets.",
    options: ["New Subnet Mask: 255.255.224.0 (/19)"],
    correct: 0,
    explanation:
      "Borrowing 3 bits from the default Class B mask (/16) results in a /19 prefix.",
  },
  {
    q: "Subnet the following Network IP address: 192.168.1.0 into 4 Subnets.",
    options: ["New Subnet Mask: 255.255.255.192 (/26)"],
    correct: 0,
    explanation:
      "To get exactly 4 subnets, we borrow 2 bits ($2^2 = 4$). /24 + 2 = /26.",
  },
  {
    q: "Subnet the following Network IP address: 192.168.1.0 into 7 Subnets.",
    options: ["New Subnet Mask: 255.255.255.224 (/27)"],
    correct: 0,
    explanation:
      "To get 7 subnets, we must borrow 3 bits ($2^3 = 8$), resulting in /27.",
  },
  {
    q: "Subnet the following Network IP address: 192.0.2.50 into 5 Subnets.",
    options: ["New Subnet Mask: 255.255.255.224 (/27)"],
    correct: 0,
    explanation:
      "Assuming the base network is 192.0.2.0/24, borrowing 3 bits gives /27.",
  },
  {
    q: "Subnet the following Network IP address: 198.51.100.200 into 5 Subnets.",
    options: ["New Subnet Mask: 255.255.255.224 (/27)"],
    correct: 0,
    explanation:
      "Assuming the base network is 198.51.100.0/24, borrowing 3 bits gives /27.",
  },

  // --- Section 2: Subnetting by Number of Hosts ---
  {
    q: "Subnet the following Network IP address for hosts: 216.21.5.0 into 30 Hosts.",
    options: ["New Subnet Mask: 255.255.255.224 (/27)"],
    correct: 0,
    explanation:
      "For 30 hosts, we need 5 host bits ($2^5 - 2 = 30$). 32 - 5 = /27.",
  },
  {
    q: "Subnet the following Network IP address for hosts: 172.16.0.0 into 120 Hosts.",
    options: ["New Subnet Mask: 255.255.255.128 (/25)"],
    correct: 0,
    explanation:
      "For 120 hosts, we need 7 host bits ($2^7 - 2 = 126$). 32 - 7 = /25.",
  },
  {
    q: "Subnet the following Network IP address for hosts: 10.1.0.0 into 500 Hosts.",
    options: ["New Subnet Mask: 255.255.254.0 (/23)"],
    correct: 0,
    explanation:
      "For 500 hosts, we need 9 host bits ($2^9 - 2 = 510$). 32 - 9 = /23.",
  },
  {
    q: "Subnet the following Network IP address for hosts: 196.10.20.0 into 52 Hosts.",
    options: ["New Subnet Mask: 255.255.255.192 (/26)"],
    correct: 0,
    explanation:
      "For 52 hosts, we need 6 host bits ($2^6 - 2 = 62$). 32 - 6 = /26.",
  },
  {
    q: "Subnet the following Network IP address for hosts: 150.15.0.0 into 500 Hosts.",
    options: ["New Subnet Mask: 255.255.254.0 (/23)"],
    correct: 0,
    explanation:
      "For 500 hosts, we need 9 host bits ($2^9 - 2 = 510$). 32 - 9 = /23.",
  },
  {
    q: "Subnet the following Network IP address for hosts: 192.168.1.0 into 50 Hosts.",
    options: ["New Subnet Mask: 255.255.255.192 (/26)"],
    correct: 0,
    explanation:
      "For 50 hosts, we need 6 host bits ($2^6 - 2 = 62$). 32 - 6 = /26.",
  },
  {
    q: "Subnet the following Network IP address for hosts: 150.15.0.0 into 500 Hosts (Repeated).",
    options: ["New Subnet Mask: 255.255.254.0 (/23)"],
    correct: 0,
    explanation: "Duplicate of question 5.",
  },

  // Third Page
  // Part 1: Host IP into...
  {
    q: "Subnet 201.1.1.0 to accommodate 40 Hosts.",
    options: [
      "Network: 201.1.1.0/26, Subnet Mask: 255.255.255.192, Range: 201.1.1.1 - 201.1.1.62",
    ],
    correct: 0,
    explanation:
      "To support 40 hosts, we need 6 bits ($2^6 - 2 = 62$). This results in a /26 prefix.",
  },
  {
    q: "Subnet 170.15.0.0 to accommodate 1000 Hosts.",
    options: [
      "Network: 170.15.0.0/22, Subnet Mask: 255.255.252.0, Range: 170.15.0.1 - 170.15.3.254",
    ],
    correct: 0,
    explanation:
      "To support 1000 hosts, we need 10 bits ($2^{10} - 2 = 1022$). This results in a /22 prefix.",
  },
  {
    q: "Subnet 15.0.0.0 to accommodate 100 Hosts.",
    options: [
      "Network: 15.0.0.0/25, Subnet Mask: 255.255.255.128, Range: 15.0.0.1 - 15.0.0.126",
    ],
    correct: 0,
    explanation:
      "To support 100 hosts, we need 7 bits ($2^7 - 2 = 126$). This results in a /25 prefix.",
  },
  {
    q: "Subnet 10.0.0.0 to accommodate 100 Hosts.",
    options: [
      "Network: 10.0.0.0/25, Subnet Mask: 255.255.255.128, Range: 10.0.0.1 - 10.0.0.126",
    ],
    correct: 0,
    explanation:
      "Similar to the previous question, 100 hosts requires 7 bits, resulting in a /25 prefix.",
  },
  // Part 2: Network Details
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 192.168.20.73 /28",
    options: [
      "Net ID: 192.168.20.64, Broadcast: 192.168.20.79, First: 192.168.20.65, Last: 192.168.20.78",
    ],
    correct: 0,
    explanation:
      "/28 has an increment of 16. The multiple of 16 before 73 is 64.",
  },
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 172.16.5.34 /26",
    options: [
      "Net ID: 172.16.5.0, Broadcast: 172.16.5.63, First: 172.16.5.1, Last: 172.16.5.62",
    ],
    correct: 0,
    explanation:
      "/26 has an increment of 64. The multiple of 64 before 34 is 0.",
  },
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 172.20.45.200 /20",
    options: [
      "Net ID: 172.20.32.0, Broadcast: 172.20.47.255, First: 172.20.32.1, Last: 172.20.47.254",
    ],
    correct: 0,
    explanation:
      "/20 has an increment of 16 in the 3rd octet. Multiples: 0, 16, 32, 48. 45 falls in the 32 block.",
  },
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 203.0.113.197 /26",
    options: [
      "Net ID: 203.0.113.192, Broadcast: 203.0.113.255, First: 203.0.113.193, Last: 203.0.113.254",
    ],
    correct: 0,
    explanation:
      "/26 has an increment of 64. Multiples: 0, 64, 128, 192. 197 falls in the 192 block.",
  },
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 172.16.5.130 /16",
    options: [
      "Net ID: 172.16.0.0, Broadcast: 172.16.255.255, First: 172.16.0.1, Last: 172.16.255.254",
    ],
    correct: 0,
    explanation:
      "/16 is a Class B boundary. The first two octets stay the same, the rest are host bits.",
  },
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 10.15.20.30 /8",
    options: [
      "Net ID: 10.0.0.0, Broadcast: 10.255.255.255, First: 10.0.0.1, Last: 10.255.255.254",
    ],
    correct: 0,
    explanation:
      "/8 is a Class A boundary. Only the first octet is the network portion.",
  },
  {
    q: "Find the Network ID, Broadcast, First Host, and Last Host for: 192.168.1.100 /24",
    options: [
      "Net ID: 192.168.1.0, Broadcast: 192.168.1.255, First: 192.168.1.1, Last: 192.168.1.254",
    ],
    correct: 0,
    explanation:
      "/24 is a Class C boundary. The first three octets stay the same.",
  },
];
