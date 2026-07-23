import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '../../components/EmptyState';
import { useChatStore } from '../../store/chatStore';
import { colors, spacing, typography } from '../../theme';
import type { UserStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<UserStackParamList, 'ChatList'>;

export function ChatListScreen({ navigation }: Props) {
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
          >
            <Image
              source={{ uri: item.agent?.avatar || 'https://i.pravatar.cc/150' }}
              style={styles.avatar}
            />
            <View style={styles.content}>
              <Text style={styles.name}>{item.agent?.name || 'Agent'}</Text>
              {item.listing && (
                <Text style={styles.listing} numberOfLines={1}>
                  Re: {item.listing.title}
                </Text>
              )}
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastMessage || 'Start a conversation'}
              </Text>
            </View>
            {item.lastMessageAt && (
              <Text style={styles.time}>
                {new Date(item.lastMessageAt).toLocaleDateString()}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No messages yet"
            subtitle="Contact an agent from a listing to start chatting"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, padding: spacing.lg, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  content: { flex: 1 },
  name: { fontWeight: '600', fontSize: 16 },
  listing: { fontSize: 12, color: colors.accent, marginTop: 2 },
  preview: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  time: { fontSize: 12, color: colors.textSecondary },
});
