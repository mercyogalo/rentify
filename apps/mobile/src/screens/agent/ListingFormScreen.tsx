import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useListingStore } from '../../store/listingStore';
import { useAuthStore } from '../../store/authStore';
import { AMENITIES_OPTIONS, PROPERTY_TYPES } from '../../data/mockData';
import { colors, spacing, typography, radius } from '../../theme';
import type { AgentStackParamList } from '../../navigation/types';
import type { Listing, PropertyType } from '@rentify/shared-types';

type Props = NativeStackScreenProps<AgentStackParamList, 'AddListing' | 'EditListing'>;

export function ListingFormScreen({ route, navigation }: Props) {
  const listingId = 'listingId' in route.params ? route.params.listingId : undefined;
  const existing = useListingStore((s) =>
    listingId ? s.listings.find((l) => l.id === listingId) : undefined
  );
  const { addListing, updateListing } = useListingStore();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [price, setPrice] = useState(existing?.price?.toString() || '');
  const [address, setAddress] = useState(existing?.location.address || '');
  const [city, setCity] = useState(existing?.location.city || '');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    existing?.propertyType || 'apartment'
  );
  const [bedrooms, setBedrooms] = useState(existing?.bedrooms?.toString() || '1');
  const [bathrooms, setBathrooms] = useState(existing?.bathrooms?.toString() || '1');
  const [amenities, setAmenities] = useState<string[]>(existing?.amenities || []);
  const [available, setAvailable] = useState(existing?.status !== 'taken');

  const toggleAmenity = (a: string) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = () => {
    const data: Partial<Listing> = {
      title,
      description,
      price: parseInt(price, 10),
      location: { address, city, lat: 30.27, lng: -97.74 },
      propertyType,
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseFloat(bathrooms),
      amenities,
      status: available ? 'available' : 'taken',
      images: existing?.images || [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      ],
    };

    if (listingId) {
      updateListing(listingId, data);
    } else {
      addListing({
        id: `listing-${Date.now()}`,
        agentId: user!.id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agent: {
          id: user!.id,
          name: user!.name,
          avatar: user!.avatar,
          rating: user!.rating,
          agencyName: user!.agencyName,
        },
      } as Listing);
    }

    Alert.alert('Success', listingId ? 'Listing updated' : 'Listing created', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const steps = ['Details', 'Location', 'Features'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.steps}>
        {steps.map((s, i) => (
          <View key={s} style={[styles.stepDot, i <= step && styles.stepDotActive]} />
        ))}
      </View>

      {step === 0 && (
        <>
          <Text style={styles.stepTitle}>Property Details</Text>
          <Input label="Title" value={title} onChangeText={setTitle} placeholder="Modern 2BR Apartment" />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Input
            label="Monthly Price ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.stepTitle}>Location</Text>
          <Input label="Address" value={address} onChangeText={setAddress} />
          <Input label="City" value={city} onChangeText={setCity} />
          <Text style={styles.label}>Property Type</Text>
          <View style={styles.chipRow}>
            {PROPERTY_TYPES.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[styles.chip, propertyType === value && styles.chipActive]}
                onPress={() => setPropertyType(value)}
              >
                <Text style={[styles.chipText, propertyType === value && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.stepTitle}>Features</Text>
          <Input label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
          <Input label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
          <Text style={styles.label}>Amenities</Text>
          <View style={styles.chipRow}>
            {AMENITIES_OPTIONS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, amenities.includes(a) && styles.chipActive]}
                onPress={() => toggleAmenity(a)}
              >
                <Text style={[styles.chipText, amenities.includes(a) && styles.chipTextActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Available for rent</Text>
            <Switch value={available} onValueChange={setAvailable} trackColor={{ true: colors.accent }} />
          </View>
        </>
      )}

      <View style={styles.navRow}>
        {step > 0 && (
          <Button title="Back" variant="outline" onPress={() => setStep(step - 1)} style={styles.navBtn} />
        )}
        {step < 2 ? (
          <Button title="Next" onPress={() => setStep(step + 1)} style={styles.navBtn} />
        ) : (
          <Button title={listingId ? 'Update Listing' : 'Publish Listing'} onPress={handleSubmit} style={styles.navBtn} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  steps: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.accent },
  stepTitle: { ...typography.h2, marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  toggleLabel: { fontSize: 16 },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  navBtn: { flex: 1 },
});
