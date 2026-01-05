export const questions = [
  {
    q: "Given 'n' processes to be scheduled on a single processor, how many different possible schedules can be created?",
    options: [
      "n^2 (n squared)",
      "2^n (2 to the power of n)",
      "n! (n factorial)",
      "n * (n - 1) / 2",
    ],
    correct: 2,
    explanation:
      "According to the sources, for n processes, there are n! (n factorial) different possible schedules that can be determined.",
  },
  {
    q: "What is the primary difference between **preemptive** and **nonpreemptive** scheduling?",
    options: [
      "Preemptive scheduling only occurs when a process terminates",
      "Nonpreemptive scheduling allows a process to be interrupted in the middle of execution",
      "Preemptive scheduling allows the CPU to be taken away from a process during its execution",
      "Nonpreemptive scheduling is used only in time-sharing systems",
    ],
    correct: 2,
    explanation:
      "Preemptive scheduling allows a process to be interrupted during execution to allocate the CPU to another process, while nonpreemptive scheduling ensures a process keeps the CPU until it finishes its current burst or terminates.",
  },
  {
    q: "Which of the following is NOT a goal of scheduling algorithm optimization?",
    options: [
      "Maximize CPU utilization",
      "Maximize Throughput",
      "Maximize Turnaround time",
      "Minimize Response time",
      "Minimize Waiting time",
    ],
    correct: 2,
    explanation:
      "The optimization criteria aim to **maximize** CPU utilization and throughput, but **minimize** turnaround time, waiting time, and response time.",
  },
  {
    q: "In First-Come, First-Served (FCFS) scheduling, what is the **convoy effect**?",
    options: [
      "When many short processes wait for one long CPU-bound process to relinquish the CPU",
      "When the CPU scheduler is overwhelmed by too many arrival requests",
      "When a process is repeatedly moved to the back of the queue",
      "When context switching overhead exceeds actual processing time",
    ],
    correct: 0,
    explanation:
      "The convoy effect occurs in FCFS when short processes (often I/O-bound) are stuck waiting behind one long, CPU-bound process, resulting in lower hardware utilization.",
  },
  {
    q: "Why is **Shortest-Job-First (SJF)** scheduling considered optimal?",
    options: [
      "It is the easiest algorithm to implement in modern kernels",
      "It provides the minimum average waiting time for a given set of processes",
      "It eliminates the need for a dispatcher",
      "It prevents CPU-bound processes from starving",
    ],
    correct: 1,
    explanation:
      "SJF is optimal because it results in the minimum average waiting time for a specific set of processes by prioritizing the shortest CPU bursts.",
  },
  {
    q: "When predicting the length of the next CPU burst using **exponential averaging**, what does a parameter of **α = 0** imply?",
    options: [
      "Only the actual last CPU burst counts",
      "Recent history does not count, and the prediction remains constant",
      "The next burst will always be zero",
      "The history and the recent burst are weighted equally",
    ],
    correct: 1,
    explanation:
      "In the formula τ_{n+1} = αt_n + (1 - α)τ_n, if α = 0, the recent history (t_n) does not count, and the predicted value (τ) does not change.",
  },
  {
    q: "What is a major problem with **Priority Scheduling**, and what is its commonly used solution?",
    options: [
      "Problem: Convoy effect; Solution: Round Robin",
      "Problem: Starvation (indefinite blocking); Solution: Aging",
      "Problem: High dispatch latency; Solution: Preemption",
      "Problem: Excessive memory use; Solution: Swapping",
    ],
    correct: 1,
    explanation:
      "A major problem is **starvation**, where low-priority processes may never execute. The solution is **aging**, which gradually increases the priority of processes that wait in the system for a long time.",
  },
  {
    q: "How does the size of the **time quantum (q)** affect Round Robin (RR) scheduling?",
    options: [
      "If 'q' is extremely large, RR becomes FCFS",
      "If 'q' is extremely small, it results in very high context-switch overhead",
      "The time quantum should be large with respect to the context-switch time",
      "All of the above",
    ],
    correct: 3,
    explanation:
      "If the quantum is too large, RR behaves like FCFS. If it is too small, the CPU spends too much time on context-switch overhead. Ideally, the quantum should be large compared to the time it takes to switch contexts.",
  },
  {
    q: "What are the specific tasks performed by the **dispatcher**?",
    options: [
      "Selecting the next process from the ready queue",
      "Switching context and switching to user mode",
      "Jumping to the proper location in the user program to restart it",
      "Both B and C",
    ],
    correct: 3,
    explanation:
      "While the scheduler *selects* the process, the dispatcher is the module that actually gives control of the CPU to that process by switching context, switching to user mode, and jumping to the correct instruction.",
  },
  {
    q: "What is an advantage of having different time-quantum sizes at different levels of a **multilevel queueing system**?",
    options: [
      "It allows for better process mix by giving interactive processes smaller quantums for frequent servicing",
      "It eliminates the need for priority numbers",
      "It ensures that no process ever enters the waiting state",
      "It reduces the amount of memory needed for the PCB",
    ],
    correct: 0,
    explanation:
      "Interactive processes (like editors) can be placed in queues with small quantums for faster response, while processes with no need for frequent servicing can have larger quantums to reduce context-switch overhead.",
  },
];
