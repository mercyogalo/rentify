import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography, radius } from '../../theme';

export function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = () => {
    if (user) updateUser({ ...user, name, phone });
    Alert.alert('Saved', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?u=profile' }}
          style={styles.avatar}
        />
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      <Input label="Full Name" value={name} onChangeText={setName} />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Push Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ true: colors.accent }}
        />
      </View>

      <Button title="Save Changes" onPress={handleSave} />
      <Button title="Logout" variant="outline" onPress={handleLogout} style={styles.logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: spacing.md },
  email: { ...typography.caption },
  role: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  toggleLabel: { fontSize: 16, color: colors.text },
  logout: { marginTop: spacing.md },
});
