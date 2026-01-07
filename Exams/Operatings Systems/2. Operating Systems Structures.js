export const questions = [
  {
    q: "What is the purpose of system calls?",
    options: [
      "System calls allow user-level processes to request services of the operating system",
    ],
    correct: 0,
    explanation:
      "System calls provide an interface between user-level processes and the operating system kernel, allowing processes to request OS services.",
  },
  {
    q: "What are the five major activities of an operating system with regard to process management?",
    options: [
      "Creation and deletion of processes, suspension and resumption of processes, provision of mechanisms for process synchronization, provision of mechanisms for process communication, and provision of mechanisms for deadlock handling",
    ],
    correct: 0,
    explanation:
      "These five activities cover the complete lifecycle and interaction management of processes in an operating system.",
  },
  {
    q: "Which of the following is NOT one of the three major activities of an operating system with regard to memory management?",
    options: [
      "Encryption of memory contents",
      "Keeping track of which parts of memory are being used",
      "Deciding which processes to load into memory",
      "Allocating and deallocating memory space",
    ],
    correct: 0,
    explanation:
      "The three major memory management activities are: tracking memory usage, deciding which processes to load, and allocating/deallocating memory. Encryption is not a core memory management activity.",
  },
  {
    q: "What are the three major activities of an operating system with regard to secondary-storage management?",
    options: [
      "Free-space management, storage allocation, and disk scheduling",
      "Backup, encryption, and compression",
      "Reading, writing, and deleting files",
      "Partitioning, formatting, and defragmenting",
    ],
    correct: 0,
    explanation:
      "Secondary-storage management focuses on managing free space, allocating storage efficiently, and scheduling disk operations.",
  },
  {
    q: "Why is the command interpreter usually separate from the kernel?",
    options: [
      "Because the command interpreter is subject to changes",
      "Because it requires less memory",
      "Because it runs faster when separate",
      "Because it needs to be written in a different programming language",
    ],
    correct: 0,
    explanation:
      "The command interpreter reads and executes commands, converting them into system calls. It's kept separate from the kernel because it frequently needs to be modified or updated.",
  },
  {
    q: "In Unix systems, what two system calls need to be executed to start a new process?",
    options: [
      "fork() followed by exec()",
      "create() followed by run()",
      "spawn() followed by execute()",
      "clone() followed by start()",
    ],
    correct: 0,
    explanation:
      "The fork() call clones the currently executing process, while exec() overlays a new process based on a different executable over the calling process.",
  },
  {
    q: "System programs can be thought of as bundles of useful system calls that provide basic functionality to users.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "System programs provide common functionality so users don't need to write their own programs to solve common problems using system calls directly.",
  },
  {
    q: "What is the main advantage of the layered approach to system design?",
    options: [
      "The system is easier to debug and modify because changes affect only limited sections",
      "It makes the system run faster",
      "It reduces memory usage",
      "It allows multiple operating systems to run simultaneously",
    ],
    correct: 0,
    explanation:
      "Modular design means bugs are limited to specific modules/layers, information is kept where needed, and changes don't affect the entire system.",
  },
  {
    q: "Which of the following OS services could NOT be safely provided by user-level programs?",
    options: [
      "All of the listed services require OS-level control",
      "Program execution and CPU time allocation",
      "I/O operations and device access",
      "File-system manipulation and protection",
      "Communications and network access",
    ],
    correct: 0,
    explanation:
      "User-level programs cannot be trusted to properly allocate CPU time, access devices appropriately, enforce file protections, coordinate network access, or handle system-wide errors. These all require OS-level control.",
  },
  {
    q: "Why do some systems store the operating system in firmware rather than on disk?",
    options: [
      "For devices like PDAs and cellular phones that may not have a disk with a file system available",
      "Because firmware is faster than disk storage",
      "Because it's cheaper to manufacture",
      "Because it's easier to update",
    ],
    correct: 0,
    explanation:
      "Devices without traditional disk storage, such as handheld PDAs and cellular telephones, must store their operating system in firmware.",
  },
  {
    q: "How does a boot manager allow a choice of operating systems from which to boot?",
    options: [
      "The boot manager runs during system startup and determines which OS to boot into, typically stored at specific hard disk locations and providing a selection menu",
    ],
    correct: 0,
    explanation:
      "Rather than booting directly to an OS, the boot manager runs first during startup, presents a menu of available operating systems, and boots into a default OS if no selection is made.",
  },
];
