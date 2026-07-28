import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

type Props = {
  latitude: number;
  longitude: number;
  style?: ViewStyle;
};

export function ListingMap({ latitude, longitude, style }: Props) {
  const openMaps = () => {
    Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
  };

  return (
    <TouchableOpacity style={[styles.map, style]} onPress={openMaps} activeOpacity={0.8}>
      <Ionicons name="map-outline" size={28} color={colors.accent} />
      <Text style={styles.label}>View on Google Maps</Text>
      <Text style={styles.coords}>
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 180,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: { fontWeight: '600', color: colors.accent },
  coords: { fontSize: 12, color: colors.textSecondary },
});
