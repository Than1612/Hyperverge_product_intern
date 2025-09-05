import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    welcome: 'Welcome to Rural Loan AI', applyLoan: 'Apply for Loan', checkStatus: 'Check Status',
    back: 'Back', next: 'Next', submit: 'Submit', offline: 'You are offline',
    loanApproved: 'Loan Approved', loanRejected: 'Loan Rejected', underReview: 'Under Review'
  }},
  hi: { translation: {
    welcome: 'रूरल लोन AI में आपका स्वागत है', applyLoan: 'लोन के लिए आवेदन करें', checkStatus: 'स्थिति जांचें',
    back: 'वापस', next: 'अगला', submit: 'जमा करें', offline: 'आप ऑफलाइन हैं',
    loanApproved: 'लोन स्वीकृत', loanRejected: 'लोन अस्वीकृत', underReview: 'समीक्षा के तहत'
  }}
};

i18n.use(initReactI18next).init({
  resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false }
});

export default i18n;
