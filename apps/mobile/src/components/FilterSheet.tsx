import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { ListingFilters, PropertyType } from '@rentify/shared-types';
import { PROPERTY_TYPES } from '../data/mockData';
import { Button } from './Button';

interface Props {
  filters: ListingFilters;
  onChange: (filters: Partial<ListingFilters>) => void;
  onClose: () => void;
  onReset: () => void;
}

export function FilterSheet({ filters, onChange, onClose, onReset }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onReset}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>City</Text>
        <View style={styles.chipRow}>
          {['Austin', 'Round Rock', 'Dallas'].map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.chip, filters.city === city && styles.chipActive]}
              onPress={() => onChange({ city: filters.city === city ? undefined : city })}
            >
              <Text style={[styles.chipText, filters.city === city && styles.chipTextActive]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Property Type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.chip,
                filters.propertyType === value && styles.chipActive,
              ]}
              onPress={() =>
                onChange({
                  propertyType:
                    filters.propertyType === value
                      ? undefined
                      : (value as PropertyType),
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  filters.propertyType === value && styles.chipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Bedrooms (min)</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, filters.bedrooms === n && styles.chipActive]}
              onPress={() =>
                onChange({ bedrooms: filters.bedrooms === n ? undefined : n })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  filters.bedrooms === n && styles.chipTextActive,
                ]}
              >
                {n}+
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => onChange({ includeTaken: !filters.includeTaken })}
        >
          <Text style={styles.toggleLabel}>Include taken listings</Text>
          <View style={[styles.toggle, filters.includeTaken && styles.toggleOn]}>
            <View style={[styles.knob, filters.includeTaken && styles.knobOn]} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Button title="Apply Filters" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  reset: {
    color: colors.accent,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: colors.accent,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
