import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HouseCard } from '../../components/HouseCard';
import { Button } from '../../components/Button';
import { MOCK_AGENT, MOCK_LISTINGS } from '../../data/mockData';
import { colors, spacing, typography, radius } from '../../theme';
import type { UserStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<UserStackParamList, 'AgentProfile'>;

export function AgentProfileScreen({ route, navigation }: Props) {
  const { agentId } = route.params;
  const agent = agentId === MOCK_AGENT.id ? MOCK_AGENT : undefined;
  const listings = MOCK_LISTINGS.filter(
    (l) => l.agentId === agentId && l.status === 'available'
  );

  if (!agent) {
    return (
      <View style={styles.center}>
        <Text>Agent not found</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={listings}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image source={{ uri: agent.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{agent.name}</Text>
          <Text style={styles.agency}>{agent.agencyName}</Text>
          {agent.isVerified && <Text style={styles.verified}>✓ Verified Agent</Text>}
          {agent.rating && <Text style={styles.rating}>★ {agent.rating.toFixed(1)} rating</Text>}
          <Text style={styles.bio}>{agent.bio}</Text>
          <Button
            title="Message Agent"
            onPress={() =>
              navigation.navigate('Chat', { conversationId: 'conv-new', agentId })
            }
            style={styles.messageBtn}
          />
          <Text style={styles.sectionTitle}>Active Listings</Text>
        </View>
      }
      renderItem={({ item }) => (
        <HouseCard
          listing={item}
          onPress={() => navigation.navigate('HouseDetail', { listingId: item.id })}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', padding: spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing.md },
  name: { ...typography.h1, fontSize: 24 },
  agency: { ...typography.caption, marginTop: spacing.xs },
  verified: { color: colors.accent, fontWeight: '600', marginTop: spacing.sm },
  rating: { color: colors.textSecondary, marginTop: spacing.xs },
  bio: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  messageBtn: { marginTop: spacing.lg, width: '100%' },
  sectionTitle: {
    ...typography.h2,
    alignSelf: 'flex-start',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
