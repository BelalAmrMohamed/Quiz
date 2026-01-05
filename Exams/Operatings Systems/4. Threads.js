export const questions = [
  {
    q: "What is the fundamental definition of a **thread** in an operating system?",
    options: [
      "A heavy-weight unit of work that requires its own memory map and open files",
      "A fundamental unit of CPU utilization that forms the basis of multithreaded computer systems",
      "A passive entity stored on a disk, such as an executable file",
      "A mechanism used solely for communication between different computer systems",
    ],
    correct: 1,
    explanation:
      "A thread is described as the **fundamental unit of CPU utilization**. It is considered **light-weight** compared to process creation, which is heavy-weight.",
  },
  {
    q: "Which of the following are listed as **benefits** of multithreaded programming?",
    options: [
      "Responsiveness",
      "Resource Sharing",
      "Economy",
      "Scalability",
      "All of the above",
    ],
    correct: 4,
    explanation:
      "The sources identify four major benefits: **Responsiveness** (allowing continued execution if part of a process is blocked), **Resource Sharing** (threads share memory and resources of the process), **Economy** (thread switching has lower overhead than context switching), and **Scalability** (multiprocessor architectures).",
  },
  {
    q: "What is a major challenge in **multicore programming** according to the sources?",
    options: [
      "Dividing activities into separate concurrent tasks",
      "Ensuring balance so tasks perform equal work",
      "Managing data splitting and data dependency",
      "Testing and debugging concurrent programs",
      "All of the above",
    ],
    correct: 4,
    explanation:
      "Challenges for multicore programming include **dividing activities**, **balance**, **data splitting**, **data dependency**, and **testing/debugging**.",
  },
  {
    q: "According to **Amdahl's Law**, what happens to the speedup gain as the number of processing cores (N) approaches infinity?",
    options: [
      "Speedup approaches infinity",
      "Speedup approaches the number of threads in the pool",
      "Speedup approaches 1 / S, where S is the serial portion of the application",
      "Speedup becomes zero due to synchronization overhead",
    ],
    correct: 2,
    explanation:
      "Amdahl's Law identifies that as the number of cores (N) approaches infinity, the **speedup approaches 1 / S**, implying the serial portion of an application has a disproportionate effect on performance.",
  },
  {
    q: "In the **Many-to-One** multithreading model, why might multiple threads fail to run in parallel on a multicore system?",
    options: [
      "User-level threads are too heavy-weight for multicore systems",
      "Only one thread can be in the kernel at a time",
      "The model does not support thread libraries",
      "Kernel threads are unable to see user-level tasks",
    ],
    correct: 1,
    explanation:
      "In the **Many-to-One** model, multiple threads may not run in parallel on multicore systems because **only one thread may be in the kernel at a time**.",
  },
  {
    q: "Which multithreading model is used by **Windows** and **Linux**?",
    options: ["Many-to-One", "One-to-One", "Many-to-Many", "Two-level"],
    correct: 1,
    explanation:
      "The **One-to-One** model, where each user-level thread maps to a kernel thread, is implemented by both **Windows** and **Linux**.",
  },
  {
    q: "What is the primary difference between **Pthreads** and its implementation?",
    options: [
      "Pthreads is a library entirely in user space",
      "Pthreads is a specification for thread behavior, not an implementation",
      "Pthreads is only available for Windows systems",
      "There is no difference; Pthreads is a specific piece of software",
    ],
    correct: 1,
    explanation:
      "Pthreads refers to a **POSIX standard API** for thread creation and synchronization. It is a **specification**, and the implementation is up to the developers of the library.",
  },
  {
    q: "What is an advantage of using a **Thread Pool**?",
    options: [
      "It allows the kernel to manage user threads without a library",
      "Creating a new thread is always faster than using an existing one",
      "It allows the number of threads to be bound to the size of the pool",
      "It eliminates the need for thread-local storage",
    ],
    correct: 2,
    explanation:
      "Thread pools provide several advantages: it is usually **faster to service a request** with an existing thread and it allows the application to **bind the number of threads** to the pool size.",
  },
  {
    q: "How does **deferred cancellation** differ from **asynchronous cancellation**?",
    options: [
      "Asynchronous cancellation terminates the target thread immediately",
      "Deferred cancellation allows the thread to check if it should be cancelled at a 'cancellation point'",
      "Asynchronous cancellation is the default type in Pthreads",
      "Both A and B are correct",
    ],
    correct: 3,
    explanation:
      "Asynchronous cancellation **terminates the thread immediately**, while **deferred cancellation** allows the thread to periodically check for a cancellation request at specific points.",
  },
  {
    q: "What is the purpose of **Thread-Local Storage (TLS)**?",
    options: [
      "To provide a shared memory segment for all threads in a process",
      "To allow each thread to have its own unique copy of certain data across function invocations",
      "To act as a temporary stack for function parameters that is deleted upon return",
      "To store configuration information in a global registry",
    ],
    correct: 1,
    explanation:
      "TLS allows each thread to have its **own copy of data** that is visible across function invocations, which is different from local variables that only exist during a single function call.",
  },
  {
    q: "In the context of the Many-to-Many and Two-level models, what is a **Lightweight Process (LWP)**?",
    options: [
      "A user-level thread that requires no kernel support",
      "An intermediate data structure that appears as a virtual processor to the thread library",
      "A special type of signal handler used in Linux",
      "A kernel thread that has been bound to a user process",
    ],
    correct: 1,
    explanation:
      "An **LWP** is an intermediate data structure between user and kernel threads. To the user-level thread library, it **appears to be a virtual processor** on which the process can schedule user threads.",
  },
  {
    q: "Which data structure in the **Windows** thread implementation is stored in **user space**?",
    options: [
      "ETHREAD (executive thread block)",
      "KTHREAD (kernel thread block)",
      "TEB (thread environment block)",
      "The kernel-mode stack",
    ],
    correct: 2,
    explanation:
      "The **TEB** (thread environment block) contains the thread ID, user-mode stack, and thread-local storage, and is located in **user space**.",
  },
  {
    q: "How are threads created in the **Linux** operating system?",
    options: [
      "Using the fork() system call exclusively",
      "Through the CreateThread() API",
      "Via the clone() system call, which allows sharing of address space",
      "Linux does not support threads at the kernel level",
    ],
    correct: 2,
    explanation:
      "Linux refers to threads as 'tasks' and uses the **clone() system call**, which allows a child task to **share the address space** of the parent task.",
  },
];
