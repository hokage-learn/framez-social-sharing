import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../state/auth';
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

type SignUpScreenNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'SignUp'
>;

const SignUpSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    )
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type SignUpFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const SignUpScreen = () => {
  const { signUp } = useAuthStore();
  const { tokens } = useTheme();
  const navigation = useNavigation<SignUpScreenNavigation>();

  const handleSignUp = async (
    values: SignUpFormValues,
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    try {
      await signUp(values.email.trim(), values.password);
      
      // Save username and user profile to Firestore
      if (auth.currentUser) {
        const username = values.username.trim().toLowerCase();
        
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
        
        // Save user document to Firestore with username
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          username: username,
          email: auth.currentUser.email,
          displayName: username,
          avatar: auth.currentUser.photoURL || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      // Navigation will be handled by auth state change
    } catch (error: any) {
      const errorCode = error.code || '';
      const errorMessage = getFirebaseErrorMessage(errorCode);
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tokens.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: tokens.textPrimary }]}>
              Create account
            </Text>
            <Text style={[styles.subtitle, { color: tokens.textSecondary }]}>
              Join Framez and start sharing your world
            </Text>
          </View>

          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={SignUpSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSignUp(values, setSubmitting);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: tokens.textPrimary }]}>
                    Username
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: tokens.surface,
                        color: tokens.textPrimary,
                        borderColor:
                          touched.username && errors.username
                            ? '#EF4444'
                            : tokens.border,
                      },
                    ]}
                    placeholder="Choose a username"
                    placeholderTextColor={tokens.textSecondary}
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.username && errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}
                  <Text
                    style={[
                      styles.helperText,
                      { color: tokens.textSecondary },
                    ]}
                  >
                    Letters, numbers, and underscores only (3-20 characters)
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: tokens.textPrimary }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: tokens.surface,
                        color: tokens.textPrimary,
                        borderColor:
                          touched.email && errors.email
                            ? '#EF4444'
                            : tokens.border,
                      },
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={tokens.textSecondary}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: tokens.textPrimary }]}>
                    Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: tokens.surface,
                        color: tokens.textPrimary,
                        borderColor:
                          touched.password && errors.password
                            ? '#EF4444'
                            : tokens.border,
                      },
                    ]}
                    placeholder="Create a password"
                    placeholderTextColor={tokens.textSecondary}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                    autoCorrect={false}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: tokens.textPrimary }]}>
                    Confirm Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: tokens.surface,
                        color: tokens.textPrimary,
                        borderColor:
                          touched.confirmPassword && errors.confirmPassword
                            ? '#EF4444'
                            : tokens.border,
                      },
                    ]}
                    placeholder="Confirm your password"
                    placeholderTextColor={tokens.textSecondary}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                    autoCorrect={false}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: tokens.accent,
                      opacity: isSubmitting ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text
                    style={[styles.footerText, { color: tokens.textSecondary }]}
                  >
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SignIn')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.linkText, { color: tokens.accent }]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

