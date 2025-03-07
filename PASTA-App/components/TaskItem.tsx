import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import type { Task } from '@/hooks/useTasks';

type TaskItemProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6366f1';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'personal':
        return 'Personal';
      case 'work':
        return 'Work';
      case 'shopping':
        return 'Shopping';
      case 'health':
        return 'Health';
      case 'other':
        return 'Other';
      default:
        return 'Other';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          task.completed && styles.checkboxCompleted,
          { borderColor: getPriorityColor(task.priority) },
        ]}
        onPress={onToggle}>
        {task.completed && <Check size={16} color="#fff" />}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            task.completed && styles.titleCompleted,
          ]}>
          {task.title}
        </Text>
        
        <View style={styles.details}>
          <Text style={styles.date}>
            {formatDate(task.dueDate)}
          </Text>
          
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: task.completed ? '#e2e8f0' : '#f1f5f9' },
            ]}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(task.category)}
            </Text>
          </View>
          
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) + '20' },
            ]}>
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(task.priority) },
              ]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 size={18} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  deleteButton: {
    padding: 8,
  },
});

export default TaskItem;