import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card, Button, IconButton, Badge, ProgressBar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { isOnline, syncPendingActions } = useOffline();
  const { currentLanguage } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [creditScore, setCreditScore] = useState(720);
  const [activeLoans, setActiveLoans] = useState([
    {
      id: '1',
      amount: 25000,
      status: 'approved',
      disbursedDate: '2024-01-15',
      dueDate: '2024-02-15',
      remainingAmount: 25000,
    },
  ]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      await refreshUser();
      // Load additional data like credit score, active loans, etc.
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserData();
      if (isOnline) {
        await syncPendingActions();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return '#4CAF50';
    if (score >= 650) return '#FF9800';
    return '#F44336';
  };

  const getCreditScoreStars = (score: number) => {
    const stars = Math.floor(score / 150);
    return '★'.repeat(Math.min(stars, 5));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return t('loanApproved');
      case 'pending': return t('underReview');
      case 'rejected': return t('loanRejected');
      default: return status;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              {t('welcome')}, {user?.name || 'User'}! 👋
            </Text>
            <View style={styles.creditScoreContainer}>
              <Text style={styles.creditScoreLabel}>{t('creditScore')}</Text>
              <View style={styles.creditScoreRow}>
                <Text style={[styles.creditScoreValue, { color: getCreditScoreColor(creditScore) }]}>
                  {creditScore}
                </Text>
                <Text style={styles.creditScoreStars}>
                  {getCreditScoreStars(creditScore)}
                </Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="bell-outline"
            size={24}
            iconColor={theme.colors.onPrimary}
            onPress={() => navigation.navigate('Notifications' as never)}
          />
        </View>
      </LinearGradient>

      {/* Connection Status */}
      {!isOnline && (
        <Card style={styles.offlineCard}>
          <Card.Content style={styles.offlineContent}>
            <IconButton icon="wifi-off" size={20} iconColor={theme.colors.error} />
            <Text style={styles.offlineText}>{t('offline')}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('LoanApplication' as never)}
        >
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.secondaryContainer]}
            style={styles.quickActionGradient}
          >
            <IconButton icon="cash-plus" size={32} iconColor={theme.colors.onSecondary} />
            <Text style={styles.quickActionText}>{t('applyLoan')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('LoanStatus' as never)}
        >
          <LinearGradient
            colors={[theme.colors.tertiary, theme.colors.tertiaryContainer]}
            style={styles.quickActionGradient}
          >
            <IconButton icon="chart-line" size={32} iconColor={theme.colors.onTertiary} />
            <Text style={styles.quickActionText}>{t('checkStatus')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Active Loans */}
      {activeLoans.length > 0 && (
        <Card style={styles.loansCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Active Loans</Text>
            {activeLoans.map((loan) => (
              <View key={loan.id} style={styles.loanItem}>
                <View style={styles.loanInfo}>
                  <Text style={styles.loanAmount}>₹{loan.amount.toLocaleString()}</Text>
                  <Badge
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) }]}
                  >
                    {getStatusText(loan.status)}
                  </Badge>
                </View>
                <View style={styles.loanDetails}>
                  <Text style={styles.loanDetailText}>
                    {t('amountDisbursed')}: {new Date(loan.disbursedDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.loanDetailText}>
                    {t('repaymentDue')}: {new Date(loan.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <ProgressBar
                  progress={1 - (loan.remainingAmount / loan.amount)}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Button
                  mode="contained"
                  onPress={() => (navigation as any).navigate('LoanDetails', { loanId: loan.id })}
                  style={styles.loanButton}
                >
                  {t('makePayment')}
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Recent Activity */}
      <Card style={styles.activityCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <IconButton icon="check-circle" size={20} iconColor={theme.colors.primary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{t('loanApproved')} - ₹25,000</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <IconButton icon="clock-outline" size={20} iconColor={theme.colors.secondary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{t('paymentDue')} in 5 days</Text>
              <Text style={styles.activityTime}>₹2,500 due on Feb 15</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Voice Assistant */}
      <TouchableOpacity
        style={styles.voiceAssistantButton}
        onPress={() => navigation.navigate('VoiceAssistant' as never)}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.voiceAssistantGradient}
        >
          <IconButton icon="microphone" size={24} iconColor={theme.colors.onPrimary} />
          <Text style={styles.voiceAssistantText}>{t('voiceAssistant')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: 8,
  },
  creditScoreContainer: {
    marginTop: 8,
  },
  creditScoreLabel: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
  },
  creditScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  creditScoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  creditScoreStars: {
    fontSize: 16,
    color: theme.colors.onPrimary,
  },
  offlineCard: {
    margin: 16,
    backgroundColor: theme.colors.errorContainer,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineText: {
    color: theme.colors.error,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  quickActionText: {
    color: theme.colors.onSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  loansCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  loanItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    paddingBottom: 16,
    marginBottom: 16,
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  loanDetails: {
    marginBottom: 12,
  },
  loanDetailText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  loanButton: {
    borderRadius: 8,
  },
  activityCard: {
    margin: 16,
    marginTop: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityContent: {
    flex: 1,
    marginLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  activityTime: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  voiceAssistantButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  voiceAssistantGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  voiceAssistantText: {
    color: theme.colors.onPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;
