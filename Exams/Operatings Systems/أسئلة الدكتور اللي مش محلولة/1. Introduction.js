export const chapter1 = [
  {
    q: "What are the four components of a computer system?",
    options: ["Hardware, operating system, application programs, and users"],
    correct: 0,
    explanation:
      "A computer system is divided into hardware (CPU, memory), the OS (controls hardware), applications (word processors, etc.), and the people or machines using it.",
  },
  {
    q: "Provide at least three resources the operating system allocates.",
    options: ["CPU time, memory space, and file storage"],
    correct: 0,
    explanation:
      "The OS acts as a resource allocator, managing hardware and software needs to ensure efficiency.",
  },
  {
    q: "What is the common name used to refer to the operating system program?",
    options: ["The kernel"],
    correct: 0,
    explanation:
      "The kernel is the one program running at all times on the computer.",
  },
  {
    q: "What do mobile operating systems often include in addition to the core kernel?",
    options: ["Middleware"],
    correct: 0,
    explanation:
      "Middleware is a set of software frameworks that provide additional services to application developers.",
  },
  {
    q: "What is an interrupt?",
    options: ["A hardware signal to the CPU that an event has occurred"],
    correct: 0,
    explanation:
      "Interrupts signal the CPU to stop its current task and handle a specific event, like I/O completion.",
  },
  {
    q: "What special operation triggers a software interrupt?",
    options: ["A system call (or trap)"],
    correct: 0,
    explanation:
      "A system call is a request by a user program for the OS to perform a specific task.",
  },
  {
    q: "What is one advantage of using a solid state disk over a magnetic disk?",
    options: ["Faster access speed"],
    correct: 0,
    explanation:
      "SSDs are faster because they have no moving parts, unlike traditional spinning magnetic disks.",
  },
  {
    q: "What is the difference between volatile and nonvolatile storage?",
    options: ["Volatile loses data when power is off; nonvolatile retains it"],
    correct: 0,
    explanation: "RAM is volatile, while hard drives and SSDs are nonvolatile.",
  },
  {
    q: "What is another term for multiprocessor system?",
    options: ["Parallel system"],
    correct: 0,
    explanation:
      "These systems have two or more CPUs in close communication sharing resources.",
  },
  {
    q: "Provide at least two advantages of multiprocessor systems.",
    options: ["Increased throughput and increased reliability"],
    correct: 0,
    explanation:
      "More processors do more work in less time, and if one fails, others can take over.",
  },
  {
    q: "True or False? The most common multiple-processor system uses asymmetric multiprocessing.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False.  Symmetric multiprocessing (SMP) is the most common, where each processor performs all tasks.",
  },
  {
    q: "What is the name of a multiprocessor system that uses multiple computing cores?",
    options: ["Multicore system"],
    correct: 0,
    explanation: "Multicore systems put multiple CPUs on a single chip.",
  },
  {
    q: "How does a clustered system differ from a multicore system?",
    options: [
      "Clusters consist of two or more individual systems joined together",
    ],
    correct: 0,
    explanation:
      "While multicore is on one chip, clustered systems are usually independent computers connected via a network.",
  },
  {
    q: "How does multiprogramming increase CPU utilization?",
    options: ["By keeping several jobs in memory so the CPU always has work"],
    correct: 0,
    explanation:
      "If one job has to wait (like for I/O), the CPU simply switches to another job.",
  },
  {
    q: "What is the term for a program that has been loaded and is executing?",
    options: ["A process"],
    correct: 0,
    explanation: "A program is passive; a process is active.",
  },
  {
    q: "What part of the operating system makes the decision with regards to which job will run?",
    options: ["The CPU scheduler"],
    correct: 0,
    explanation:
      "The scheduler picks which process in memory gets to use the CPU next.",
  },
  {
    q: "What are the two separate modes of operation?",
    options: ["User mode and Kernel mode"],
    correct: 0,
    explanation:
      "These modes protect the system from errors caused by user programs.",
  },
  {
    q: "What is the mode of the system at boot time?",
    options: ["Kernel mode"],
    correct: 0,
    explanation:
      "The system starts in kernel mode to initialize hardware before switching to user mode.",
  },
  {
    q: "What is the mode of the system when the operating system gains control?",
    options: ["Kernel mode"],
    correct: 0,
    explanation:
      "Whenever an interrupt or trap occurs, the hardware switches to kernel mode.",
  },
  {
    q: "What is the mode of the system when a user program is running?",
    options: ["User mode"],
    correct: 0,
    explanation:
      "User programs run in user mode to prevent them from executing dangerous hardware instructions.",
  },
  {
    q: "Name at least two activities the operating system is responsible for in connection with process management.",
    options: ["Creating/deleting processes and scheduling processes"],
    correct: 0,
    explanation:
      "The OS manages the lifecycle and execution order of all active tasks.",
  },
  {
    q: "Name at least two activities the operating system is responsible for in connection with memory management.",
    options: ["Allocating/deallocating space and tracking used memory"],
    correct: 0,
    explanation:
      "The OS must decide which processes get memory and ensure they don't overwrite each other.",
  },
  {
    q: "True or False? Managing files is one of the most visible aspects of an operating system.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True.  Users interact with the file system daily to save and organize data.",
  },
  {
    q: "Name at least two activities the operating system is responsible for in connection with file management.",
    options: ["Creating/deleting files and mapping files to physical storage"],
    correct: 0,
    explanation:
      "The OS provides a logical view of storage and handles the actual writing to disks.",
  },
  {
    q: "Name at least two activities the operating system is responsible for in connection with disk management.",
    options: ["Free-space management and disk scheduling"],
    correct: 0,
    explanation:
      "The OS manages how data is placed on the physical disk to improve performance.",
  },
  {
    q: "Rank these from fastest to slowest: (1) main memory, (2) magnetic disk, (3) registers, (4) solid state disk, (5) cache.",
    options: ["3, 5, 1, 4, 2"],
    correct: 0,
    explanation:
      "Registers are inside the CPU (fastest), followed by Cache, Main Memory (RAM), SSDs, and Magnetic Disks (slowest).",
  },
  {
    q: "What is the difference between protection and security?",
    options: [
      "Protection controls access to resources; Security defends against external/internal attacks",
    ],
    correct: 0,
    explanation:
      "Protection is internal management;  Security is broader defense against threats like viruses or hackers.",
  },
  {
    q: "List at least four common kernel data structures.",
    options: ["Lists, stacks, queues, and trees"],
    correct: 0,
    explanation:
      "The kernel uses these standard structures to organize data like process lists or file systems.",
  },
  {
    q: "True or False? A bitmap of length N can be used to represent the status of 2^N items.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False.  A bitmap of length N represents exactly N items, where each bit is 0 or 1.",
  },
  {
    q: "List at least five different types of computing environments.",
    options: ["Traditional, Mobile, Distributed, Cloud, and Real-time"],
    correct: 0,
    explanation:
      "Computing has evolved from desktop setups to mobile, network-based, and virtualized cloud systems.",
  },
  {
    q: "Provide an example of an open source operating system.",
    options: ["Linux"],
    correct: 0,
    explanation:
      "Linux is the most prominent OS where the source code is freely available for anyone to modify.",
  },
];
