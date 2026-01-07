// Quiz on the Introduction to Operating Systems
export const questions = [
  {
    q: "What are the three main purposes of an operating system?",
    options: [
      "To provide an environment for executing programs conveniently and efficiently, to allocate computer resources fairly and efficiently, and to serve as a control program supervising user programs and managing I/O devices",
    ],
    correct: 0,
    explanation:
      "An operating system serves three key purposes: providing a convenient execution environment, managing resource allocation, and acting as a control program for supervision and I/O management.",
  },
  {
    q: "When is it appropriate for an operating system to 'waste' resources by not maximizing hardware efficiency?",
    options: [
      "In single-user systems where optimizing user interaction (like with a GUI) is more important than CPU efficiency",
      "Never - the OS should always maximize hardware efficiency",
      "Only in multi-user systems",
      "Only when running real-time applications",
    ],
    correct: 0,
    explanation:
      "Single-user systems should maximize use of the system for the user. A GUI might 'waste' CPU cycles, but it optimizes the user's interaction with the system, making it a worthwhile tradeoff.",
  },
  {
    q: "What is the main difficulty that a programmer must overcome in writing an operating system for a real-time environment?",
    options: [
      "Keeping the OS within fixed time constraints",
      "Managing multiple users simultaneously",
      "Providing a graphical user interface",
      "Maximizing throughput",
    ],
    correct: 0,
    explanation:
      "The main difficulty is keeping the operating system within the fixed time constraints of a real-time system. If the system does not complete a task in a certain time frame, it may cause a breakdown of the entire system. Scheduling schemes must not allow response time to exceed the time constraint.",
  },
  {
    q: "Arguments against embedding applications (like web browsers) within the operating system typically include all of the following EXCEPT:",
    options: [
      "Applications are not part of an operating system",
      "Security vulnerabilities offset any performance benefits",
      "It leads to a bloated operating system",
      "It makes the applications harder to update",
    ],
    correct: 3,
    explanation:
      "The document mentions three main arguments against embedding applications: (1) applications are not part of an OS, (2) performance benefits are offset by security vulnerabilities, and (3) it leads to bloat. Update difficulty is not mentioned.",
  },
  {
    q: "How does the distinction between kernel mode and user mode function as a rudimentary form of protection?",
    options: [
      "Certain critical instructions and hardware access can only be executed in kernel mode, limiting user mode capabilities and protecting critical resources",
    ],
    correct: 0,
    explanation:
      "Certain instructions can only be executed in kernel mode. Hardware devices can only be accessed in kernel mode. Control over interrupts is only possible in kernel mode. This gives user mode very limited capability, thereby enforcing protection of critical resources.",
  },
  {
    q: "Which of the following instructions should be privileged and executed only in kernel mode? (Select all that apply by identifying which statement is correct)",
    options: [
      "Set timer value, clear memory, turn off interrupts, modify device-status table entries, and access I/O devices",
      "All instructions including reading the clock and issuing trap instructions",
      "Only instructions that modify hardware directly",
      "Reading the clock, issuing trap instructions, and switching to kernel mode",
    ],
    correct: 0,
    explanation:
      "Privileged instructions include: set value of timer, clear memory, turn off interrupts, modify entries in device-status table, and access I/O device. Operations like reading the clock, issuing trap instructions, and switching to kernel mode can be performed in user mode.",
  },
  {
    q: "Early computers that placed the OS in a memory partition that could not be modified by either user jobs or the OS itself would face difficulties because:",
    options: [
      "Data required by the OS (passwords, access controls, etc.) would have to be stored in unprotected memory, making it accessible to unauthorized users",
    ],
    correct: 0,
    explanation:
      "The main difficulty is that operating system data like passwords, access controls, and accounting information would need to be stored in or passed through unprotected memory, making it accessible to unauthorized users.",
  },
  {
    q: "Some CPUs provide for more than two modes of operation. What are two possible uses of these multiple modes?",
    options: [
      "To provide finer-grained security policies (e.g., different user groups) and to allow device drivers to run in quasi-user/kernel mode without full kernel mode switching",
    ],
    correct: 0,
    explanation:
      "Multiple modes could provide finer-grained security by distinguishing between different types of user modes (e.g., users in the same group executing each other's code). They could also allow different distinctions within kernel code, such as allowing USB device drivers to run in a special mode without full kernel mode switching.",
  },
  {
    q: "How could timers be used to compute the current time?",
    options: [
      "Set a timer for the future, sleep until interrupted, update local state tracking interrupt count, and repeat this process continuously",
    ],
    correct: 0,
    explanation:
      "A program could set a timer for some time in the future and go to sleep. When awakened by the interrupt, it updates its local state tracking the number of interrupts received. By repeating this process of setting timer interrupts and updating state, it can compute the current time.",
  },
  {
    q: "Caches are useful because they solve the transfer problem between components operating at different speeds.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Caches provide a buffer of intermediate speed between components that transfer data at differing speeds. If the fast device finds needed data in the cache, it doesn't need to wait for the slower device.",
  },
  {
    q: "A cache can completely replace a device it's caching for (like a disk) if the cache is made the same size.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "A component may be eliminated by an equal-sized cache only if: (a) the cache and component have equivalent state-saving capacity (e.g., if the component retains data when power is removed, the cache must too), and (b) the cache is affordable, since faster storage tends to be more expensive.",
  },
  {
    q: "What is a key difference between client-server and peer-to-peer distributed system models?",
    options: [
      "Client-server has distinct roles where clients request services from servers, while peer-to-peer nodes can act as both clients and servers",
      "Client-server is faster than peer-to-peer",
      "Peer-to-peer requires a central server while client-server does not",
      "Client-server can only handle one client at a time",
    ],
    correct: 0,
    explanation:
      "The client-server model firmly distinguishes roles: clients request services provided by servers. The peer-to-peer model has no strict roles - all nodes are peers and may act as either clients or servers (or both), requesting services from or providing services to other peers.",
  },
];
