import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useListingStore } from '../../store/listingStore';
import { useChatStore } from '../../store/chatStore';
import { colors, spacing, typography, radius } from '../../theme';
import type { UserStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<UserStackParamList, 'HouseDetail'>;

export function HouseDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const listing = useListingStore((s) => s.listings.find((l) => l.id === listingId));
  const { favorites, toggleFavorite } = useListingStore();
  const { startConversation } = useChatStore();

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  const handleContact = async () => {
    const conv = await startConversation(listing.agentId, listing.id);
    navigation.navigate('Chat', { conversationId: conv.id });
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {listing.images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.heroImage} />
        ))}
      </ScrollView>

      {listing.status === 'taken' && (
        <View style={styles.unavailableBanner}>
          <Text style={styles.unavailableText}>This property is no longer available</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${listing.price.toLocaleString()}/mo</Text>
          <TouchableOpacity onPress={() => toggleFavorite(listing.id)}>
            <Ionicons
              name={favorites.includes(listing.id) ? 'heart' : 'heart-outline'}
              size={26}
              color={favorites.includes(listing.id) ? colors.error : colors.text}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>
          {listing.location.address}, {listing.location.city}
        </Text>
        <Text style={styles.meta}>
          {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.propertyType}
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>

        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenities}>
          {listing.amenities.map((a) => (
            <View key={a} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Location</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: listing.location.lat,
            longitude: listing.location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker coordinate={{ latitude: listing.location.lat, longitude: listing.location.lng }} />
        </MapView>

        {listing.agent && (
          <TouchableOpacity
            style={styles.agentCard}
            onPress={() => navigation.navigate('AgentProfile', { agentId: listing.agentId })}
          >
            <Image source={{ uri: listing.agent.avatar }} style={styles.agentAvatar} />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{listing.agent.name}</Text>
              <Text style={styles.agentAgency}>{listing.agent.agencyName}</Text>
              {listing.agent.rating && (
                <Text style={styles.rating}>★ {listing.agent.rating.toFixed(1)}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        <Button
          title="Contact Agent"
          onPress={handleContact}
          disabled={listing.status === 'taken'}
          style={styles.contactBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width, height: 280 },
  unavailableBanner: {
    backgroundColor: colors.taken,
    padding: spacing.md,
  },
  unavailableText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  content: { padding: spacing.lg },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { ...typography.h1, color: colors.accent },
  title: { ...typography.h2, marginTop: spacing.sm },
  location: { ...typography.caption, marginTop: spacing.xs },
  meta: { ...typography.caption, marginTop: spacing.xs, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginTop: spacing.lg, marginBottom: spacing.sm },
  description: { ...typography.body, lineHeight: 24, color: colors.textSecondary },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityText: { fontSize: 13, color: colors.text },
  map: { height: 180, borderRadius: radius.lg, marginTop: spacing.sm },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  agentAvatar: { width: 48, height: 48, borderRadius: 24 },
  agentInfo: { flex: 1 },
  agentName: { fontWeight: '600', fontSize: 16 },
  agentAgency: { color: colors.textSecondary, fontSize: 13 },
  rating: { color: colors.accent, fontSize: 13, marginTop: 2 },
  contactBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
});
