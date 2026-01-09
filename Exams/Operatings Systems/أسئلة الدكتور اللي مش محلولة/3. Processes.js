export const questions = [
  {
    q: "What are the four components of a process?",
    options: ["Text section, data section, heap, and stack"],
    correct: 0,
    explanation:
      "These components store the code, global variables, dynamic memory, and temporary data (like function parameters).",
  },
  {
    q: "Provide at least three possible states a process may be in.",
    options: ["New, Running, Waiting, Ready, and Terminated"],
    correct: 0,
    explanation:
      "Processes move between these states as they are scheduled or wait for I/O.",
  },
  {
    q: "What is a Process Control Block (PCB)?",
    options: ["A data structure containing information about a process"],
    correct: 0,
    explanation:
      "The PCB includes the process state, program counter, CPU registers, and more.",
  },
  {
    q: "What is another term for process?",
    options: ["A job"],
    correct: 0,
    explanation:
      "The terms job and process are often used interchangeably in operating systems.",
  },
  {
    q: "True or False? Most operating systems allow a process to have multiple threads.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Multithreading allows a process to perform multiple tasks at once.",
  },
  {
    q: "What is the role of the process scheduler?",
    options: ["To select an available process for execution on the CPU"],
    correct: 0,
    explanation:
      "The scheduler aims to keep the CPU busy and provide fast response times.",
  },
  {
    q: "What is the degree of multiprogramming?",
    options: ["The number of processes currently in memory"],
    correct: 0,
    explanation: "Managing this degree is important for system balance.",
  },
  {
    q: "What is the term that describes saving the state of one process, and restoring the state of another?",
    options: ["Context switch"],
    correct: 0,
    explanation:
      "The kernel must perform a context switch whenever it stops one process to start another.",
  },
  {
    q: "What is a process identifier (PID)?",
    options: ["A unique numerical ID for each process"],
    correct: 0,
    explanation:
      "The PID is used to identify and manage processes within the system.",
  },
  {
    q: "What system call creates a process on UNIX systems?",
    options: ["fork()"],
    correct: 0,
    explanation:
      "The fork() call creates a new process that is a copy of the parent.",
  },
  {
    q: "What system call creates a process on Windows systems?",
    options: ["CreateProcess()"],
    correct: 0,
    explanation:
      "Unlike Unix, Windows uses a single call to load a program and start a process.",
  },
  {
    q: "What system call terminates a process on UNIX systems?",
    options: ["exit()"],
    correct: 0,
    explanation:
      "When a program finishes, it calls exit() to return its status to the OS.",
  },
  {
    q: "What is the name of the process that UNIX systems assign as the new parent of orphan processes?",
    options: ["init (or systemd)"],
    correct: 0,
    explanation:
      "Orphans are processes whose parents ended; init 'adopts' them to clean up their resources later.",
  },
  {
    q: "What are the two fundamental models of interprocess communication?",
    options: ["Shared memory and Message passing"],
    correct: 0,
    explanation:
      "Shared memory is fast but needs synchronization; Message passing is easier to implement for small data.",
  },
  {
    q: "What are the two system calls used with message-passing systems?",
    options: ["send() and receive()"],
    correct: 0,
    explanation:
      "These allow processes to exchange fixed or variable-sized messages.",
  },
  {
    q: "True or False? Message passing is typically faster than shared memory.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. Shared memory is generally faster because it avoids kernel intervention for data transfers.",
  },
  {
    q: "What system call is used to create a POSIX shared memory object?",
    options: ["shm_open()"],
    correct: 0,
    explanation:
      "This call returns a file descriptor for the shared memory segment.",
  },
  {
    q: "What term does Windows use to name its message passing facility?",
    options: ["Advanced Local Procedure Call (ALPC)"],
    correct: 0,
    explanation:
      "ALPC is the internal mechanism for communication between processes on the same machine.",
  },
  {
    q: "TCP sockets are (a) connection-oriented or (b) connection-less?",
    options: ["(a) connection-oriented"],
    correct: 0,
    explanation:
      "TCP establishes a connection before sending data to ensure reliability.",
  },
  {
    q: "What are the two types of pipes?",
    options: ["Ordinary pipes and Named pipes"],
    correct: 0,
    explanation:
      "Ordinary pipes are for parent-child communication; Named pipes can be used by unrelated processes.",
  },
];
