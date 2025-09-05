import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card, Button, TextInput, Chip, ProgressBar, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { theme } from '../styles/theme';
import VoiceRecognition from '../components/VoiceRecognition';

const { width } = Dimensions.get('window');

interface LoanApplicationForm {
  amount: number;
  purpose: string;
  duration: number;
  monthlyIncome: number;
  occupation: string;
  familyMembers: number;
  emergencyContact: string;
}

const LoanApplicationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOnline, addPendingAction } = useOffline();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceResult, setVoiceResult] = useState('');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<LoanApplicationForm>({
    defaultValues: {
      amount: 10000,
      purpose: '',
      duration: 12,
      monthlyIncome: 0,
      occupation: '',
      familyMembers: 1,
      emergencyContact: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedPurpose = watch('purpose');

  const loanPurposes = [
    { id: 'agriculture', label: t('agriculture'), icon: '🌾' },
    { id: 'homeImprovement', label: t('homeImprovement'), icon: '🏠' },
    { id: 'business', label: t('business'), icon: '💼' },
    { id: 'vehicle', label: t('vehicle'), icon: '🚗' },
    { id: 'education', label: t('education'), icon: '📚' },
    { id: 'medical', label: t('medical'), icon: '🏥' },
    { id: 'other', label: t('other'), icon: '📋' },
  ];

  const occupations = [
    { id: 'farmer', label: 'Farmer' },
    { id: 'smallBusiness', label: 'Small Business Owner' },
    { id: 'dailyWage', label: 'Daily Wage Worker' },
    { id: 'government', label: 'Government Employee' },
    { id: 'private', label: 'Private Employee' },
    { id: 'selfEmployed', label: 'Self Employed' },
    { id: 'other', label: 'Other' },
  ];

  const handleVoiceResult = (result: string) => {
    setVoiceResult(result);
    if (currentStep === 1) {
      // Parse amount from voice
      const amountMatch = result.match(/(\d+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1]);
        if (amount >= 5000 && amount <= 100000) {
          setValue('amount', amount);
        }
      }
    } else if (currentStep === 2) {
      // Parse purpose from voice
      const purpose = loanPurposes.find(p => 
        result.toLowerCase().includes(p.label.toLowerCase()) ||
        result.toLowerCase().includes(p.id.toLowerCase())
      );
      if (purpose) {
        setValue('purpose', purpose.id);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: LoanApplicationForm) => {
    try {
      if (isOnline) {
        // Submit online
        // await loanApi.submitApplication(data);
        Alert.alert(t('success'), 'Loan application submitted successfully!');
        navigation.navigate('LoanStatus' as never);
      } else {
        // Queue for offline sync
        addPendingAction('SUBMIT_LOAN_APPLICATION', data);
        Alert.alert(
          t('offline'),
          'Your application will be submitted when you are online.',
          [{ text: t('ok'), onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert(t('error'), 'Failed to submit application. Please try again.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How much do you need?</Text>
      <Text style={styles.stepSubtitle}>₹5,000 - ₹100,000</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amountValue}>₹{watchedAmount.toLocaleString()}</Text>
        <Slider
          style={styles.slider}
          minimumValue={5000}
          maximumValue={100000}
          step={1000}
          value={watchedAmount}
          onValueChange={(value) => setValue('amount', value)}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.outlineVariant}
          thumbTintColor={theme.colors.primary}
        />
        <View style={styles.amountRange}>
          <Text style={styles.amountRangeText}>₹5,000</Text>
          <Text style={styles.amountRangeText}>₹100,000</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.voiceButton}
        onPress={() => setIsVoiceActive(!isVoiceActive)}
      >
        <IconButton icon="microphone" size={24} iconColor={theme.colors.primary} />
        <Text style={styles.voiceButtonText}>{t('speakAmount')}</Text>
      </TouchableOpacity>

      {isVoiceActive && (
        <VoiceRecognition
          onResult={handleVoiceResult}
          onEnd={() => setIsVoiceActive(false)}
        />
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What is the purpose?</Text>
      <Text style={styles.stepSubtitle}>Select the main reason for your loan</Text>
      
      <View style={styles.purposeGrid}>
        {loanPurposes.map((purpose) => (
          <TouchableOpacity
            key={purpose.id}
            style={[
              styles.purposeCard,
              watchedPurpose === purpose.id && styles.purposeCardSelected,
            ]}
            onPress={() => setValue('purpose', purpose.id)}
          >
            <Text style={styles.purposeIcon}>{purpose.icon}</Text>
            <Text style={[
              styles.purposeLabel,
              watchedPurpose === purpose.id && styles.purposeLabelSelected,
            ]}>
              {purpose.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.voiceButton}
        onPress={() => setIsVoiceActive(!isVoiceActive)}
      >
        <IconButton icon="microphone" size={24} iconColor={theme.colors.primary} />
        <Text style={styles.voiceButtonText}>{t('speakPurpose')}</Text>
      </TouchableOpacity>

      {isVoiceActive && (
        <VoiceRecognition
          onResult={handleVoiceResult}
          onEnd={() => setIsVoiceActive(false)}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Help us understand your financial situation</Text>
      
      <Controller
        control={control}
        name="monthlyIncome"
        rules={{ required: 'Monthly income is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label={t('monthlyIncome')}
            value={value.toString()}
            onChangeText={(text) => onChange(parseInt(text) || 0)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            error={!!errors.monthlyIncome}
          />
        )}
      />

      <Controller
        control={control}
        name="occupation"
        rules={{ required: 'Occupation is required' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.occupationContainer}>
            <Text style={styles.occupationLabel}>Occupation</Text>
            <View style={styles.occupationGrid}>
              {occupations.map((occupation) => (
                <Chip
                  key={occupation.id}
                  selected={value === occupation.id}
                  onPress={() => onChange(occupation.id)}
                  style={styles.occupationChip}
                >
                  {occupation.label}
                </Chip>
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="familyMembers"
        render={({ field: { onChange, value } }) => (
          <View style={styles.familyContainer}>
            <Text style={styles.familyLabel}>Family Members: {value}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={value}
              onValueChange={onChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.outlineVariant}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        )}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Emergency Contact</Text>
      <Text style={styles.stepSubtitle}>Someone we can contact in case of emergency</Text>
      
      <Controller
        control={control}
        name="emergencyContact"
        rules={{ 
          required: 'Emergency contact is required',
          pattern: {
            value: /^[6-9]\d{9}$/,
            message: 'Please enter a valid 10-digit mobile number'
          }
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Emergency Contact Number"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              error={!!errors.emergencyContact}
            />
            {errors.emergencyContact?.message ? (
              <Text style={{ color: theme.colors.error, marginTop: -8, marginBottom: 8 }}>
                {errors.emergencyContact.message}
              </Text>
            ) : null}
          </>
        )}
      />

      <Text style={styles.emergencyNote}>
        This should be a family member or close friend who can be reached in case of emergency.
      </Text>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review Your Application</Text>
      <Text style={styles.stepSubtitle}>Please review all details before submitting</Text>
      
      <Card style={styles.reviewCard}>
        <Card.Content>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Loan Amount</Text>
            <Text style={styles.reviewValue}>₹{watchedAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Purpose</Text>
            <Text style={styles.reviewValue}>
              {loanPurposes.find(p => p.id === watchedPurpose)?.label}
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Duration</Text>
            <Text style={styles.reviewValue}>12 months</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Monthly Income</Text>
            <Text style={styles.reviewValue}>₹{watch('monthlyIncome').toLocaleString()}</Text>
          </View>
        </Card.Content>
      </Card>

      <Text style={styles.termsText}>
        By submitting this application, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Loan Application</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep} of 5
        </Text>
        <ProgressBar
          progress={currentStep / 5}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 1 && (
          <Button
            mode="outlined"
            onPress={prevStep}
            style={styles.navButton}
          >
            {t('back')}
          </Button>
        )}
        <Button
          mode="contained"
          onPress={currentStep === 5 ? handleSubmit(onSubmit) : nextStep}
          style={[styles.navButton, { flex: 1 }]}
          disabled={currentStep === 2 && !watchedPurpose}
        >
          {currentStep === 5 ? t('submit') : t('next')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
    letterSpacing: 0.2,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderBottomColor: theme.colors.outlineVariant,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepContainer: {
    paddingVertical: 24,
    gap: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.onSurface,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 24,
    lineHeight: 22,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  slider: {
    width: width - 64,
    height: 40,
  },
  amountRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 64,
    marginTop: 8,
  },
  amountRangeText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  purposeCard: {
    width: (width - 64) / 2,
    aspectRatio: 1.2,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  purposeCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  purposeIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  purposeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  purposeLabelSelected: {
    color: theme.colors.primary,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 10,
    marginTop: 16,
  },
  voiceButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  occupationContainer: {
    marginBottom: 16,
  },
  occupationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  occupationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occupationChip: {
    marginBottom: 8,
    borderRadius: 16,
  },
  familyContainer: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
  },
  familyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  emergencyNote: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 12,
  },
  reviewCard: {
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outlineVariant,
  },
  reviewLabel: {
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  termsText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: theme.colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  navButton: {
    borderRadius: 10,
  },
});

export default LoanApplicationScreen;
