import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { HouseCard } from '../../components/HouseCard';
import { EmptyState } from '../../components/EmptyState';
import { useListingStore } from '../../store/listingStore';
import { colors, spacing, typography } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<UserStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { getFavoriteListings, favorites, toggleFavorite } = useListingStore();
  const listings = getFavoriteListings();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved</Text>
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
            icon="heart-outline"
            title="No saved homes"
            subtitle="Tap the heart on listings to save them here"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, padding: spacing.lg, paddingBottom: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
});
