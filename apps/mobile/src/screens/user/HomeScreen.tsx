import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HouseCard } from '../../components/HouseCard';
import { FilterSheet } from '../../components/FilterSheet';
import { EmptyState } from '../../components/EmptyState';
import { useListingStore } from '../../store/listingStore';
import { colors, spacing, typography } from '../../theme';
import type { UserStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<UserStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const {
    favorites,
    filters,
    setFilters,
    resetFilters,
    toggleFavorite,
    fetchListings,
    getFilteredListings,
  } = useListingStore();

  useEffect(() => {
    fetchListings();
  }, []);

  const listings = getFilteredListings();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, address..."
              placeholderTextColor={colors.textSecondary}
              value={filters.search || ''}
              onChangeText={(search) => setFilters({ search: search || undefined })}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
            <Ionicons name="options-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <HouseCard
            listing={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate('HouseDetail', { listingId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No listings found"
            subtitle="Try adjusting your filters or search terms"
          />
        }
      />

      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <FilterSheet
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            onClose={() => setShowFilters(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.h1, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: 16, color: colors.text },
  filterBtn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
});
