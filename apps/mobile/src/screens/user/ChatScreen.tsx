import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useListingStore } from '../../store/listingStore';
import { colors, spacing, radius } from '../../theme';
import type { UserStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<UserStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props) {
  const { conversationId } = route.params;
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const user = useAuthStore((s) => s.user);
  const { messages, conversations, fetchMessages, sendMessage, typingIn } = useChatStore();
  const conversation = conversations.find((c) => c.id === conversationId);
  const listing = conversation?.listingId
    ? useListingStore.getState().listings.find((l) => l.id === conversation.listingId)
    : undefined;
  const chatMessages = messages[conversationId] || [];

  useEffect(() => {
    fetchMessages(conversationId);
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    await sendMessage(conversationId, msg);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {listing && (
        <View style={styles.contextCard}>
          <Image source={{ uri: listing.images[0] }} style={styles.contextImage} />
          <View style={styles.contextInfo}>
            <Text style={styles.contextTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <Text style={styles.contextPrice}>${listing.price.toLocaleString()}/mo</Text>
          </View>
          {listing.status === 'taken' && (
            <View style={styles.takenBadge}>
              <Text style={styles.takenText}>Taken</Text>
            </View>
          )}
        </View>
      )}

      {listing?.status === 'taken' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>This property is no longer available</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id;
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                {item.text}
              </Text>
              <Text style={[styles.time, isMe && styles.timeMe]}>
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
      />

      {typingIn[conversationId] && (
        <Text style={styles.typing}>Agent is typing...</Text>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    margin: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  contextImage: { width: 48, height: 48, borderRadius: radius.sm },
  contextInfo: { flex: 1 },
  contextTitle: { fontWeight: '600', fontSize: 14 },
  contextPrice: { color: colors.accent, fontSize: 13 },
  takenBadge: {
    backgroundColor: colors.taken,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  takenText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  banner: {
    backgroundColor: colors.taken,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  bannerText: { color: '#fff', textAlign: 'center', fontSize: 13 },
  messages: { padding: spacing.md, paddingBottom: spacing.sm },
  bubble: {
    maxWidth: '78%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 16, color: colors.text },
  bubbleTextMe: { color: '#fff' },
  time: { fontSize: 11, color: colors.textSecondary, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: 'rgba(255,255,255,0.7)' },
  typing: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendBtn: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
