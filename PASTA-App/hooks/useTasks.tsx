import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the Task type
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other';
  createdAt: string;
};

// Define the context type
type TasksContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  getTasksByCategory: (category: string) => Task[];
  getTasksByPriority: (priority: string) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
};

// Create the context with default values
const TasksContext = createContext<TasksContextType>({
  tasks: [],
  addTask: () => {},
  toggleTask: () => {},
  deleteTask: () => {},
  updateTask: () => {},
  getTasksByCategory: () => [],
  getTasksByPriority: () => [],
  getCompletedTasks: () => [],
  getPendingTasks: () => [],
});

// Storage key for tasks
const TASKS_STORAGE_KEY = 'todoApp.tasks';

// Provider component
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from storage on mount
  // useEffect(() => {
  //   const loadTasks = async () => {
  //     try {
  //       // For web, use localStorage
  //       if (typeof window !== 'undefined' && window.localStorage) {
  //         const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  //         if (storedTasks) {
  //           setTasks(JSON.parse(storedTasks));
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to load tasks:', error);
  //     }
  //   };

  //   loadTasks();
  // }, []);

  // // Save tasks to storage whenever they change
  // useEffect(() => {
  //   try {
  //     // For web, use localStorage
  //     if (typeof window !== 'undefined' && window.localStorage) {
  //       localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  //     }
  //   } catch (error) {
  //     console.error('Failed to save tasks:', error);
  //   }
  // }, [tasks]);

  // Add a new task
  const addTask = (task: Task) => {
    console.log("Adding Task:", task);
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, task];
      console.log("Updated Tasks:", updatedTasks);
      return updatedTasks;
    });
  };

  // Toggle task completion status
  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  // Update a task
  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      )
    );
  };

  // Get tasks by category
  const getTasksByCategory = (category: string) => {
    return tasks.filter((task) => task.category === category);
  };

  // Get tasks by priority
  const getTasksByPriority = (priority: string) => {
    return tasks.filter((task) => task.priority === priority);
  };

  // Get completed tasks
  const getCompletedTasks = () => {
    return tasks.filter((task) => task.completed);
  };

  // Get pending tasks
  const getPendingTasks = () => {
    return tasks.filter((task) => !task.completed);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        getTasksByCategory,
        getTasksByPriority,
        getCompletedTasks,
        getPendingTasks,
      }}>
      {children}
    </TasksContext.Provider>
  );
};

// Custom hook to use the tasks context
export const useTasks = () => useContext(TasksContext);