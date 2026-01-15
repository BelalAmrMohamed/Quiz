export const questions = [
  {
    q: "Every computer or device on a network must have an IP address for what purpose?",
    options: ["Communication", "Electricity", "Storage", "Naming"],
    correct: 0,
    explanation: "Devices need an IP address for communication purposes [1].",
  },
  {
    q: "What is a 'Static IP'?",
    options: [
      "An IP assigned automatically by a server",
      "An IP assigned manually by a user",
      "An IP that changes every hour",
      "A temporary IP for guests",
    ],
    correct: 1,
    explanation:
      "A static IP is where a user assigns a device an IP address manually [1].",
  },
  {
    q: "True or False: Manual assignment was the original method used in the beginning of networking.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Manual assignment (Static IP) was the original method used [1].",
  },
  {
    q: "What does DHCP stand for?",
    options: [
      "Dynamic Host Configuration Protocol",
      "Digital Host Connection Process",
      "Data Handling Control Protocol",
      "Dynamic Hardware Configuration Path",
    ],
    correct: 0,
    explanation: "DHCP stands for Dynamic Host Configuration Protocol [2].",
  },
  {
    q: "What is the primary function of DHCP?",
    options: [
      "To manually assign IPs",
      "To automatically assign IP addresses and network settings",
      "To block incoming internet traffic",
      "To translate private IPs to public IPs",
    ],
    correct: 1,
    explanation:
      "DHCP enables automatic assignment of IP addresses and other configuration settings [2].",
  },
  {
    q: "The DHCP process is explained using which acronym?",
    options: ["DORA", "NATO", "OSI", "IANA"],
    correct: 0,
    explanation: "The process of DHCP is explained using the acronym DORA [2].",
  },
  {
    q: "In the DORA process, what does the 'D' stand for?",
    options: ["Data", "Digital", "Discover", "Deliver"],
    correct: 2,
    explanation: "The first step is the Discover phase [2].",
  },
  {
    q: "During the 'Discover' phase, the client sends what type of message?",
    options: ["Unicast", "Multicast", "Broadcast", "Anycast"],
    correct: 2,
    explanation:
      "The client broadcasts a Discover message to find a server [3].",
  },
  {
    q: "In the DORA process, what does the 'O' stand for?",
    options: ["Open", "Offer", "Output", "Option"],
    correct: 1,
    explanation: "The second step is the Offer phase [2, 3].",
  },
  {
    q: "In the DORA process, what does the 'R' stand for?",
    options: ["Record", "Routing", "Request", "Response"],
    correct: 2,
    explanation: "The third step is the Request phase [2, 3].",
  },
  {
    q: "In the DORA process, what does the 'A' stand for?",
    options: ["Acknowledge", "Allocation", "Address", "Access"],
    correct: 0,
    explanation: "The final step is the Acknowledgment message [2, 3].",
  },
  {
    q: "What is a 'DHCP Scope'?",
    options: [
      "The hardware model of the DHCP server",
      "The range of IP addresses the server is allowed to assign",
      "The time it takes to assign an IP",
      "The list of blocked IP addresses",
    ],
    correct: 1,
    explanation:
      "DHCP Scope defines the range (From-To) of IP addresses to be assigned [4].",
  },
  {
    q: "What is an IP 'Lease'?",
    options: [
      "The cost of the IP address",
      "The amount of time an IP is assigned to a computer",
      "The distance the IP signal travels",
      "A permanent assignment of an IP",
    ],
    correct: 1,
    explanation:
      "A lease is the amount of time an IP address is assigned to a computer [5].",
  },
  {
    q: "What is a primary reason for using IP leases?",
    options: [
      "To charge users for connectivity",
      "To ensure the server does not run out of IP addresses",
      "To increase internet speed",
      "To hide the device from the internet",
    ],
    correct: 1,
    explanation:
      "Leases help make sure the DHCP server does not run out of IPs in its scope [5].",
  },
  {
    q: "What does NAT stand for?",
    options: [
      "Network Access Topology",
      "Node Address Timing",
      "Network Address Translation",
      "National Address Treatment",
    ],
    correct: 2,
    explanation: "NAT stands for Network Address Translation [6].",
  },
  {
    q: "Which type of NAT maps an unregistered (Private) IP to a registered (Public) IP on a 1:1 basis?",
    options: ["Dynamic NAT", "Static NAT", "PAT", "NAT Overload"],
    correct: 1,
    explanation:
      "Static NAT maps a Private IP to a Public IP on a one-to-one basis [6].",
  },
  {
    q: "Static NAT is particularly useful for which type of devices?",
    options: [
      "Home laptops",
      "Printers",
      "Web servers or hosts accessible from the Internet",
      "Mobile phones",
    ],
    correct: 2,
    explanation:
      "It is useful for hosts that must have a consistent address accessible from the Internet [6].",
  },
  {
    q: "How does Dynamic NAT assign public addresses?",
    options: [
      "Manually by the ISP",
      "Using a pool on a first-come, first-served basis",
      "Alphabetically by device name",
      "Based on the device's MAC address",
    ],
    correct: 1,
    explanation:
      "Dynamic NAT uses a pool of public addresses and assigns them first-come, first-served [6].",
  },
  {
    q: "What does PAT stand for?",
    options: [
      "Private Address Translation",
      "Port Address Translation",
      "Protocol Access Timing",
      "Public Address Treatment",
    ],
    correct: 1,
    explanation: "PAT stands for Port Address Translation [7].",
  },
  {
    q: "What is another common name for PAT?",
    options: ["NAT Underload", "NAT Overload", "NAT Pool", "Static NAT"],
    correct: 1,
    explanation: "PAT is sometimes called NAT overload [7].",
  },
  {
    q: "How does PAT allow multiple private IPs to use a single public IP?",
    options: [
      "By changing the MAC address",
      "By using different ports",
      "By slowing down the connection",
      "By using different cables",
    ],
    correct: 1,
    explanation:
      "PAT maps multiple private addresses to a single public IP by using different ports [7].",
  },
  {
    q: "Which device typically performs PAT?",
    options: ["A switch", "A home broadband router", "A printer", "A monitor"],
    correct: 1,
    explanation: "This is what most home broadband routers do [7].",
  },
  {
    q: "How does PAT add a degree of security to a session?",
    options: [
      "By encrypting all data",
      "By validating that incoming packets were requested",
      "By blocking the ISP",
      "By changing the IP every minute",
    ],
    correct: 1,
    explanation:
      "It validates that incoming packets were requested, adding security [7].",
  },
  {
    q: "What does APIPA stand for?",
    options: [
      "Automatic Private IP Addressing",
      "Assigned Protocol Internal Port Access",
      "Automatic Public Internet Protocol Allocation",
      "Advanced Private Interface Protocol Address",
    ],
    correct: 0,
    explanation: "APIPA stands for Automatic Private IP Addressing [8].",
  },
  {
    q: "When does a computer use APIPA?",
    options: [
      "When it connects to a web server",
      "When it cannot reach a DHCP server",
      "When it has a static IP",
      "When the internet is too fast",
    ],
    correct: 1,
    explanation:
      "APIPA occurs if the computer can't reach the DHCP server [8].",
  },
  {
    q: "What is the specific IP address range used by APIPA?",
    options: [
      "192.168.0.0 – 192.168.255.255",
      "10.0.0.0 – 10.255.255.255",
      "169.254.0.1 – 169.254.255.254",
      "127.0.0.0 – 127.255.255.255",
    ],
    correct: 2,
    explanation:
      "APIPA assigns an address in the 169.254.0.1 to 169.254.255.254 range [9].",
  },
  {
    q: "True or False: Computers with APIPA addresses can communicate with devices outside their own subnet.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "They can only communicate with each other on the same subnet [9].",
  },
  {
    q: "What happens if a computer using APIPA later detects a DHCP server?",
    options: [
      "It ignores the DHCP server",
      "It replaces the APIPA address with the DHCP address",
      "It crashes the network",
      "It keeps both addresses",
    ],
    correct: 1,
    explanation:
      "The computer will replace the self-assigned address with the one from the DHCP server [9].",
  },
  {
    q: "What does VPN stand for?",
    options: [
      "Virtual Private Network",
      "Verified Protocol Node",
      "Visual Private Network",
      "Virtual Port Number",
    ],
    correct: 0,
    explanation: "VPN stands for Virtual Private Network [9].",
  },
  {
    q: "What is the primary function of a VPN?",
    options: [
      "To assign IPs faster",
      "To establish a secure network connection over an unsecured network",
      "To increase the number of ports on a router",
      "To replace the need for an ISP",
    ],
    correct: 1,
    explanation:
      "A VPN establishes a secure and reliable connection over an unsecured network [9].",
  },
  {
    q: "Essay: Briefly explain the DORA process in DHCP.",
    options: [
      "DORA consists of Discover (client broadcasts to find server), Offer (server suggests IP), Request (client asks for IP), and Acknowledge (server confirms assignment).",
    ],
    correct: 0,
    explanation: "Source: [2, 3]",
  },
  {
    q: "Essay: Describe the difference between Static NAT and Dynamic NAT.",
    options: [
      "Static NAT uses a 1:1 permanent mapping between a private and public IP, while Dynamic NAT uses a pool of public IPs assigned on a first-come, first-served basis.",
    ],
    correct: 0,
    explanation: "Source: [6]",
  },
  {
    q: "True or False: DHCP can assign other network settings besides the IP address.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "DHCP enables assignment of IP addresses and other network configuration settings [2].",
  },
  {
    q: "True or False: In PAT, the router uses source port numbers to distinguish between different client sessions.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "PAT uses unique source port numbers to distinguish between translations [7].",
  },
  {
    q: "In Dynamic NAT, what happens when there are more hosts than available public IP addresses in the pool?",
    options: [
      "The router crashes",
      "Hosts must wait until an IP is not in use by another host",
      "It automatically switches to Static NAT",
      "It uses APIPA",
    ],
    correct: 1,
    explanation:
      "It chooses an address not already in use; it is useful when fewer addresses are available than hosts [6].",
  },
  {
    q: "How often does a computer with an APIPA address check for a DHCP server?",
    options: ["Every second", "Every few minutes", "Once a day", "Never"],
    correct: 1,
    explanation:
      "Every few minutes the computers will check to see if they can contact a DHCP server [9].",
  },
  {
    q: "True or False: An IP lease could be set for one day.",
    options: ["True", "False"],
    correct: 0,
    explanation: "For example, the lease could be for one day [5].",
  },
  {
    q: "Which type of NAT is best for a home with multiple devices and only one ISP-provided public IP?",
    options: ["Static NAT", "Dynamic NAT", "PAT (NAT Overload)", "APIPA"],
    correct: 2,
    explanation:
      "PAT maps multiple private IPs to a single public IP, which is what home routers do [7].",
  },
  {
    q: "The term 'Inside Global IP address' is associated with which protocol?",
    options: ["DHCP", "APIPA", "PAT", "VPN"],
    correct: 2,
    explanation:
      "PAT uses unique source port numbers on the inside global IP address [7].",
  },
  {
    q: "Essay: Why is the DHCP lease mechanism important for network management?",
    options: [
      "It prevents the server from running out of addresses by reclaiming IPs that are no longer in use after the lease time expires.",
    ],
    correct: 0,
    explanation: "Source: [5]",
  },
];
