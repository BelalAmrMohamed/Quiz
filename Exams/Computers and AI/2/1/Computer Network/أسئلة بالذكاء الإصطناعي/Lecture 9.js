export const questions = [
  {
    q: "In which layer of the networking model are TCP and UDP found?",
    options: [
      "Physical Layer",
      "Data Link Layer",
      "Network Layer",
      "Transport Layer",
    ],
    correct: 3,
    explanation:
      "TCP and UDP are two key components in the Transport Layer [1].",
  },
  {
    q: "What does TCP stand for?",
    options: [
      "Transmission Control Protocol",
      "Terminal Connection Process",
      "Timing Communication Protocol",
      "Transport Control Packet",
    ],
    correct: 0,
    explanation: "TCP stands for Transmission Control Protocol [2].",
  },
  {
    q: "What does UDP stand for?",
    options: [
      "User Discovery Protocol",
      "Universal Data Packet",
      "User Datagram Protocol",
      "Unified Data Protocol",
    ],
    correct: 2,
    explanation: "UDP stands for User Datagram Protocol [3].",
  },
  {
    q: "Which protocol is connection-based and ensures reliability?",
    options: ["UDP", "TCP", "IP", "ICMP"],
    correct: 1,
    explanation:
      "TCP is a connection-based protocol that ensures reliable data exchange [1].",
  },
  {
    q: "Which protocol is connectionless and prioritizes speed?",
    options: ["TCP", "UDP", "HTTP", "SNMP"],
    correct: 1,
    explanation:
      "UDP is a connectionless protocol that prioritizes speed and efficiency [1, 2].",
  },
  {
    q: "True or False: TCP is generally faster than UDP.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "TCP is described as a slow communication protocol compared to UDP [2].",
  },
  {
    q: "Why is TCP considered more reliable than UDP?",
    options: [
      "It uses faster cables",
      "It includes features like sequencing, flow control, and error checking",
      "It never sends data over the internet",
      "It only works with fiber optic cables",
    ],
    correct: 1,
    explanation:
      "TCP is more reliable due to features such as sequencing, flow control, and error checking [2].",
  },
  {
    q: "What happens in TCP when a server receives a packet of information?",
    options: [
      "It deletes the packet immediately",
      "It provides a confirmation of that packet's reception to the sender",
      "It sends the packet to a different server",
      "It ignores the packet until all other packets arrive",
    ],
    correct: 1,
    explanation:
      "When a server receives a packet, it provides a confirmation of reception to the sender [3].",
  },
  {
    q: "In TCP, when does the sender transmit the second packet of information?",
    options: [
      "Immediately after the first one",
      "When it receives confirmation for the first packet from the server",
      "After a fixed timer of 10 seconds",
      "Only if the first packet was lost",
    ],
    correct: 1,
    explanation:
      "When the sender receives confirmation from the server for the first packet, it sends the second one [3].",
  },
  {
    q: "Which protocol is best suited for instant messaging apps like WhatsApp?",
    options: ["UDP", "TCP", "APIPA", "NAT"],
    correct: 1,
    explanation:
      "TCP is used in text communication like WhatsApp because missing parts are not tolerated [2].",
  },
  {
    q: "Which protocol is used for time-sensitive tasks like online gaming?",
    options: ["TCP", "UDP", "FTP", "SMTP"],
    correct: 1,
    explanation:
      "UDP is a communication protocol for time-sensitive tasks like online gaming [3].",
  },
  {
    q: "True or False: UDP accepts occasional packet loss.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "UDP prioritizes speed and efficiency, accepting occasional packet loss [2].",
  },
  {
    q: "Does TCP always send data parts in chronological order?",
    options: [
      "Yes, always",
      "No, they can be mixed up, but the receiver reassembles them",
      "It only sends data in reverse order",
      "It only sends one packet at a time manually",
    ],
    correct: 1,
    explanation:
      "TCP doesn't always send parts chronologically; they can be mixed up [3].",
  },
  {
    q: "Which protocol prioritizes data integrity over speed?",
    options: ["UDP", "TCP"],
    correct: 1,
    explanation:
      "TCP is crucial for applications prioritizing data integrity [1].",
  },
  {
    q: "What is a major feature of TCP that ensures the server received the data?",
    options: [
      "Occasional packet loss",
      "Every received packet is confirmed by the server",
      "High speed",
      "Connectionless state",
    ],
    correct: 1,
    explanation:
      "Every received packet of information in TCP is confirmed by the server [2].",
  },
  {
    q: "Which of the following is an example of a UDP application?",
    options: ["Email", "Media streaming", "WhatsApp text", "File transfer"],
    correct: 1,
    explanation:
      "UDP is used for time-sensitive tasks like media streaming [3].",
  },
  {
    q: "True or False: In TCP, it is impossible for information to go missing because of confirmation features.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Because every packet is confirmed, it is considered impossible for information to go missing in TCP [2].",
  },
  {
    q: "Which protocol is described as 'connectionless'?",
    options: ["TCP", "UDP"],
    correct: 1,
    explanation: "UDP is a connectionless protocol [2].",
  },
  {
    q: "Which protocol is described as 'connection-based'?",
    options: ["TCP", "UDP"],
    correct: 0,
    explanation: "TCP is a connection-based protocol [1].",
  },
  {
    q: "TCP sequencing helps the receiver to:",
    options: [
      "Increase internet speed",
      "Reassemble mixed-up packets",
      "Delete duplicate emails",
      "Encrypt the data",
    ],
    correct: 1,
    explanation:
      "Sequencing is a feature that allows the receiver to handle parts that are not sent chronologically [2, 3].",
  },
  {
    q: "True or False: UDP provides flow control.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "Flow control is specifically listed as a feature of TCP reliability [2].",
  },
  {
    q: "Choosing the right protocol (TCP or UDP) influences which of the following?",
    options: [
      "Performance",
      "Data integrity",
      "User experience",
      "All of the above",
    ],
    correct: 3,
    explanation:
      "Choosing the right protocol influences performance, data integrity, and user experience [1].",
  },
  {
    q: "TCP is a standard that enables application programs to exchange ________ over a network.",
    options: ["Hardware", "Electricity", "Messages", "Cables"],
    correct: 2,
    explanation:
      "TCP enables application programs and computing devices to exchange messages [2].",
  },
  {
    q: "If occasional packet loss is acceptable for the sake of efficiency, which protocol should be used?",
    options: ["TCP", "UDP"],
    correct: 1,
    explanation:
      "UDP accepts occasional packet loss to prioritize speed and efficiency [2].",
  },
  {
    q: "In text communication, why is TCP preferred over UDP?",
    options: [
      "It is faster",
      "Any discrepancy or missing part is not tolerated",
      "It uses fewer bits",
      "It is newer",
    ],
    correct: 1,
    explanation:
      "In text apps, discrepancies are not tolerated, hence TCP is used to receive the full message without parts missing [2].",
  },
  {
    q: "Essay: Define the primary difference between TCP and UDP as stated in Lecture 9.",
    options: [
      "TCP is connection-based and reliable (ensuring data integrity), while UDP is connectionless and prioritizes speed/efficiency (accepting packet loss).",
    ],
    correct: 0,
    explanation: "Source: [1, 2]",
  },
  {
    q: "Which protocol is more likely to be used for a VOIP (Voice over IP) call?",
    options: ["TCP", "UDP"],
    correct: 1,
    explanation:
      "VOIP is time-sensitive, similar to online gaming and streaming, making it a candidate for UDP [3].",
  },
  {
    q: "True or False: TCP and UDP both operate at the Network Layer.",
    options: ["False", "True"],
    correct: 0,
    explanation: "They are two key components in the Transport Layer [1].",
  },
  {
    q: "What is 'error checking' in the context of TCP?",
    options: [
      "A way to speed up the network",
      "A feature that contributes to reliability",
      "A process that deletes random packets",
      "A tool for counting hop counts",
    ],
    correct: 1,
    explanation:
      "TCP is more reliable due to features such as sequencing, flow control, and error checking [2].",
  },
  {
    q: "True or False: UDP is used for applications where data integrity is the top priority.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "TCP is crucial for applications prioritizing data integrity [1].",
  },
  {
    q: "How many protocols are identified as 'key components' of the Transport Layer in this lecture?",
    options: ["1", "2", "3", "4"],
    correct: 1,
    explanation:
      "TCP and UDP are identified as two key components in the Transport Layer [1].",
  },
  {
    q: "In the TCP exchange process, what 'goes on and on' until completion?",
    options: [
      "The server resetting",
      "Sending a packet and receiving a confirmation",
      "Increasing the CIDR notation",
      "The DHCP DORA process",
    ],
    correct: 1,
    explanation:
      "The process of sending a packet and receiving confirmation continues until all packets are delivered successfully [3].",
  },
  {
    q: "True or False: User Datagram Protocol is a Communication standard.",
    options: ["True", "False"],
    correct: 0,
    explanation: "UDP is described as a communication protocol [3].",
  },
  {
    q: "Which protocol would you choose for a large file download where every bit must be correct?",
    options: ["TCP", "UDP"],
    correct: 0,
    explanation:
      "TCP ensures reliability and that no information goes missing, making it ideal for data integrity [2].",
  },
  {
    q: "True or False: UDP is connection-based.",
    options: ["False", "True"],
    correct: 0,
    explanation: "UDP is a connectionless protocol [2].",
  },
  {
    q: "Essay: List three features of TCP that make it reliable.",
    options: ["Sequencing, flow control, and error checking."],
    correct: 0,
    explanation: "Source: [2]",
  },
  {
    q: "In the context of the lecture, what does 'tolerated' refer to?",
    options: [
      "How much speed a user can stand",
      "Whether discrepancies in text messages are allowed",
      "The number of subnets",
      "The length of a cable",
    ],
    correct: 1,
    explanation:
      "The lecture states discrepancies in texting aren't tolerated, so TCP is used [2].",
  },
  {
    q: "True or False: Media streaming uses TCP because speed is not important.",
    options: ["False", "True"],
    correct: 0,
    explanation:
      "Media streaming uses UDP because it is a time-sensitive task [3].",
  },
  {
    q: "What is the result of the TCP confirmation process?",
    options: [
      "Packet loss",
      "Seamless data exchange and reliability",
      "Network congestion",
      "Automatic IP allocation",
    ],
    correct: 1,
    explanation:
      "Reliability is achieved because every received packet is confirmed [2].",
  },
  {
    q: "Essay: Why is UDP called 'connectionless'?",
    options: [
      "It does not establish a formal connection or confirm the reception of every packet, prioritizing speed instead.",
    ],
    correct: 0,
    explanation: "Source: [1, 2]",
  },
];
