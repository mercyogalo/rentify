import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../store/authStore';
import { spacing, radius } from '../../theme';

WebBrowser.maybeCompleteAuthSession();

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOGO_URI =
  'https://s3.amazonaws.com/shecodesio-production/uploads/files/000/181/063/original/ChatGPT_Image_Jul_30__2026__10_41_46_AM.png?1785397549';
const HERO_URI =
  'https://s3.amazonaws.com/shecodesio-production/uploads/files/000/181/064/original/Dream_house.jpg?1785398178';

const mono = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#A3A3A3',
  border: '#333333',
};

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const user = useAuthStore((s) => s.user);
  const { login, register, loginWithGoogle, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'agent'>('user');
  const [agencyName, setAgencyName] = useState('');

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (user) onComplete();
  }, [user, onComplete]);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login failed', (err as Error).message);
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        agencyName: role === 'agent' ? agencyName : undefined,
      });
    } catch (err) {
      Alert.alert('Registration failed', (err as Error).message);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result.type === 'success' && result.params.id_token) {
        await loginWithGoogle(result.params.id_token);
      }
    } catch (err) {
      Alert.alert('Google sign-in failed', (err as Error).message);
    }
  };

  if (step === 0) {
    return (
      <SafeAreaView style={styles.logoScreen}>
        <View style={styles.logoCenter}>
          <Image source={{ uri: LOGO_URI }} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.logoFooter}>
          <TouchableOpacity style={styles.whiteButton} onPress={() => setStep(1)} activeOpacity={0.85}>
            <Text style={styles.whiteButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <View style={styles.heroScreen}>
        <ImageBackground source={{ uri: HERO_URI }} style={styles.heroImage} resizeMode="cover">
          <SafeAreaView style={styles.heroSafe}>
            <View style={styles.heroBottom}>
              <View style={styles.heroScrim} />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Find your dream home</Text>
                <Text style={styles.heroSubtitle}>
                  Browse verified listings and connect with agents in your area.
                </Text>

                <TouchableOpacity
                  style={styles.whiteButton}
                  onPress={() => {
                    setAuthMode('register');
                    setStep(2);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.whiteButtonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => {
                    setAuthMode('login');
                    setStep(2);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.outlineButtonText}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.authScreen}>
      <KeyboardAvoidingView
        style={styles.authFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.authScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Image source={{ uri: LOGO_URI }} style={styles.authLogo} resizeMode="contain" />

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, authMode === 'login' && styles.tabActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, authMode === 'register' && styles.tabActive]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[styles.tabText, authMode === 'register' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {authMode === 'login' ? (
            <>
              <Input
                dark
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
              />
              <Input
                dark
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.submitBtnText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.roleRow}>
                {(['user', 'agent'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                      {r === 'user' ? 'Looking for a home' : 'Agent / Landlord'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input dark label="Full Name" value={name} onChangeText={setName} placeholder="Jane Doe" />
              <Input
                dark
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                dark
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input dark label="Password" value={password} onChangeText={setPassword} secureTextEntry />
              {role === 'agent' && (
                <Input
                  dark
                  label="Agency Name"
                  value={agencyName}
                  onChangeText={setAgencyName}
                  placeholder="Premier Homes"
                />
              )}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.submitBtnText}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={!request || isLoading}
          >
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoScreen: {
    flex: 1,
    backgroundColor: mono.black,
  },
  logoCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 260,
    height: 120,
  },
  logoFooter: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  whiteButton: {
    backgroundColor: mono.white,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  whiteButtonText: {
    color: mono.black,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: mono.white,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  outlineButtonText: {
    color: mono.white,
    fontSize: 16,
    fontWeight: '600',
  },
  heroScreen: {
    flex: 1,
    backgroundColor: mono.black,
  },
  heroImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroSafe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroBottom: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroScrim: {
    position: 'absolute',
    left: -spacing.lg,
    right: -spacing.lg,
    bottom: -spacing.xl,
    height: SCREEN_HEIGHT * 0.55,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    paddingTop: spacing.xl,
  },
  heroTitle: {
    color: mono.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: mono.gray,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  authScreen: {
    flex: 1,
    backgroundColor: mono.black,
  },
  authFlex: {
    flex: 1,
  },
  authScroll: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    color: mono.gray,
    fontSize: 15,
  },
  authLogo: {
    width: 180,
    height: 72,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: mono.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: mono.white,
  },
  tabText: {
    color: mono.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: mono.white,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleChip: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: mono.border,
    alignItems: 'center',
  },
  roleChipActive: {
    borderColor: mono.white,
    backgroundColor: '#1A1A1A',
  },
  roleText: {
    fontSize: 12,
    color: mono.gray,
    textAlign: 'center',
  },
  roleTextActive: {
    color: mono.white,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: mono.white,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnText: {
    color: mono.black,
    fontSize: 16,
    fontWeight: '700',
  },
  googleBtn: {
    borderWidth: 1.5,
    borderColor: mono.border,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  googleBtnText: {
    color: mono.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
