import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'react-native-localize';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Language resources
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Rural Loan AI',
      selectLanguage: 'Select Your Language',
      phoneNumber: 'Phone Number',
      enterOTP: 'Enter OTP',
      verify: 'Verify',
      home: 'Home',
      applyLoan: 'Apply for Loan',
      checkStatus: 'Check Status',
      profile: 'Profile',
      settings: 'Settings',
      loanAmount: 'Loan Amount',
      purpose: 'Purpose',
      documents: 'Documents',
      submit: 'Submit',
      agriculture: 'Agriculture',
      homeImprovement: 'Home Improvement',
      business: 'Business',
      vehicle: 'Vehicle',
      education: 'Education',
      medical: 'Medical',
      other: 'Other',
      aadhaarCard: 'Aadhaar Card',
      panCard: 'PAN Card',
      incomeProof: 'Income Proof',
      addressProof: 'Address Proof',
      takePhoto: 'Take Photo',
      verified: 'Verified',
      processing: 'Processing',
      retry: 'Retry',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      offline: 'You are offline',
      online: 'You are online',
      syncInProgress: 'Syncing data...',
      voiceAssistant: 'Voice Assistant',
      speakAmount: 'Speak Amount',
      speakPurpose: 'Speak Purpose',
      listen: 'Listen',
      stop: 'Stop',
      creditScore: 'Credit Score',
      loanApproved: 'Loan Approved',
      loanRejected: 'Loan Rejected',
      underReview: 'Under Review',
      amountDisbursed: 'Amount Disbursed',
      repaymentDue: 'Repayment Due',
      makePayment: 'Make Payment',
      paymentHistory: 'Payment History',
      help: 'Help',
      contactSupport: 'Contact Support',
      about: 'About',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      logout: 'Logout',
      confirmLogout: 'Are you sure you want to logout?',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      name: 'Name',
      email: 'Email',
      address: 'Address',
      occupation: 'Occupation',
      monthlyIncome: 'Monthly Income',
      familyMembers: 'Family Members',
      emergencyContact: 'Emergency Contact',
      bankAccount: 'Bank Account',
      ifscCode: 'IFSC Code',
      accountNumber: 'Account Number',
      accountHolderName: 'Account Holder Name',
      tips: 'Tips',
      ensureGoodLighting: 'Ensure good lighting',
      keepDocumentFlat: 'Keep document flat',
      avoidShadows: 'Avoid shadows',
      documentTips: 'Document Tips',
      loanTips: 'Loan Tips',
      repaymentTips: 'Repayment Tips',
      financialTips: 'Financial Tips',
      learnMore: 'Learn More',
      readMore: 'Read More',
      showLess: 'Show Less',
      notifications: 'Notifications',
      markAsRead: 'Mark as Read',
      clearAll: 'Clear All',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      type: 'Type',
      description: 'Description',
      details: 'Details',
      summary: 'Summary',
      total: 'Total',
      balance: 'Balance',
      due: 'Due',
      paid: 'Paid',
      pending: 'Pending',
      overdue: 'Overdue',
      completed: 'Completed',
      inProgress: 'In Progress',
      failed: 'Failed',
      refresh: 'Refresh',
      pullToRefresh: 'Pull to refresh',
      noData: 'No data available',
      noInternet: 'No internet connection',
      tryAgain: 'Try Again',
      somethingWentWrong: 'Something went wrong',
      pleaseTryAgain: 'Please try again',
      networkError: 'Network error',
      serverError: 'Server error',
      validationError: 'Validation error',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      notFound: 'Not found',
      timeout: 'Request timeout',
      unknownError: 'Unknown error',
    },
  },
  hi: {
    translation: {
      welcome: 'रूरल लोन AI में आपका स्वागत है',
      selectLanguage: 'अपनी भाषा चुनें',
      phoneNumber: 'फोन नंबर',
      enterOTP: 'OTP दर्ज करें',
      verify: 'सत्यापित करें',
      home: 'होम',
      applyLoan: 'लोन के लिए आवेदन करें',
      checkStatus: 'स्थिति जांचें',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      loanAmount: 'लोन राशि',
      purpose: 'उद्देश्य',
      documents: 'दस्तावेज',
      submit: 'जमा करें',
      agriculture: 'कृषि',
      homeImprovement: 'घर सुधार',
      business: 'व्यापार',
      vehicle: 'वाहन',
      education: 'शिक्षा',
      medical: 'चिकित्सा',
      other: 'अन्य',
      aadhaarCard: 'आधार कार्ड',
      panCard: 'PAN कार्ड',
      incomeProof: 'आय प्रमाण',
      addressProof: 'पता प्रमाण',
      takePhoto: 'फोटो लें',
      verified: 'सत्यापित',
      processing: 'प्रसंस्करण',
      retry: 'पुनः प्रयास',
      continue: 'जारी रखें',
      back: 'वापस',
      next: 'अगला',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      offline: 'आप ऑफलाइन हैं',
      online: 'आप ऑनलाइन हैं',
      syncInProgress: 'डेटा सिंक हो रहा है...',
      voiceAssistant: 'वॉइस असिस्टेंट',
      speakAmount: 'राशि बोलें',
      speakPurpose: 'उद्देश्य बोलें',
      listen: 'सुनें',
      stop: 'रोकें',
      creditScore: 'क्रेडिट स्कोर',
      loanApproved: 'लोन स्वीकृत',
      loanRejected: 'लोन अस्वीकृत',
      underReview: 'समीक्षा के तहत',
      amountDisbursed: 'राशि जारी',
      repaymentDue: 'भुगतान देय',
      makePayment: 'भुगतान करें',
      paymentHistory: 'भुगतान इतिहास',
      help: 'सहायता',
      contactSupport: 'सहायता से संपर्क करें',
      about: 'के बारे में',
      privacy: 'गोपनीयता नीति',
      terms: 'सेवा की शर्तें',
      logout: 'लॉग आउट',
      confirmLogout: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
      yes: 'हाँ',
      no: 'नहीं',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      confirm: 'पुष्टि करें',
      name: 'नाम',
      email: 'ईमेल',
      address: 'पता',
      occupation: 'व्यवसाय',
      monthlyIncome: 'मासिक आय',
      familyMembers: 'परिवार के सदस्य',
      emergencyContact: 'आपातकालीन संपर्क',
      bankAccount: 'बैंक खाता',
      ifscCode: 'IFSC कोड',
      accountNumber: 'खाता संख्या',
      accountHolderName: 'खाताधारक का नाम',
      tips: 'सुझाव',
      ensureGoodLighting: 'अच्छी रोशनी सुनिश्चित करें',
      keepDocumentFlat: 'दस्तावेज को सपाट रखें',
      avoidShadows: 'छाया से बचें',
      documentTips: 'दस्तावेज सुझाव',
      loanTips: 'लोन सुझाव',
      repaymentTips: 'भुगतान सुझाव',
      financialTips: 'वित्तीय सुझाव',
      learnMore: 'और जानें',
      readMore: 'और पढ़ें',
      showLess: 'कम दिखाएं',
      notifications: 'सूचनाएं',
      markAsRead: 'पढ़ा हुआ मार्क करें',
      clearAll: 'सभी साफ करें',
      search: 'खोजें',
      filter: 'फिल्टर',
      sort: 'क्रमबद्ध करें',
      date: 'तारीख',
      amount: 'राशि',
      status: 'स्थिति',
      type: 'प्रकार',
      description: 'विवरण',
      details: 'विवरण',
      summary: 'सारांश',
      total: 'कुल',
      balance: 'शेष',
      due: 'देय',
      paid: 'भुगतान',
      pending: 'लंबित',
      overdue: 'अतिदेय',
      completed: 'पूर्ण',
      inProgress: 'प्रगति में',
      failed: 'असफल',
      refresh: 'रिफ्रेश',
      pullToRefresh: 'रिफ्रेश के लिए खींचें',
      noData: 'कोई डेटा उपलब्ध नहीं',
      noInternet: 'कोई इंटरनेट कनेक्शन नहीं',
      tryAgain: 'पुनः प्रयास करें',
      somethingWentWrong: 'कुछ गलत हुआ',
      pleaseTryAgain: 'कृपया पुनः प्रयास करें',
      networkError: 'नेटवर्क त्रुटि',
      serverError: 'सर्वर त्रुटि',
      validationError: 'सत्यापन त्रुटि',
      unauthorized: 'अनधिकृत',
      forbidden: 'निषिद्ध',
      notFound: 'नहीं मिला',
      timeout: 'अनुरोध समय सीमा',
      unknownError: 'अज्ञात त्रुटि',
    },
  },
  // Add more languages as needed
  te: {
    translation: {
      welcome: 'రూరల్ లోన్ AIకు స్వాగతం',
      selectLanguage: 'మీ భాషను ఎంచుకోండి',
      phoneNumber: 'ఫోన్ నంబర్',
      enterOTP: 'OTP ను నమోదు చేయండి',
      verify: 'ధృవీకరించండి',
      home: 'హోమ్',
      applyLoan: 'లోన్ కోసం దరఖాస్తు చేయండి',
      checkStatus: 'స్థితిని తనిఖీ చేయండి',
      profile: 'ప్రొఫైల్',
      settings: 'సెట్టింగ్స్',
      loanAmount: 'లోన్ మొత్తం',
      purpose: 'ఉద్దేశ్యం',
      documents: 'పత్రాలు',
      submit: 'సమర్పించండి',
      agriculture: 'వ్యవసాయం',
      homeImprovement: 'ఇల్లు మెరుగుపరచడం',
      business: 'వ్యాపారం',
      vehicle: 'వాహనం',
      education: 'విద్య',
      medical: 'వైద్య',
      other: 'ఇతర',
      aadhaarCard: 'ఆధార్ కార్డ్',
      panCard: 'PAN కార్డ్',
      incomeProof: 'ఆదాయ రుజువు',
      addressProof: 'చిరునామా రుజువు',
      takePhoto: 'ఫోటో తీయండి',
      verified: 'ధృవీకరించబడింది',
      processing: 'ప్రాసెసింగ్',
      retry: 'మళ్లీ ప్రయత్నించండి',
      continue: 'కొనసాగించండి',
      back: 'వెనుకకు',
      next: 'తదుపరి',
      loading: 'లోడ్ అవుతోంది...',
      error: 'లోపం',
      success: 'విజయం',
      offline: 'మీరు ఆఫ్లైన్‌లో ఉన్నారు',
      online: 'మీరు ఆన్‌లైన్‌లో ఉన్నారు',
      syncInProgress: 'డేటా సమకాలీకరించబడుతోంది...',
      voiceAssistant: 'వాయిస్ అసిస్టెంట్',
      speakAmount: 'మొత్తాన్ని మాట్లాడండి',
      speakPurpose: 'ఉద్దేశ్యాన్ని మాట్లాడండి',
      listen: 'వినండి',
      stop: 'ఆపండి',
      creditScore: 'క్రెడిట్ స్కోర్',
      loanApproved: 'లోన్ ఆమోదించబడింది',
      loanRejected: 'లోన్ తిరస్కరించబడింది',
      underReview: 'సమీక్షలో',
      amountDisbursed: 'మొత్తం విడుదల',
      repaymentDue: 'చెల్లింపు కారణం',
      makePayment: 'చెల్లింపు చేయండి',
      paymentHistory: 'చెల్లింపు చరిత్ర',
      help: 'సహాయం',
      contactSupport: 'సహాయానికి సంప్రదించండి',
      about: 'గురించి',
      privacy: 'గోప్యతా విధానం',
      terms: 'సేవా నిబంధనలు',
      logout: 'లాగ్ అవుట్',
      confirmLogout: 'మీరు నిజంగా లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
      yes: 'అవును',
      no: 'కాదు',
      cancel: 'రద్దు చేయండి',
      save: 'సేవ్ చేయండి',
      edit: 'సవరించండి',
      delete: 'తొలగించండి',
      confirm: 'నిర్ధారించండి',
      name: 'పేరు',
      email: 'ఇమెయిల్',
      address: 'చిరునామా',
      occupation: 'వృత్తి',
      monthlyIncome: 'నెలవారీ ఆదాయం',
      familyMembers: 'కుటుంబ సభ్యులు',
      emergencyContact: 'అత్యవసర సంప్రదింపు',
      bankAccount: 'బ్యాంక్ ఖాతా',
      ifscCode: 'IFSC కోడ్',
      accountNumber: 'ఖాతా నంబర్',
      accountHolderName: 'ఖాతాదారుడి పేరు',
      tips: 'చిట్కాలు',
      ensureGoodLighting: 'మంచి కాంతిని నిర్ధారించండి',
      keepDocumentFlat: 'పత్రాన్ని చదునుగా ఉంచండి',
      avoidShadows: 'నీడలను నివారించండి',
      documentTips: 'పత్ర చిట్కాలు',
      loanTips: 'లోన్ చిట్కాలు',
      repaymentTips: 'చెల్లింపు చిట్కాలు',
      financialTips: 'ఆర్థిక చిట్కాలు',
      learnMore: 'మరింత తెలుసుకోండి',
      readMore: 'మరింత చదవండి',
      showLess: 'తక్కువ చూపించండి',
      notifications: 'నోటిఫికేషన్లు',
      markAsRead: 'చదివినట్లు గుర్తించండి',
      clearAll: 'అన్నింటినీ క్లియర్ చేయండి',
      search: 'వెతకండి',
      filter: 'ఫిల్టర్',
      sort: 'క్రమబద్ధీకరించండి',
      date: 'తేదీ',
      amount: 'మొత్తం',
      status: 'స్థితి',
      type: 'రకం',
      description: 'వివరణ',
      details: 'వివరాలు',
      summary: 'సారాంశం',
      total: 'మొత్తం',
      balance: 'బ్యాలెన్స్',
      due: 'కారణం',
      paid: 'చెల్లింపు',
      pending: 'పెండింగ్',
      overdue: 'ఓవర్‌డ్యూ',
      completed: 'పూర్తయింది',
      inProgress: 'ప్రగతిలో',
      failed: 'విఫలమైంది',
      refresh: 'రిఫ్రెష్',
      pullToRefresh: 'రిఫ్రెష్ కోసం లాగండి',
      noData: 'డేటా అందుబాటులో లేదు',
      noInternet: 'ఇంటర్నెట్ కనెక్షన్ లేదు',
      tryAgain: 'మళ్లీ ప్రయత్నించండి',
      somethingWentWrong: 'ఏదో తప్పు జరిగింది',
      pleaseTryAgain: 'దయచేసి మళ్లీ ప్రయత్నించండి',
      networkError: 'నెట్‌వర్క్ లోపం',
      serverError: 'సర్వర్ లోపం',
      validationError: 'వాలిడేషన్ లోపం',
      unauthorized: 'అనధికార',
      forbidden: 'నిషేధించబడింది',
      notFound: 'కనుగొనబడలేదు',
      timeout: 'అభ్యర్థన సమయ పరిమితి',
      unknownError: 'తెలియని లోపం',
    },
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

interface LanguageState {
  currentLanguage: string;
  availableLanguages: string[];
  isRTL: boolean;
}

type LanguageAction =
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_AVAILABLE_LANGUAGES'; payload: string[] };

const initialState: LanguageState = {
  currentLanguage: 'en',
  availableLanguages: ['en', 'hi', 'te'],
  isRTL: false,
};

const languageReducer = (state: LanguageState, action: LanguageAction): LanguageState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        currentLanguage: action.payload,
        isRTL: action.payload === 'ar' || action.payload === 'he', // Add RTL languages as needed
      };
    case 'SET_AVAILABLE_LANGUAGES':
      return {
        ...state,
        availableLanguages: action.payload,
      };
    default:
      return state;
  }
};

