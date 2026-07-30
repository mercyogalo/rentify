import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useListingStore } from '../../store/listingStore';
import { colors, spacing, typography, radius } from '../../theme';
import type { AgentStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AgentStackParamList, 'Dashboard'>;

export function AgentDashboardScreen({ navigation }: Props) {
  const { listings, fetchAgentListings } = useListingStore();

  useEffect(() => {
    fetchAgentListings();
  }, []);

  const activeCount = listings.filter((l) => l.status === 'available').length;
  const takenCount = listings.filter((l) => l.status === 'taken').length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{listings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{takenCount}</Text>
          <Text style={styles.statLabel}>Taken</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AddListing')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add Listing</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Listings</Text>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listingRow}
            onPress={() => navigation.navigate('EditListing', { listingId: item.id })}
          >
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.listingMeta}>
                ${item.price.toLocaleString()}/mo · {item.location}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                item.status === 'available' && styles.statusAvailable,
                item.status === 'taken' && styles.statusTaken,
              ]}
            >
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h1, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.accent },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: { ...typography.h2, marginBottom: spacing.md },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  listingInfo: { flex: 1 },
  listingTitle: { fontWeight: '600', fontSize: 15 },
  listingMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.pending,
  },
  statusAvailable: { backgroundColor: colors.available },
  statusTaken: { backgroundColor: colors.taken },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
