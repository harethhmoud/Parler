import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RecordingStatus } from '../types';

interface RecordButtonProps {
  status: RecordingStatus;
  onPress: () => void;
  disabled?: boolean;
}

export function RecordButton({ status, onPress, disabled }: RecordButtonProps) {
  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';
  const isPlaying = status === 'playing';

  const getButtonStyle = () => {
    if (isRecording) return [styles.button, styles.recording];
    if (isProcessing || isPlaying) return [styles.button, styles.processing];
    return [styles.button, styles.idle];
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'Recording...';
      case 'processing':
        return 'Processing...';
      case 'playing':
        return 'Playing...';
      default:
        return 'Tap to speak';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled || isProcessing || isPlaying}
        activeOpacity={0.7}
      >
        {isProcessing || isPlaying ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <View style={styles.innerCircle}>
            {isRecording && <View style={styles.recordingIndicator} />}
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  idle: {
    backgroundColor: '#3B82F6',
  },
  recording: {
    backgroundColor: '#EF4444',
  },
  processing: {
    backgroundColor: '#6B7280',
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
