export const questions = [
  {
    q: "What is the primary purpose of system calls?",
    options: [
      "To provide a graphical user interface for the end user",
      "To allow user-level processes to request services of the operating system",
      "To manage the physical arrangement of files on a disk",
      "To act as a high-level programming language for application development",
    ],
    correct: 1,
    explanation:
      "System calls serve as the programming interface to the services provided by the operating system, allowing user-level processes to request specific tasks from the kernel.",
  },
  {
    q: "Which major activity is part of the operating system's process management responsibilities?",
    options: [
      "Free-space management",
      "Allocating and deallocating memory space as needed",
      "Providing mechanisms for process synchronization",
      "Disk scheduling",
    ],
    correct: 2,
    explanation:
      "The major activities for process management include the creation/deletion of processes, suspension/resumption, and providing mechanisms for process synchronization, communication, and deadlock handling.",
  },
  {
    q: "In a Unix system, which sequence of system calls is typically used to start a new process?",
    options: [
      "create() followed by start()",
      "open() followed by close()",
      "request() followed by release()",
      "fork() followed by exec()",
    ],
    correct: 3,
    explanation:
      "In Unix systems, the fork() system call clones the currently executing process, and the exec() call overlays a new executable over that process.",
  },
  {
    q: "What are the three most common Application Programming Interfaces (APIs) used to access system calls?",
    options: [
      "Win32, POSIX, and Java",
      "HTML, CSS, and JavaScript",
      "CLI, GUI, and Batch",
      "SaaS, PaaS, and IaaS",
    ],
    correct: 0,
    explanation:
      "The Win32 API is used for Windows, the POSIX API is for POSIX-based systems like Unix and Linux, and the Java API is for the Java virtual machine.",
  },
  {
    q: "Which of the following is a general method used to pass parameters to the operating system during a system call?",
    options: [
      "Passing parameters in registers",
      "Storing parameters in a memory block and passing the address in a register",
      "Pushing parameters onto a stack to be popped by the operating system",
      "All of the above",
    ],
    correct: 3,
    explanation:
      "Operating systems typically use one of three methods: registers for simple parameters, a memory block/table for larger amounts of data, or a stack-based approach.",
  },
  {
    q: "What is a significant advantage of using a microkernel approach for system structure?",
    options: [
      "It eliminates the need for message passing",
      "It is easier to extend the operating system and port it to new architectures",
      "It provides the fastest possible performance for all system services",
      "It allows all applications to run in kernel mode for better security",
    ],
    correct: 1,
    explanation:
      "Microkernels move non-essential components from the kernel to user space, making the OS easier to extend, more reliable, and simpler to port to new hardware architectures.",
  },
  {
    q: "Which operating system service provides a mechanism for processes to exchange information?",
    options: [
      "Accounting",
      "Communications",
      "Program execution",
      "Error detection",
    ],
    correct: 1,
    explanation:
      "The communications service allows processes to exchange information either on the same computer or between different systems over a network via shared memory or message passing.",
  },
  {
    q: "What is the role of a bootstrap loader during the system boot process?",
    options: [
      "To provide a command-line interface for the user",
      "To configure hardware for specific computer sites",
      "To locate the kernel, load it into memory, and start its execution",
      "To manage the power-saving features of the CPU",
    ],
    correct: 2,
    explanation:
      "The bootstrap loader is a small piece of code stored in ROM or EEPROM that initializes the system and initiates the execution of the operating system kernel.",
  },
  {
    q: "In the context of operating system debugging, what is a 'crash dump'?",
    options: [
      "A file containing error information from a failed user application",
      "A file containing kernel memory captured after an operating system failure",
      "A log file that tracks every command entered into the CLI",
      "A statistical trend analysis of the instruction pointer",
    ],
    correct: 1,
    explanation:
      "A crash dump file is generated after an operating system failure to capture kernel memory for later analysis, whereas application failures generate core dumps.",
  },
  {
    q: "What is the primary difference between the many-to-many and two-level multithreading models?",
    options: [
      "The many-to-many model does not support kernel threads",
      "The two-level model allows a user thread to be bound to a specific kernel thread",
      "The many-to-many model is only used in mobile operating systems",
      "There is no functional difference between the two models",
    ],
    correct: 1,
    explanation:
      "While both involve mapping user threads to kernel threads, the two-level model specifically allows a user-level thread to be permanently bound to a kernel thread.",
  },
];
