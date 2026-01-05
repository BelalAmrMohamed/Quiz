export const questions = [
  {
    q: "What is the fundamental difference between a program and a process?",
    options: [
      "A program is active while a process is passive",
      "A program is a passive entity stored on disk, whereas a process is an active entity in execution",
      "A program uses a PCB, but a process does not",
      "There is no difference; the terms are used interchangeably",
    ],
    correct: 1,
    explanation:
      "The sources state that a program is a passive entity (like an executable file on disk), while a process is an active entity that is currently in execution.",
  },
  {
    q: "Which part of a process in memory contains dynamically allocated memory during runtime?",
    options: ["Stack", "Data section", "Text section", "Heap"],
    correct: 3,
    explanation:
      "The heap is the section of process memory that is dynamically allocated during run time.",
  },
  {
    q: "When a process is waiting to be assigned to a processor, what state is it in?",
    options: ["New", "Waiting", "Ready", "Running"],
    correct: 2,
    explanation:
      "A process in the 'ready' state is waiting to be assigned to a processor.",
  },
  {
    q: "What information is typically stored in a Process Control Block (PCB)?",
    options: [
      "Process state, program counter, and CPU registers",
      "Memory-management information and I/O status",
      "CPU-scheduling and accounting information",
      "All of the above",
    ],
    correct: 3,
    explanation:
      "The PCB contains a wide range of information, including process state, program counter, registers, scheduling info, memory management, accounting, and I/O status.",
  },
  {
    q: "Which scheduler is responsible for controlling the 'degree of multiprogramming'?",
    options: [
      "Short-term scheduler",
      "Medium-term scheduler",
      "Long-term scheduler",
      "CPU scheduler",
    ],
    correct: 2,
    explanation:
      "The long-term scheduler (or job scheduler) selects which processes should be brought into the ready queue, thereby controlling the degree of multiprogramming.",
  },
  {
    q: "What occurs during a 'context switch'?",
    options: [
      "The OS switches from kernel mode to user mode only",
      "The system saves the state of the current process and loads the saved state of a new process",
      "The OS deletes a terminated process to free up memory",
      "A process moves from the ready queue to a device queue",
    ],
    correct: 1,
    explanation:
      "A context switch involves saving the state of the old process and loading the saved state for the new process via the PCB.",
  },
  {
    q: "In a Unix-based system, which system call is used to create a new process by duplicating the parent?",
    options: ["exec()", "abort()", "fork()", "wait()"],
    correct: 2,
    explanation:
      "The fork() system call creates a new process by duplicating the currently executing process.",
  },
  {
    q: "What are the two primary models for Interprocess Communication (IPC)?",
    options: [
      "Direct and Indirect communication",
      "Shared memory and Message passing",
      "Synchronous and Asynchronous communication",
      "Sockets and Symmetrical communication",
    ],
    correct: 1,
    explanation:
      "The two fundamental models of IPC described in the sources are shared memory and message passing.",
  },
  {
    q: "What is a 'zombie' process?",
    options: [
      "A process that has been terminated but its parent has not yet called wait()",
      "A process that has been orphaned because its parent terminated",
      "A process that is stuck in an infinite loop",
      "A process that has been swapped out to disk",
    ],
    correct: 0,
    explanation:
      "A process is considered a 'zombie' if it has terminated but the parent process has not yet invoked the wait() system call to collect its status.",
  },
  {
    q: "Which mechanism allows a client to call a procedure on a remote host as if it were a local call?",
    options: [
      "Sockets",
      "Pipes",
      "RPC (Remote Procedure Call)",
      "Shared Memory",
    ],
    correct: 2,
    explanation:
      "RPC abstracts procedure calls between processes on networked systems, using stubs to handle communication between the client and server.",
  },
];
