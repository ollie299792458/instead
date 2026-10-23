import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { ChecklistItem, ChecklistListType, EffortTag } from '../types/instead';
import { DIY_SUGGESTIONS, TASK_SUGGESTIONS } from '../db/seed';

interface ChecklistModalProps {
  visible: boolean;
  onClose: () => void;
  listType: ChecklistListType;
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (title: string, listType: ChecklistListType, effort: EffortTag, room?: string) => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  visible,
  onClose,
  listType,
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedEffort, setSelectedEffort] = useState<EffortTag>('5 min');
  const [selectedRoom, setSelectedRoom] = useState<string>('Home');

  const filteredItems = items.filter((i) => i.listType === listType);
  const suggestions = listType === 'flat_todo' ? DIY_SUGGESTIONS : TASK_SUGGESTIONS;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddItem(newTitle.trim(), listType, selectedEffort, selectedRoom);
    setNewTitle('');
  };

  const handlePickSuggestion = (title: string, effort: EffortTag, room: string) => {
    onAddItem(title, listType, effort, room);
  };

  const effortColors: Record<EffortTag, string> = {
    '5 min': '#10B981',
    '15 min': '#F59E0B',
    'Weekend': '#8B5CF6',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {listType === 'flat_todo' ? 'DIY & Home Projects' : 'Quick To-Do List'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {listType === 'flat_todo'
                  ? 'Pick one small project or job to tackle instead of scrolling'
                  : 'Get one lingering task off your mind'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Starter Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionLabel}>One-Tap Starter Ideas:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {suggestions.map((sug) => (
                <TouchableOpacity
                  key={sug.id}
                  style={styles.suggestionChip}
                  onPress={() => handlePickSuggestion(sug.title, sug.effort, sug.roomOrArea)}
                >
                  <Text style={styles.chipText}>+ {sug.title}</Text>
                  <Text style={[styles.chipBadge, { color: effortColors[sug.effort] }]}>
                    {sug.effort}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Add custom item form */}
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder={listType === 'flat_todo' ? 'e.g. Fix bathroom towel rack...' : 'e.g. Reply to landlord...'}
              placeholderTextColor="#6B7280"
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleAdd}
            />
            <View style={styles.formRow}>
              <View style={styles.effortSelector}>
                {(['5 min', '15 min', 'Weekend'] as EffortTag[]).map((eff) => (
                  <TouchableOpacity
                    key={eff}
                    style={[
                      styles.effortBtn,
                      selectedEffort === eff && { backgroundColor: effortColors[eff] },
                    ]}
                    onPress={() => setSelectedEffort(eff)}
                  >
                    <Text
                      style={[
                        styles.effortBtnText,
                        selectedEffort === eff && styles.effortBtnTextActive,
                      ]}
                    >
                      {eff}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Checklist items list */}
          <FlatList
            data={filteredItems}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No open items. Tap a starter idea above!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.itemRow, item.completed && styles.itemRowCompleted]}>
                <TouchableOpacity
                  style={styles.checkboxTouch}
                  onPress={() => onToggleItem(item.id)}
                >
                  <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                    {item.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]}>
                      {item.title}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={[styles.itemEffort, { color: effortColors[item.effort] }]}>
                        {item.effort}
                      </Text>
                      {item.roomOrArea && (
                        <Text style={styles.itemRoom}>• {item.roomOrArea}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeleteItem(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
  },
  closeBtnText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  suggestionChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chipText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  chipBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addForm: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    color: '#F9FAFB',
    fontSize: 15,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  effortSelector: {
    flexDirection: 'row',
  },
  effortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#374151',
    marginRight: 6,
  },
  effortBtnText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  effortBtnTextActive: {
    color: '#111827',
  },
  addBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemRowCompleted: {
    opacity: 0.5,
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    color: '#F9FAFB',
    fontSize: 15,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemEffort: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemRoom: {
    color: '#9CA3AF',
    fontSize: 11,
    marginLeft: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
