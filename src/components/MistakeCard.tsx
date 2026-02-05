import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mistake } from '../types';

interface MistakeCardProps {
  mistake: Mistake;
  index: number;
}

export function MistakeCard({ mistake, index }: MistakeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>What you said:</Text>
        <Text style={styles.original}>{mistake.original}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Correction:</Text>
        <Text style={styles.correction}>{mistake.correction}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Explanation:</Text>
        <Text style={styles.explanation}>{mistake.explanation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#3B82F6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  original: {
    fontSize: 16,
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  correction: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  explanation: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