interface LanguageContextType extends LanguageState {
  changeLanguage: (language: string) => Promise<void>;
  getCurrentLanguage: () => string;
  isLanguageSupported: (language: string) => boolean;
  getLanguageName: (code: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(languageReducer, initialState);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Get saved language from storage
      const savedLanguage = await AsyncStorage.getItem('selected_language');
      
      if (savedLanguage && state.availableLanguages.includes(savedLanguage)) {
        await changeLanguage(savedLanguage);
      } else {
        // Auto-detect device language
        const deviceLocales = getLocales();
        const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
        
        if (state.availableLanguages.includes(deviceLanguage)) {
          await changeLanguage(deviceLanguage);
        } else {
          await changeLanguage('en'); // Default to English
        }
      }
    } catch (error) {
      console.error('Language initialization failed:', error);
      await changeLanguage('en');
    }
  };

  const changeLanguage = async (language: string): Promise<void> => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('selected_language', language);
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    } catch (error) {
      console.error('Language change failed:', error);
    }
  };

  const getCurrentLanguage = (): string => {
    return state.currentLanguage;
  };

  const isLanguageSupported = (language: string): boolean => {
    return state.availableLanguages.includes(language);
  };

  const getLanguageName = (code: string): string => {
    const languageNames: { [key: string]: string } = {
      en: 'English',
      hi: 'हिन्दी',
      te: 'తెలుగు',
      ta: 'தமிழ்',
      bn: 'বাংলা',
      gu: 'ગુજરાતી',
      mr: 'मराठी',
      kn: 'ಕನ್ನಡ',
      ml: 'മലയാളം',
      pa: 'ਪੰਜਾਬੀ',
      or: 'ଓଡ଼ିଆ',
      as: 'অসমীয়া',
    };
    return languageNames[code] || code.toUpperCase();
  };

  const value: LanguageContextType = {
    ...state,
    changeLanguage,
    getCurrentLanguage,
    isLanguageSupported,
    getLanguageName,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { i18n };
