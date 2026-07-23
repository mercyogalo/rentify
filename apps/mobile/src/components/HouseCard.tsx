import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Listing } from '@rentify/shared-types';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  listing: Listing;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function HouseCard({ listing, onPress, isFavorite, onToggleFavorite }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listing.images[0] || 'https://picsum.photos/400/300' }}
          style={styles.image}
        />
        <Text style={styles.price}>${listing.price.toLocaleString()}/mo</Text>
        {onToggleFavorite && (
          <TouchableOpacity style={styles.heart} onPress={onToggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.error : colors.surface}
            />
          </TouchableOpacity>
        )}
        <View style={[styles.badge, listing.status === 'taken' && styles.badgeTaken]}>
          <Text style={styles.badgeText}>
            {listing.status === 'available' ? 'Available' : listing.status === 'taken' ? 'Taken' : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.location}>
          {listing.location.city} · {listing.bedrooms} bed · {listing.bathrooms} bath
        </Text>
        {listing.agent && (
          <View style={styles.agentRow}>
            <Image source={{ uri: listing.agent.avatar }} style={styles.avatar} />
            <Text style={styles.agentName}>{listing.agent.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  price: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: '#fff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    fontWeight: '700',
    fontSize: 14,
  },
  heart: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: radius.full,
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.available,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeTaken: {
    backgroundColor: colors.taken,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  agentName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
