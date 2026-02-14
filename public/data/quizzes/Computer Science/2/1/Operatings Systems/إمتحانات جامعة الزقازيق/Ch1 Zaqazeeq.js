export const questions = [
  {
    q: "In the context of operating systems, what is the main purpose of a kernel?",
    options: [
      "To provide a user interface for interacting with the system",
      "To manage the system’s CPU, memory, and other hardware resources",
      "To compile and execute user programs",
      "To create and manage network connections",
    ],
    correct: 1,
    explanation:
      "The kernel is defined as 'the one program running at all times on the computer'.  The operating system (specifically the kernel) acts as a resource allocator that manages all resources, including CPU, memory, and I/O devices, to ensure efficient operation.",
  },
  {
    q: "In a time-sharing operating system, CPU scheduling is important to:",
    options: [
      "Minimize memory usage by each process",
      "Allow multiple users to interact with the computer simultaneously",
      "Restrict the number of active processes to one",
      "Reduce the need for peripheral devices",
    ],
    correct: 1,
    explanation:
      "Time-sharing (or multitasking) is a logical extension of multiprogramming where the CPU switches jobs so frequently that users can interact with each job while it is running.  This creates an interactive computing environment where shared resources must keep all users happy.",
  },
  {
    q: "A main benefit of multiprogramming is:",
    options: [
      "Reduced complexity of system operations",
      "Increased CPU utilization by allowing multiple programs to run concurrently",
      "Enhanced security of each process",
      "Reduced need for primary storage",
    ],
    correct: 1,
    explanation:
      "Multiprogramming is needed for efficiency because a single user cannot keep the CPU and I/O devices busy at all times.  By organizing jobs so that the CPU always has one to execute, the system achieves maximum CPU utilization.",
  },
  {
    q: "A multitasking operating system is designed to:",
    options: [
      "Execute only one task at a time",
      "Allow a single process to use all system resources",
      "Run multiple tasks concurrently by sharing resources",
      "Use more storage for each task",
    ],
    correct: 2,
    explanation:
      "Multitasking (time-sharing) allows the CPU to switch jobs frequently, enabling concurrent execution where each user has at least one program executing in memory. This involves sharing resources to facilitate interactive computing.",
  },
  {
    q: "What is the main purpose of a mode bit in an operating system?",
    options: [
      "To indicate whether the CPU is in user or kernel mode",
      "To improve memory access speed",
      "To manage file permissions",
      "To signal the end of a process",
    ],
    correct: 0,
    explanation:
      "A mode bit provided by hardware allows the system to distinguish between user mode and kernel mode. This dual-mode operation is essential for the operating system to protect itself and other system components from errant user code.",
  },
  {
    q: "The purpose of protection in an operating system is to:",
    options: [
      "Control access to system resources by processes",
      "Restrict the types of applications that can be installed",
      "Ensure efficient resource allocation",
      "Manage network communication between systems",
    ],
    correct: 0,
    explanation:
      "Protection is defined as any mechanism for controlling access of processes or users to resources defined by the operating system.  This ensures that concurrent processes do not interfere with each other.",
  },
  {
    q: "The primary purpose of an operating system is to manage hardware resources and provide an interface between users and the computer system.(T or F)",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "An operating system is defined as a program that acts as an intermediary between a user of a computer and the computer hardware.  It functions as a resource allocator that manages and controls hardware usage among various applications and users.",
  },
  {
    q: "A kernel is the central component of an operating system and provides basic services such as memory management, process scheduling, and file system handling.(T or F)",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The kernel is the one program running at all times on the computer.  In systems like UNIX, the kernel contains everything below the system-call interface, providing file systems, CPU scheduling, and memory management.",
  },
  {
    q: "A process is a program in execution that requires system resources such as CPU time, memory, and I/O devices.(T or F)",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "A process is formally defined as a 'program in execution'.  To accomplish its task, a process needs resources such as CPU, memory, I/O, and files.",
  },
  {
    q: "A multi-user operating system allows multiple users to execute programs simultaneously on the same system.(T or F)",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Shared computers, such as mainframes or minicomputers, must keep all users happy.  Time-sharing (multitasking) is the logical extension that allows multiple users to interact with the computer simultaneously.",
  },
  {
    q: "An operating system provides memory protection by preventing different processes from accessing each other's memory spaces.(T or F)",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Protection involves ensuring that all access to system resources is controlled.  The OS must ensure that concurrent processes do not interfere with each other, which includes protecting memory spaces.",
  },
  {
    q: "A system call is a request made by a program for the operating system to perform a task that the program cannot do itself.(T or F)",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "System calls provide the programming interface to the services provided by the operating system.  For example, a request to allow a user to wait for I/O completion is handled via a system call.",
  },
  {
    q: "The primary role of the file system in an operating system is to manage physical storage devices like hard drives and SSDs.(T or F)",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "This is False.  The OS provides a uniform, *logical* view of information storage by abstracting physical properties into a logical storage unit known as a file.  While the OS does manage mass storage (physical disks), the 'File-System management' specifically focuses on the logical organization, such as directories and access control, rather than the physical device management.",
  },
  {
    q: "What are the four components of computer system?",
    options: ["Hardware, Operating System, Application Programs, Users"],
    correct: 0,
    explanation:
      "A computer system can be divided into four specific components: Hardware (CPU, memory, I/O), the Operating System, Application Programs (compilers, web browsers, etc.), and Users.",
  },
];
