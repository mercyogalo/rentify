import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography, radius } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';
import { pickProfileImage } from '../../services/upload';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [role, setRole] = useState<'user' | 'agent'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { register, isLoading } = useAuthStore();

  const handlePickAvatar = async () => {
    try {
      const uri = await pickProfileImage();
      if (uri) setAvatarUri(uri);
    } catch (err) {
      Alert.alert('Photo selection failed', (err as Error).message);
    }
  };

  const handleRegister = async () => {
    if (!avatarUri) {
      Alert.alert('Profile photo required', 'Please add a profile photo to create your account.');
      return;
    }
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        avatarFileUri: avatarUri || undefined,
        agencyName: role === 'agent' ? agencyName : undefined,
        licenseNumber: role === 'agent' ? licenseNumber : undefined,
        bio: role === 'agent' ? bio : undefined,
      });
    } catch (err) {
      Alert.alert('Registration failed', (err as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>

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

        <TouchableOpacity style={styles.avatarPicker} onPress={handlePickAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
          ) : (
            <Text style={styles.avatarText}>Add profile photo *</Text>
          )}
        </TouchableOpacity>

        <Input label="Full Name" value={name} onChangeText={setName} placeholder="Jane Doe" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {role === 'agent' && (
          <>
            <Input
              label="Agency Name"
              value={agencyName}
              onChangeText={setAgencyName}
              placeholder="Premier Homes"
            />
            <Input
              label="License Number (optional)"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholder="Tell clients about yourself..."
            />
          </>
        )}

        <Button title="Create Account" onPress={handleRegister} loading={isLoading} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { ...typography.h1, marginBottom: spacing.lg },
  avatarPicker: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  avatarPreview: { width: 96, height: 96, borderRadius: 48 },
  avatarText: { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.sm },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleChip: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  roleChipActive: { borderColor: colors.accent, backgroundColor: '#E8F5E9' },
  roleText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  roleTextActive: { color: colors.accent, fontWeight: '600' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textSecondary },
  linkBold: { color: colors.accent, fontWeight: '600' },
});
