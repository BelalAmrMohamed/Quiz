export const chapter6 = [
  {
    q: "What are the two bursts that CPU schedulers are designed around?",
    options: ["CPU burst and I/O burst"],
    correct: 0,
    explanation:
      "Execution consists of cycles of CPU processing and waiting for input/output.",
  },
  {
    q: "True or False? Under preemptive scheduling, a process may lose control of the CPU when switching to the ready state.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Preemptive OSs can take the CPU away to give it to a higher-priority task.",
  },
  {
    q: "List at least three different criteria for designing a CPU scheduling algorithm.",
    options: ["CPU utilization, Throughput, and Turnaround time"],
    correct: 0,
    explanation: "Other criteria include Waiting time and Response time.",
  },
  {
    q: "What scheduling algorithm assigns the CPU to the process with the highest priority?",
    options: ["Priority scheduling"],
    correct: 0,
    explanation: "Higher priority processes are always given preference.",
  },
  {
    q: "True or False? The multilevel feedback queue allows processes to migrate between different queues.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. This allows the system to separate processes based on their CPU usage history.",
  },
  {
    q: "What scheduling algorithm assigns the CPU to the process that first requested it?",
    options: ["First-Come, First-Served (FCFS)"],
    correct: 0,
    explanation:
      "This is the simplest algorithm, often implemented with a FIFO queue.",
  },
  {
    q: "What scheduling algorithm assigns the CPU to a process for only its time slice?",
    options: ["Round Robin (RR)"],
    correct: 0,
    explanation:
      "RR is designed for time-sharing systems to provide equal time to all processes.",
  },
  {
    q: "What scheduling algorithm assigns the CPU to the process with the shortest burst?",
    options: ["Shortest-Job-First (SJF)"],
    correct: 0,
    explanation:
      "SJF provides the minimum average waiting time for a set of processes.",
  },
  {
    q: "What are the two types of contention scope for thread scheduling?",
    options: [
      "Process-contention scope (PCS) and System-contention scope (SCS)",
    ],
    correct: 0,
    explanation:
      "PCS is for user threads within a process; SCS is for all threads in the system.",
  },
  {
    q: "What are the two general hardware instructions that can be performed atomically?",
    options: ["test_and_set() and compare_and_swap()"],
    correct: 0,
    explanation:
      "These instructions are used to solve the critical-section problem in synchronization.",
  },
  {
    q: "What is more common on current systems, asymmetric or symmetric multiprocessing?",
    options: ["Symmetric multiprocessing (SMP)"],
    correct: 0,
    explanation: "SMP is standard for modern multi-core computers.",
  },
  {
    q: "What are the two forms of processor affinity?",
    options: ["Soft affinity and Hard affinity"],
    correct: 0,
    explanation:
      "Soft affinity tries to keep a process on a processor; hard affinity forces it.",
  },
  {
    q: "What are the two general approaches for load balancing?",
    options: ["Push migration and Pull migration"],
    correct: 0,
    explanation:
      "Push migration moves tasks to idle CPUs; pull migration has idle CPUs take tasks from busy ones.",
  },
  {
    q: "What are the two ways to multithread a processing core?",
    options: ["Coarse-grained and Fine-grained multithreading"],
    correct: 0,
    explanation:
      "These methods manage how the core switches between threads on stalls.",
  },
  {
    q: "What real-time scheduling algorithm uses deadline as its scheduling criteria?",
    options: ["Earliest-Deadline-First (EDF)"],
    correct: 0,
    explanation:
      "EDF dynamically assigns priorities based on how soon a task must finish.",
  },
  {
    q: "What is the name of the default scheduling algorithm for current Linux systems?",
    options: ["Completely Fair Scheduler (CFS)"],
    correct: 0,
    explanation:
      "CFS uses a red-black tree to ensure all processes get a fair share of CPU time.",
  },
];
