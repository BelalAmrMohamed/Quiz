export const questions = [
  // =====================================================
  // PART I – Precision Definitions (Ch 1,2,3,4,6)
  // =====================================================

  {
    q: "Define an Operating System.",
    options: [
      "An operating system is a program that acts as an intermediary between the user and the computer hardware.",
    ],
    correct: 0,
    explanation:
      "The operating system manages hardware resources and provides services to application programs, functioning as both a resource allocator and a control program.",
  },
  {
    q: "Define a System Call and state its role in operating system design.",
    options: [
      "A system call is a controlled interface through which a user program requests a service from the operating system.",
    ],
    correct: 0,
    explanation:
      "System calls provide the only legal entry point into kernel mode, enabling user programs to safely access OS services such as I/O, process control, and communication.",
  },
  {
    q: "Define Microkernel Architecture.",
    options: [
      "A microkernel architecture places minimal core services in kernel space while moving other services to user space.",
    ],
    correct: 0,
    explanation:
      "This design improves reliability and extensibility through isolation but introduces performance overhead due to message passing.",
  },
  {
    q: "Define Dual-Mode Operation.",
    options: [
      "Dual-mode operation allows the CPU to distinguish between user mode and kernel mode execution.",
    ],
    correct: 0,
    explanation:
      "It protects the operating system by preventing user programs from executing privileged instructions directly.",
  },
  {
    q: "Define a Process.",
    options: [
      "A process is a program in execution, including its current activity and allocated resources.",
    ],
    correct: 0,
    explanation:
      "A process consists of program code, data section, stack, heap, and execution context such as registers and program counter.",
  },
  {
    q: "Define a Context Switch.",
    options: [
      "A context switch is the mechanism of saving the state of one process and restoring the state of another.",
    ],
    correct: 0,
    explanation:
      "It enables CPU sharing among processes but introduces overhead since no user-level computation occurs during the switch.",
  },
  {
    q: "Define a Process Control Block (PCB).",
    options: [
      "A Process Control Block is a data structure that contains all information required to manage a process.",
    ],
    correct: 0,
    explanation:
      "The PCB stores process state, program counter, CPU registers, scheduling information, and memory management data.",
  },
  {
    q: "Define CPU Scheduling.",
    options: [
      "CPU scheduling is the process of selecting one process from the ready queue to allocate the CPU.",
    ],
    correct: 0,
    explanation:
      "CPU scheduling directly affects system performance metrics such as CPU utilization, throughput, and response time.",
  },
  {
    q: "Define a Gantt Chart in the context of CPU scheduling.",
    options: [
      "A Gantt chart is a timeline representation showing the order and duration of process execution on the CPU.",
    ],
    correct: 0,
    explanation:
      "It is commonly used to visualize scheduling behavior and compute waiting time, turnaround time, and response time.",
  },
  {
    q: "Define Amdahl’s Law.",
    options: [
      "Amdahl’s Law states that the maximum speedup of a program is limited by the serial portion of the program.",
    ],
    correct: 0,
    explanation:
      "It highlights diminishing returns in parallel systems as the number of processors increases.",
  },

  // =====================================================
  // PART II – Comparative & Mechanism Essays
  // =====================================================

  {
    q: "Compare Monolithic Kernel and Microkernel architectures in terms of performance and reliability.",
    options: [
      "Monolithic kernels place most OS services in kernel space, while microkernels keep only minimal services in the kernel.",
    ],
    correct: 0,
    explanation:
      "Monolithic kernels offer high performance due to direct procedure calls but lower fault isolation. Microkernels improve reliability and modularity through isolation, at the cost of higher communication overhead.",
  },
  {
    q: "Step-by-step, explain what happens during a context switch.",
    options: [
      "During a context switch, the operating system saves the state of the current process and restores the state of another.",
    ],
    correct: 0,
    explanation:
      "The kernel saves CPU registers and the program counter into the current process’s PCB, selects a new process, restores its state from its PCB, updates memory management context if needed, and transfers control to the new process.",
  },
  {
    q: "Contrast User-Level Threads and Kernel-Level Threads regarding concurrency and blocking behavior.",
    options: [
      "User-level threads are managed by user libraries, while kernel-level threads are managed by the operating system.",
    ],
    correct: 0,
    explanation:
      "User-level threads have low overhead but cannot exploit multicore parallelism and suffer from blocking system calls. Kernel-level threads allow true parallelism but incur higher creation and context-switch overhead.",
  },
  {
    q: "Why is Shortest Job First (SJF) scheduling considered optimal, yet difficult to implement?",
    options: ["SJF schedules the process with the shortest CPU burst next."],
    correct: 0,
    explanation:
      "SJF minimizes average waiting time, making it theoretically optimal. However, it requires accurate knowledge or prediction of future CPU burst lengths, which is not feasible in practice.",
  },
  {
    q: "Describe the lifecycle of a process, including all major state transitions.",
    options: [
      "A process moves through several states from creation to termination.",
    ],
    correct: 0,
    explanation:
      "A process is created in the new state, admitted to ready, scheduled to running, may block in waiting, return to ready, and eventually terminate, releasing all allocated resources.",
  },
  {
    q: "Explain why preemptive scheduling requires synchronization mechanisms.",
    options: [
      "Preemptive scheduling allows the operating system to interrupt running processes.",
    ],
    correct: 0,
    explanation:
      "Because a process can be interrupted while accessing shared data, synchronization mechanisms are required to maintain data consistency. Non-preemptive scheduling avoids this issue by not interrupting execution.",
  },
  {
    q: "Using Amdahl’s Law, explain why adding more CPU cores does not guarantee linear speedup.",
    options: [
      "The speedup of a parallel program is limited by its serial portion.",
    ],
    correct: 0,
    explanation:
      "Even if the parallel portion scales with more processors, the serial portion dominates execution time, leading to diminishing performance gains as core count increases.",
  },
  {
    q: "Why is the Operating System considered both a resource allocator and a control program?",
    options: [
      "The operating system manages hardware resources and enforces correct usage.",
    ],
    correct: 0,
    explanation:
      "As a resource allocator, the OS schedules CPU time and manages memory and I/O. As a control program, it enforces protection and prevents misuse of hardware through mechanisms like dual-mode operation.",
  },
];
