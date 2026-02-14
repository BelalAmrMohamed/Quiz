export const questions = [
  {
    q: "Which of the following is a valid example of where multithreading provides better performance than a single-threaded solution?",
    options: [
      "All of these are valid examples",
      "A web server that services each request in a separate thread",
      "A parallelized matrix multiplication application",
      "An interactive GUI debugger with separate threads for user input, application execution, and performance monitoring",
    ],
    correct: 0,
    explanation:
      "All three examples demonstrate effective use of multithreading: web servers handling concurrent requests, parallel computation on data, and interactive programs with multiple simultaneous activities.",
  },
  {
    q: "What are key differences between user-level threads and kernel-level threads?",
    options: [
      "User-level threads are unknown by the kernel while kernel is aware of kernel threads; user threads are scheduled by thread library while kernel schedules kernel threads; kernel threads need not be associated with a process",
    ],
    correct: 0,
    explanation:
      "User-level threads are managed by the thread library and invisible to the kernel. Kernel threads are known to the OS, scheduled by the kernel, and are more expensive to maintain as they require kernel data structures.",
  },
  {
    q: "What does context switching between kernel-level threads typically require?",
    options: [
      "Saving CPU registers from the thread being switched out and restoring CPU registers of the new thread being scheduled",
      "Copying the entire memory space",
      "Restarting the processor",
      "Reloading the operating system",
    ],
    correct: 0,
    explanation:
      "Context switching between kernel threads involves saving and restoring CPU register values to switch execution from one thread to another.",
  },
  {
    q: "Thread creation uses fewer resources than process creation.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Creating a process requires allocating a PCB (process control block) with memory map, file lists, and environment variables. Thread creation only requires a small data structure for registers, stack, and priority, making it much more lightweight.",
  },
  {
    q: "Why is it necessary to bind a real-time thread to an LWP (Lightweight Process) in a many-to-many threading model?",
    options: [
      "To ensure the thread can run with minimal delay once scheduled, without waiting for an available LWP",
    ],
    correct: 0,
    explanation:
      "Timing is crucial for real-time applications. Without binding, a real-time thread may have to wait for an LWP to become available before running. Binding ensures the thread can run immediately when scheduled, providing the predictable timing required for real-time systems.",
  },
  {
    q: "What happens to a real-time thread that is not bound to an LWP when it blocks (e.g., for I/O)?",
    options: [
      "When it's ready to run again, it must wait to be attached to an LWP, causing delay",
      "It immediately resumes execution",
      "It terminates",
      "It's automatically promoted to a kernel thread",
    ],
    correct: 0,
    explanation:
      "When an unbound real-time thread blocks, the LWP it was using gets assigned to another thread. When the real-time thread is ready to run again, it must wait for an available LWP, introducing unpredictable delay that's problematic for real-time systems.",
  },
];
