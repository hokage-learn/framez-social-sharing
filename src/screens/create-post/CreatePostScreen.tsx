import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../state/auth';
import { useTheme } from '../../theme';
import { createPost } from '../../services/posts';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type CreatePostScreenNavigation = BottomTabNavigationProp<
  MainTabParamList,
  'CreatePost'
>;

export const CreatePostScreen = () => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthStore();
  const { tokens } = useTheme();
  const navigation = useNavigation<CreatePostScreenNavigation>();

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please add some text to your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting post creation...');
      // Create post in Firestore
      const postId = await createPost(user, {
        text: text.trim(),
      });
      console.log('Post created with ID:', postId);

      // Reset form and navigate to Feed tab
      setText('');
      // Navigate to Feed tab after successful post
      navigation.navigate('Feed');
    } catch (error: any) {
      console.error('Error in handlePost:', error);
      const errorMessage = error.message || 'Failed to create post. Please check your connection and try again.';
      Alert.alert('Error Creating Post', errorMessage, [
        { text: 'OK', onPress: () => setUploading(false) }
      ]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tokens.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { borderBottomColor: tokens.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: tokens.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>
            New Post
          </Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={uploading || !text.trim()}
            style={[
              styles.postButton,
              {
                backgroundColor: tokens.accent,
                opacity: uploading || !text.trim() ? 0.5 : 1,
              },
            ]}
            activeOpacity={0.8}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.userSection}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: tokens.accent },
                ]}
              >
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={[styles.username, { color: tokens.textPrimary }]}>
              @{user?.displayName || 'user'}
            </Text>
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                color: tokens.textPrimary,
                backgroundColor: tokens.surface,
              },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor={tokens.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <Text style={[styles.charCount, { color: tokens.textSecondary }]}>
            {text.length}/500
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
});

