import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Flag, X } from 'lucide-react-native';

type PrioritySelectorProps = {
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
};

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onSelectPriority,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
  ];

  const selectedPriorityObj = priorities.find(p => p.value === selectedPriority) || priorities[1];

  return (
    <>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => setModalVisible(true)}
      >
        <Flag size={20} color={selectedPriorityObj.color} />
        <Text style={styles.optionText}>
          {selectedPriorityObj.label} Priority
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Priority</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={styles.priorityOption}
                onPress={() => {
                  onSelectPriority(priority.value);
                  setModalVisible(false);
                }}
              >
                <Flag size={20} color={priority.color} />
                <Text style={styles.priorityText}>{priority.label}</Text>
                {selectedPriority === priority.value && (
                  <View style={[styles.selectedIndicator, { backgroundColor: priority.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  priorityText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
});

export default PrioritySelector;