import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Tag, X } from 'lucide-react-native';

type CategorySelectorProps = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const categories = [
    { value: 'personal', label: 'Personal', color: '#6366f1' },
    { value: 'work', label: 'Work', color: '#0ea5e9' },
    { value: 'shopping', label: 'Shopping', color: '#f59e0b' },
    { value: 'health', label: 'Health', color: '#10b981' },
    { value: 'other', label: 'Other', color: '#64748b' },
  ];

  const selectedCategoryObj = categories.find(c => c.value === selectedCategory) || categories[0];

  return (
    <>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => setModalVisible(true)}
      >
        <Tag size={20} color={selectedCategoryObj.color} />
        <Text style={styles.optionText}>
          {selectedCategoryObj.label}
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
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={styles.categoryOption}
                onPress={() => {
                  onSelectCategory(category.value);
                  setModalVisible(false);
                }}
              >
                <Tag size={20} color={category.color} />
                <Text style={styles.categoryText}>{category.label}</Text>
                {selectedCategory === category.value && (
                  <View style={[styles.selectedIndicator, { backgroundColor: category.color }]} />
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
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryText: {
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

export default CategorySelector;