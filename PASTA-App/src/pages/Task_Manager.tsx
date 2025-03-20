import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Plus, X, Calendar, Clock, Flag } from 'lucide-react-native';
import { useTasks } from '@/hooks/useTasks';
import TaskItem from '@/components/TaskItem';
import DateTimePicker from '@/components/DateTimePicker';
import PrioritySelector from '@/components/PrioritySelector';
import CategorySelector from '@/components/CategorySelector';

export default function TodayScreen() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter tasks for today
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    
    addTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      dueDate: selectedDate.toISOString(),
      priority: selectedPriority,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
    });
    
    setNewTaskTitle('');
    setSelectedDate(new Date());
    setSelectedPriority('medium');
    setSelectedCategory('personal');
    setIsAddingTask(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Tasks</Text>
        <Text style={styles.date}>{formatDate(new Date())}</Text>
      </View>

      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {todayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks for today</Text>
            <Text style={styles.emptyStateSubtext}>Add a task to get started</Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        )}
      </ScrollView>

      {isAddingTask ? (
        <View style={styles.addTaskContainer}>
          <View style={styles.addTaskHeader}>
            <Text style={styles.addTaskTitle}>New Task</Text>
            <TouchableOpacity onPress={() => setIsAddingTask(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="What do you need to do?"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            autoFocus
          />
          
          <View style={styles.taskOptions}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#6366f1" />
              <Text style={styles.optionText}>
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <PrioritySelector
              selectedPriority={selectedPriority}
              onSelectPriority={setSelectedPriority}
            />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTask}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsAddingTask(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addTaskContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  addTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addTaskTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 15,
    backgroundColor: '#f8fafc',
  },
  taskOptions: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});