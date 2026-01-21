export const questions = [
  // =====================
  // MCQs (1–20)
  // =====================
  {
    q: "Which condition necessarily requires preemptive CPU scheduling?",
    options: [
      "A process terminates",
      "A process switches from running to waiting",
      "A process switches from waiting to ready",
      "A process performs I/O",
    ],
    correct: 2,
    explanation:
      "A transition from waiting to ready may cause the currently running process to be preempted in preemptive scheduling.",
  },
  {
    q: "The dispatcher is directly responsible for:",
    options: [
      "Selecting the next process to execute",
      "Saving and restoring memory mappings",
      "Context switching and transferring control to user mode",
      "Managing the ready queue",
    ],
    correct: 2,
    explanation:
      "The dispatcher performs the context switch, switches to user mode, and jumps to the correct instruction.",
  },
  {
    q: "Which scheduling algorithm is provably optimal in minimizing average waiting time, assuming exact knowledge of CPU burst lengths?",
    options: [
      "First-Come, First-Served (FCFS)",
      "Round Robin",
      "Priority Scheduling",
      "Shortest Job First (SJF)",
    ],
    correct: 3,
    explanation:
      "SJF minimizes average waiting time if CPU burst lengths are known in advance.",
  },
  {
    q: "The convoy effect is most likely to occur under:",
    options: [
      "Round Robin scheduling",
      "Preemptive Shortest Job First",
      "First-Come, First-Served scheduling",
      "Priority scheduling with aging",
    ],
    correct: 2,
    explanation:
      "FCFS can cause short processes to wait behind long CPU-bound processes.",
  },
  {
    q: "In exponential averaging for CPU burst prediction, a value of α = 1 implies:",
    options: [
      "All past bursts have equal weight",
      "Only the most recent burst is considered",
      "Burst history is ignored",
      "The prediction is constant",
    ],
    correct: 1,
    explanation:
      "When α = 1, the next prediction depends only on the most recent CPU burst.",
  },
  {
    q: "Which scheduling metric is most critical for interactive systems?",
    options: ["Turnaround time", "Waiting time", "Throughput", "Response time"],
    correct: 3,
    explanation:
      "Interactive systems prioritize fast initial response to user requests.",
  },
  {
    q: "Starvation in priority scheduling can be prevented using:",
    options: ["Preemption", "Time quantum", "Aging", "Context switching"],
    correct: 2,
    explanation: "Aging gradually increases the priority of waiting processes.",
  },
  {
    q: "Which statement best describes Round Robin scheduling?",
    options: [
      "It is non-preemptive and priority-based",
      "It assigns CPU based on shortest burst",
      "It provides fairness using time quanta",
      "It minimizes turnaround time",
    ],
    correct: 2,
    explanation:
      "Round Robin allocates CPU time fairly using fixed time slices.",
  },
  {
    q: "A process differs from a program because a process:",
    options: [
      "Is stored on disk",
      "Is passive",
      "Has an execution context",
      "Cannot be scheduled",
    ],
    correct: 2,
    explanation:
      "A process is an active entity with state, registers, and a program counter.",
  },
  {
    q: "Which component stores CPU registers, program counter, and scheduling information?",
    options: [
      "Ready Queue",
      "Process Stack",
      "Process Control Block",
      "Kernel Stack",
    ],
    correct: 2,
    explanation:
      "The PCB contains all information needed to manage and resume a process.",
  },
  {
    q: "Which process state represents a process waiting for CPU allocation?",
    options: ["New", "Waiting", "Ready", "Running"],
    correct: 2,
    explanation: "A ready process is waiting to be assigned the CPU.",
  },
  {
    q: "A context switch is considered overhead because:",
    options: [
      "It executes user code",
      "It performs useful computation",
      "No user process makes progress",
      "It improves CPU utilization",
    ],
    correct: 2,
    explanation:
      "During a context switch, the CPU performs administrative work only.",
  },
  {
    q: "Which system call replaces a process’s memory image with a new program?",
    options: ["fork()", "wait()", "exec()", "exit()"],
    correct: 2,
    explanation:
      "exec() loads a new program into the existing process address space.",
  },
  {
    q: "A process that has terminated but whose parent has not yet called wait() is called:",
    options: ["Orphan", "Zombie", "Daemon", "Kernel process"],
    correct: 1,
    explanation:
      "Zombie processes remain until the parent collects their exit status.",
  },
  {
    q: "Which IPC model requires explicit synchronization by user processes?",
    options: ["Message passing", "Pipes", "Shared memory", "Signals"],
    correct: 2,
    explanation:
      "Shared memory requires synchronization mechanisms such as semaphores.",
  },
  {
    q: "Which threading model allows true parallelism on multicore systems?",
    options: ["Many-to-One", "One-to-One", "User-level only", "Green threads"],
    correct: 1,
    explanation:
      "Each user thread maps to a kernel thread, enabling parallel execution.",
  },
  {
    q: "Which benefit of multithreading refers to lower overhead compared to processes?",
    options: ["Scalability", "Responsiveness", "Economy", "Parallelism"],
    correct: 2,
    explanation: "Threads are cheaper to create and switch than processes.",
  },
  {
    q: "Amdahl’s Law highlights the performance limitation caused by:",
    options: [
      "Context switching",
      "Parallel overhead",
      "Serial portions of a program",
      "I/O wait time",
    ],
    correct: 2,
    explanation: "The serial fraction of a program limits overall speedup.",
  },
  {
    q: "Which OpenMP directive parallelizes a loop?",
    options: [
      "#pragma omp task",
      "#pragma omp section",
      "#pragma omp parallel for",
      "#pragma omp critical",
    ],
    correct: 2,
    explanation:
      "The parallel for directive distributes loop iterations across threads.",
  },
  {
    q: "Which Grand Central Dispatch queue guarantees FIFO execution with no concurrency?",
    options: [
      "Global concurrent queue",
      "High-priority queue",
      "Main queue",
      "Thread pool queue",
    ],
    correct: 2,
    explanation:
      "The main queue is a serial queue that executes tasks in FIFO order.",
  },

  // =====================
  // Essays / Definitions (21–30)
  // =====================
  {
    q: "Define CPU Scheduling and explain why it is essential in multiprogrammed operating systems.",
    options: [
      "CPU scheduling is the mechanism by which the operating system selects one process from the ready queue to allocate the CPU.",
    ],
    correct: 0,
    explanation:
      "CPU scheduling ensures efficient CPU utilization by allowing multiple processes to share the processor. It improves system throughput, fairness, and responsiveness by preventing the CPU from remaining idle when runnable processes exist.",
  },
  {
    q: "Differentiate between preemptive and non-preemptive scheduling. Give one implication of each.",
    options: [
      "Preemptive scheduling allows the OS to interrupt a running process, while non-preemptive scheduling does not.",
    ],
    correct: 0,
    explanation:
      "Preemptive scheduling improves responsiveness and fairness but increases overhead and synchronization complexity. Non-preemptive scheduling reduces overhead but may lead to long waiting times and poor responsiveness.",
  },
  {
    q: "Explain the role of the Process Control Block (PCB) in context switching.",
    options: [
      "The PCB stores all necessary information to resume a process after interruption.",
    ],
    correct: 0,
    explanation:
      "During a context switch, the operating system saves the current process state into its PCB and restores another process’s state from its PCB. This enables correct suspension and resumption of processes.",
  },
  {
    q: "Compare FCFS and Shortest Job First scheduling in terms of performance and limitations.",
    options: ["FCFS is simple, while SJF minimizes average waiting time."],
    correct: 0,
    explanation:
      "FCFS can suffer from the convoy effect, leading to poor performance. SJF provides optimal average waiting time but requires accurate prediction of CPU burst lengths, which is difficult in practice.",
  },
  {
    q: "Explain the four conditions under which CPU scheduling decisions occur.",
    options: ["Scheduling decisions occur during process state transitions."],
    correct: 0,
    explanation:
      "Scheduling decisions occur when a process switches from running to waiting, running to ready, waiting to ready, or terminates. Only some of these transitions require preemption.",
  },
  {
    q: "Define a thread and explain how threads improve performance compared to processes.",
    options: [
      "A thread is the smallest unit of CPU execution within a process.",
    ],
    correct: 0,
    explanation:
      "Threads improve performance by enabling parallelism, reducing context-switch overhead, and allowing shared memory access within a process. They are more lightweight than processes.",
  },
  {
    q: "Compare Many-to-One and One-to-One threading models.",
    options: [
      "Many-to-One maps many user threads to one kernel thread, while One-to-One maps each user thread to a kernel thread.",
    ],
    correct: 0,
    explanation:
      "Many-to-One does not allow true parallelism and suffers from blocking issues. One-to-One enables parallelism on multicore systems but incurs higher overhead.",
  },
  {
    q: "Explain Amdahl’s Law and its implication for multicore systems.",
    options: [
      "Amdahl’s Law limits the speedup achievable through parallelism.",
    ],
    correct: 0,
    explanation:
      "Amdahl’s Law states that the serial portion of a program limits overall speedup. This emphasizes optimizing or reducing serial code to benefit from multicore architectures.",
  },
  {
    q: "Describe the Shared Memory IPC model, including one advantage and one challenge.",
    options: [
      "Shared memory allows processes to communicate via a common memory region.",
    ],
    correct: 0,
    explanation:
      "Shared memory provides fast communication since no kernel intervention is required after setup. However, it requires explicit synchronization to avoid race conditions.",
  },
  {
    q: "Explain why dual-mode operation is critical for operating system protection.",
    options: ["Dual-mode operation separates user and kernel execution."],
    correct: 0,
    explanation:
      "Dual-mode operation prevents user programs from executing privileged instructions, protecting the OS from misuse and ensuring system stability and security.",
  },
];
