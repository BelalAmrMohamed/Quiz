export const questions = [
  {
    q: "When a child process updates a variable in the program from Figure 3.30, what happens to the parent process's copy of that variable?",
    options: [
      "The parent's value remains unchanged because the child updates its own copy",
      "The parent's value is also updated",
      "The program crashes",
      "The value is shared between both processes",
    ],
    correct: 0,
    explanation:
      "The child process updates its own copy of the variable. When control returns to the parent, its value remains unchanged at 5.",
  },
  {
    q: "Including the initial parent process, how many processes are created by the program shown in Figure 3.31?",
    options: ["8 processes", "4 processes", "16 processes", "7 processes"],
    correct: 0,
    explanation:
      "The program creates a total of 8 processes including the initial parent process.",
  },
  {
    q: "In a Sun UltraSPARC processor with multiple register sets, what happens during a context switch when the new context is already loaded into one of the register sets?",
    options: [
      "The CPU current-register-set pointer is changed, which takes very little time",
      "All registers must be saved to memory first",
      "The processor must restart",
      "A new register set must be allocated",
    ],
    correct: 0,
    explanation:
      "When the new context is already in a register set, the CPU simply changes the current-register-set pointer, which is very fast. If the context is in memory and all register sets are in use, one context must be moved to memory and the new context loaded.",
  },
  {
    q: "When a process creates a new process using fork(), which of the following is shared between parent and child?",
    options: [
      "Shared memory segments only",
      "Stack and heap",
      "Stack only",
      "All memory is shared",
    ],
    correct: 0,
    explanation:
      "Only shared memory segments are shared. Copies of the stack and heap are made for the newly created child process.",
  },
  {
    q: "In RPC (Remote Procedure Call) with 'exactly once' semantics, if the ACK message back to the client is lost, does the algorithm still execute correctly?",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Yes, the algorithm handles this case. The client will timeout and resend the RPC with a later timestamp. The server uses timestamps to identify duplicate RPCs and won't execute it twice, but will send a second ACK to inform the client the RPC was performed.",
  },
  {
    q: "How does the 'exactly once' semantic for RPC handle the case where the server receives a duplicate RPC request?",
    options: [
      "The server uses timestamps to identify duplicates and doesn't perform the RPC a second time, but sends another ACK",
    ],
    correct: 0,
    explanation:
      "The server receives RPCs with timestamps. When a duplicate arrives (identified by the timestamp), the server doesn't execute it again but must send another ACK to inform the client that the RPC has been performed.",
  },
  {
    q: "What mechanisms are required to guarantee 'exactly once' semantics for RPC execution in a distributed system susceptible to server failure?",
    options: [
      "The server should keep track in stable storage (like a disk log) of what RPC operations were received, whether they were successfully performed, and the results",
    ],
    correct: 0,
    explanation:
      "Using stable storage allows the server to check after a crash whether an RPC had been previously performed, thus guaranteeing exactly once semantics even with server failures.",
  },
];
