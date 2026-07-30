import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useListingStore } from '../../store/listingStore';
import { colors, spacing, typography, radius } from '../../theme';
import type { AgentStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AgentStackParamList, 'ManageListings'>;

export function ManageListingsScreen({ navigation }: Props) {
  const { listings, fetchAgentListings, updateListingStatus, deleteListing } =
    useListingStore();

  useEffect(() => {
    fetchAgentListings();
  }, []);

  const handleStatus = (id: string, status: 'available' | 'taken') => {
    updateListingStatus(id, status);
    Alert.alert('Updated', `Listing marked as ${status}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Listing', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteListing(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Listings</Text>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
            </View>
            <Text style={styles.meta}>
              {item.location} · {item.status}
            </Text>
            <View style={styles.actions}>
              {item.status !== 'available' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.availableBtn]}
                  onPress={() => handleStatus(item.id, 'available')}
                >
                  <Text style={styles.actionText}>Available</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'taken' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.takenBtn]}
                  onPress={() => handleStatus(item.id, 'taken')}
                >
                  <Text style={styles.actionText}>Taken</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => navigation.navigate('EditListing', { listingId: item.id })}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontWeight: '600', fontSize: 16, flex: 1 },
  price: { fontWeight: '700', color: colors.accent },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
  availableBtn: { backgroundColor: colors.available },
  takenBtn: { backgroundColor: colors.taken },
  editBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  editText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  deleteText: { color: colors.error, fontSize: 13, fontWeight: '600' },
});
