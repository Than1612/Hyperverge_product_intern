import React from 'react';
import { Platform } from 'react-native';

interface VoiceRecognitionProps {
  onResult: (text: string) => void;
  onEnd: () => void;
}

// Minimal no-op voice recognition stub
// Replace with actual implementation (e.g., react-native-voice) when needed
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ onResult, onEnd }) => {
  React.useEffect(() => {
    // No-op: immediately end session on web/unsupported
    if (Platform.OS === 'web') {
      onEnd();
    }
  }, [onEnd]);

  return null;
};

export default VoiceRecognition;
