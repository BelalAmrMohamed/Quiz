// Quiz on the Introduction to Operating Systems
export const questions = [
  {
    q: "What are the three main purposes of an operating system?",
    options: [
      "To provide a user environment, allocate resources, and act as a control program",
      "To increase hardware clock speed, manage word processing, and design graphics",
      "To eliminate the need for a CPU, provide physical storage, and cool the system",
      "To browse the web, send emails, and play video games",
    ],
    correct: 0,
    explanation:
      "The three main purposes include providing an **environment for users to execute programs**, **allocating resources** fairly and efficiently, and serving as a **control program** to manage I/O devices and prevent improper use.",
  },
  {
    q: "When is it appropriate for an operating system to 'waste' resources?",
    options: [
      "In a multi-user mainframe system to prioritize the administrator",
      "In single-user systems to optimize the user’s interaction, such as using a GUI",
      "When the system is running a real-time process that is ahead of schedule",
      "Never; an operating system must always maximize hardware efficiency",
    ],
    correct: 1,
    explanation:
      "**Single-user systems** may forsake efficiency to maximize the user's experience. For example, a **GUI** might waste CPU cycles but optimizes the user's interaction with the system.",
  },
  {
    q: "What is the primary difficulty a programmer face when writing an OS for a real-time environment?",
    options: [
      "Ensuring the user interface is colorful and interactive",
      "Keeping the operating system within fixed time constraints",
      "Making sure the system can run multiple web browsers simultaneously",
      "Allowing the user to bypass all security protocols",
    ],
    correct: 1,
    explanation:
      "The main difficulty is keeping the OS within the **fixed time constraints** of a real-time system. If tasks are not completed within a specific time frame, it can cause a **breakdown of the entire system**.",
  },
  {
    q: "Which of the following is an argument AGAINST embedding applications like web browsers in the OS?",
    options: [
      "Applications can take better advantage of kernel features",
      "Applications run faster when integrated into the kernel",
      "It leads to a bloated operating system and security vulnerabilities",
      "It makes the operating system easier to install",
    ],
    correct: 2,
    explanation:
      "Arguments against embedding applications include the fact that they are not part of an OS, integration leads to a **bloated system**, and performance benefits are offset by **security vulnerabilities**.",
  },
  {
    q: "How does the distinction between kernel mode and user mode provide protection?",
    options: [
      "By allowing the user to access all hardware instructions at any time",
      "By ensuring certain instructions can only be executed in kernel mode",
      "By making the computer run faster when in user mode",
      "By requiring a password every time a program starts",
    ],
    correct: 1,
    explanation:
      "Certain instructions and hardware device access are only permitted when the CPU is in **kernel mode**. This enforces protection of **critical resources** because the CPU has very limited capability in user mode.",
  },
  {
    q: "Which of the following instructions is typically 'privileged'?",
    options: [
      "Reading the clock",
      "Issuing a trap instruction",
      "Turning off interrupts",
      "Switching from kernel to user mode",
    ],
    correct: 2,
    explanation:
      "Operations such as **turning off interrupts**, setting the timer value, clearing memory, and accessing I/O devices need to be **privileged**.",
  },
  {
    q: "What was a difficulty of early systems that protected the OS by placing it in a fixed memory partition?",
    options: [
      "The OS became too fast for the hardware to keep up",
      "OS data like passwords would be accessible to unauthorized users in unprotected memory",
      "It prevented the use of a monitor or keyboard",
      "The system could only run one program per year",
    ],
    correct: 1,
    explanation:
      "If the OS is in a protected partition that it cannot modify, critical data like **passwords or access controls** would have to be stored in **unprotected memory**, making them accessible to unauthorized users.",
  },
  {
    q: "What is one possible use for a CPU that supports more than two modes of operation?",
    options: [
      "To allow the computer to use more than one type of electricity",
      "To provide a finer-grained security policy, such as different types of user modes",
      "To increase the physical number of cores in the processor",
      "To eliminate the need for an operating system entirely",
    ],
    correct: 1,
    explanation:
      "Multiple modes can provide **finer-grained security**. For example, a specific mode could allow **USB device drivers** to run without having to switch fully to kernel mode.",
  },
  {
    q: "How can timers be used to compute the current time?",
    options: [
      "By asking the user to input the time every hour",
      "By setting a timer to interrupt, incrementing a counter upon awakening, and repeating",
      "By measuring the physical temperature of the CPU",
      "Timers cannot be used to track time; they only stop processes",
    ],
    correct: 1,
    explanation:
      "A program can set a timer for the future, go to sleep, and increment a **local state counter** representing the number of interrupts received when awakened. This process is repeated continually to track time.",
  },
  {
    q: "What problem do caches solve in a computer system?",
    options: [
      "They eliminate the need for main memory",
      "They provide a buffer between components that perform transfers at differing speeds",
      "They permanently store data even when the power is turned off",
      "They prevent the CPU from becoming too hot during calculations",
    ],
    correct: 1,
    explanation:
      "Caches solve the transfer problem by providing a **buffer of intermediate speed** between two components exchanging data. If the fast device finds data in the cache, it doesn't have to wait for the slower device.",
  },
  {
    q: "What is a significant problem caused by the use of caches?",
    options: [
      "They make the system too heavy to carry",
      "Data in the cache must be kept consistent with data in the components",
      "Caches are always cheaper than the devices they cache",
      "Caches increase the amount of physical space needed for a motherboard",
    ],
    correct: 1,
    explanation:
      "Cache data must be kept **consistent**; if a component's data value changes, the cache must also be updated. This is a particular problem in **multiprocessor systems**.",
  },
  {
    q: "Why can't we simply make a cache as large as a disk and eliminate the disk?",
    options: [
      "Because the cache would be too fast for the CPU",
      "Because of affordability and the need for equivalent state-saving capacity",
      "Because the government regulates the size of caches",
      "Because it is physically impossible to make a cache larger than 1GB",
    ],
    correct: 1,
    explanation:
      "A component can only be eliminated by an equal-sized cache if the cache is **affordable** and has **equivalent state-saving capacity** (retaining data when power is removed).",
  },
  {
    q: "How does the client-server model differ from the peer-to-peer (P2P) model?",
    options: [
      "P2P has a central server that manages all clients",
      "Client-server distinguishes roles, while P2P considers all nodes as peers",
      "Client-server is only used for local networks, while P2P is for the Internet",
      "There is no difference between the two models",
    ],
    correct: 1,
    explanation:
      "The client-server model **firmly distinguishes roles**, where the client requests and the server provides. In **P2P**, all nodes are peers and can act as **both clients and servers**.",
  },
  {
    q: "In a P2P system sharing recipes, how does a node obtain a recipe?",
    options: [
      "It must wait for the central recipe server to broadcast it",
      "It requests the recipe from other peer nodes in the network",
      "It must generate the recipe itself using its own CPU",
      "It is impossible to share data in a P2P system",
    ],
    correct: 1,
    explanation:
      "In a P2P model, a peer node can **ask other peer nodes** for a specified recipe, and any node with that recipe can provide it to the requester.",
  },
  {
    q: "What is the OS's role as a resource allocator?",
    options: [
      "To prevent the CPU from running any user programs",
      "To manage all resources and decide between conflicting requests for fair use",
      "To provide a physical storage space for the user's files",
      "To act as a power supply for the hardware",
    ],
    correct: 1,
    explanation:
      "As a resource allocator, the OS **manages all resources** and decides how to resolve **conflicting requests** for efficient and fair use.",
  },
  {
    q: "Which definition of an operating system is generally referred to as the 'kernel'?",
    options: [
      "Everything a vendor ships in the box",
      "The one program running at all times on the computer",
      "The set of all application programs like Excel or Word",
      "The physical metal casing of the computer",
    ],
    correct: 1,
    explanation:
      "A common approximation is that the **kernel** is the one program running at all times on the computer.",
  },
  {
    q: "What is the primary function of the bootstrap program?",
    options: [
      "To manage the user's email and web browsing",
      "To initialize the system and load the OS kernel",
      "To shut down the computer safely",
      "To provide a backup of the user's hard drive",
    ],
    correct: 1,
    explanation:
      "The bootstrap program **initializes all aspects of the system** (registers, controllers, memory) and **loads the OS kernel** to start execution.",
  },
  {
    q: "How does a device controller notify the CPU that it has finished its operation?",
    options: [
      "By sending an email to the administrator",
      "By causing an interrupt",
      "By restarting the computer",
      "By clearing the system's RAM",
    ],
    correct: 1,
    explanation:
      "A device controller informs the CPU that it has finished its operation by **causing an interrupt**.",
  },
  {
    q: "What is a 'trap' or 'exception' in an operating system?",
    options: [
      "A physical hardware failure that cannot be fixed",
      "A software-generated interrupt caused by an error or user request",
      "A method for catching computer viruses",
      "A specialized hardware button for debugging",
    ],
    correct: 1,
    explanation:
      "A trap or exception is a software-generated interrupt caused either by an error (like division by zero) or a user request.",
  },
  {
    q: "Which of these is the only large storage media the CPU can access directly?",
    options: [
      "Hard disk",
      "Magnetic tape",
      "Main memory (RAM)",
      "Solid-state disk",
    ],
    correct: 2,
    explanation:
      "Main memory is the only large storage media that the CPU can access directly.",
  },
];
