export const questions = [
  // =====================================================
  // PART I – Precision Definitions (NEW, non-repeated)
  // =====================================================

  {
    q: "Define Batch Operating System.",
    options: [
      "A batch operating system is an operating system that executes batches of jobs with little or no user interaction.",
    ],
    correct: 0,
    explanation:
      "Batch operating systems group similar jobs and execute them sequentially to maximize throughput. They were common in early computing systems and emphasize efficient hardware utilization over interactivity.",
  },
  {
    q: "Define Multiprogramming.",
    options: [
      "Multiprogramming is the technique of keeping multiple processes in memory simultaneously to improve CPU utilization.",
    ],
    correct: 0,
    explanation:
      "When one process waits for I/O, the CPU can be allocated to another process, thereby reducing idle time and increasing system efficiency.",
  },
  {
    q: "Define Kernel.",
    options: [
      "The kernel is the core component of the operating system that manages hardware resources and provides essential services.",
    ],
    correct: 0,
    explanation:
      "It runs in privileged mode and is responsible for CPU scheduling, memory management, device control, and system call handling.",
  },
  {
    q: "Define Trap.",
    options: [
      "A trap is a software-generated interrupt caused by an error or a system call.",
    ],
    correct: 0,
    explanation:
      "Traps transfer control to the operating system so it can handle exceptional conditions or provide requested services.",
  },
  {
    q: "Define Ready Queue.",
    options: [
      "The ready queue is a data structure that holds processes that are ready to execute but waiting for CPU allocation.",
    ],
    correct: 0,
    explanation:
      "The CPU scheduler selects processes from the ready queue according to the scheduling algorithm in use.",
  },
  {
    q: "Define CPU Burst.",
    options: [
      "A CPU burst is the period during which a process executes instructions on the CPU.",
    ],
    correct: 0,
    explanation:
      "Processes alternate between CPU bursts and I/O bursts, a behavior fundamental to CPU scheduling decisions.",
  },
  {
    q: "Define Dispatcher.",
    options: [
      "The dispatcher is the module that gives control of the CPU to the process selected by the short-term scheduler.",
    ],
    correct: 0,
    explanation:
      "It performs context switching, switches to user mode, and jumps to the appropriate instruction of the selected process.",
  },
  {
    q: "Define Turnaround Time.",
    options: [
      "Turnaround time is the total time taken from process submission to process completion.",
    ],
    correct: 0,
    explanation:
      "It includes waiting time, execution time, and I/O time, and is a key metric in evaluating scheduling algorithms.",
  },
  {
    q: "Define Multicore System.",
    options: [
      "A multicore system is a computing system with multiple processing cores on a single chip.",
    ],
    correct: 0,
    explanation:
      "Multicore systems enable parallel execution of threads and processes, improving performance and energy efficiency.",
  },
  {
    q: "Define Speedup.",
    options: [
      "Speedup is the ratio of the execution time of a task on a single processor to its execution time on multiple processors.",
    ],
    correct: 0,
    explanation:
      "It is used in conjunction with Amdahl’s Law to evaluate the effectiveness of parallelization.",
  },

  // =====================================================
  // PART II – Comparative & Mechanism Essays (NEW)
  // =====================================================

  {
    q: "Compare Single-Processor Systems and Multiprocessor Systems in terms of throughput and scalability.",
    options: [
      "Single-processor systems execute one instruction stream, while multiprocessor systems contain multiple CPUs.",
    ],
    correct: 0,
    explanation:
      "Multiprocessor systems provide higher throughput and improved scalability by allowing parallel execution. However, they introduce challenges such as synchronization, load balancing, and increased system complexity.",
  },
  {
    q: "Explain the role of interrupts in modern operating systems and why they are essential.",
    options: [
      "Interrupts are signals that transfer control to the operating system when an event occurs.",
    ],
    correct: 0,
    explanation:
      "Interrupts allow the CPU to respond to asynchronous events such as I/O completion and timers. They enable efficient CPU utilization by eliminating busy waiting and supporting preemptive scheduling.",
  },
  {
    q: "Contrast I/O-bound processes and CPU-bound processes and explain how their behavior affects scheduling decisions.",
    options: [
      "I/O-bound processes spend more time waiting for I/O, while CPU-bound processes spend more time executing on the CPU.",
    ],
    correct: 0,
    explanation:
      "Schedulers favor I/O-bound processes to improve responsiveness and system utilization. CPU-bound processes benefit from longer time quanta to reduce context-switch overhead.",
  },
  {
    q: "Explain how exponential averaging is used to predict CPU burst times and why it is necessary.",
    options: [
      "Exponential averaging predicts future CPU bursts based on past behavior.",
    ],
    correct: 0,
    explanation:
      "Since exact CPU burst lengths are unknown, exponential averaging provides a practical estimation method by weighting recent bursts more heavily, enabling approximate SJF scheduling.",
  },
  {
    q: "Compare Preemptive Priority Scheduling and Non-Preemptive Priority Scheduling.",
    options: [
      "Preemptive priority scheduling can interrupt a running process, while non-preemptive priority scheduling cannot.",
    ],
    correct: 0,
    explanation:
      "Preemptive priority scheduling improves responsiveness but can cause starvation without aging. Non-preemptive priority scheduling reduces overhead but may delay high-priority processes.",
  },
  {
    q: "Explain why context switching time must be minimized in operating system design.",
    options: [
      "Context switching time represents overhead during which no useful work is done.",
    ],
    correct: 0,
    explanation:
      "Frequent or slow context switches reduce CPU efficiency and system throughput. Efficient OS design minimizes context-switch overhead to improve overall performance.",
  },
  {
    q: "Using scheduling metrics, justify why no single CPU scheduling algorithm is optimal for all systems.",
    options: [
      "Different scheduling algorithms optimize different performance criteria.",
    ],
    correct: 0,
    explanation:
      "Some algorithms favor throughput, others minimize waiting or response time. System goals such as interactivity or batch processing determine which algorithm is most appropriate.",
  },
  {
    q: "Justify the use of threads instead of processes for implementing parallelism in modern applications.",
    options: ["Threads are lighter-weight execution units than processes."],
    correct: 0,
    explanation:
      "Threads share an address space, enabling faster communication and lower overhead. This makes them ideal for parallelism in multicore systems compared to heavier process-based designs.",
  },
];
