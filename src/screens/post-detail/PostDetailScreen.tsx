import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../state/auth';
import { useTheme } from '../../theme';
import {
  formatTimestamp,
  likePost,
  unlikePost,
  addComment,
  editPost,
  deletePost,
  type Post,
} from '../../services/posts';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;
type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetail'
>;

export const PostDetailScreen = () => {
  const route = useRoute<PostDetailScreenRouteProp>();
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const { post } = route.params;
  const { user } = useAuthStore();
  const { tokens, mode } = useTheme();
  const isDark = mode === 'dark';

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isLiked = user ? post.likes.includes(user.uid) : false;
  const likeCount = post.likes.length;
  const commentCount = post.comments.length;
  const isOwnPost = user?.uid === post.userId;
  const isEdited = post.editedAt != null;

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like posts');
      return;
    }
    try {
      if (isLiked) {
        await unlikePost(post.id, user.uid);
      } else {
        await likePost(post.id, user.uid);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update like');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to comment');
      return;
    }
    if (!commentText.trim()) {
      return;
    }
    setSubmittingComment(true);
    try {
      await addComment(post.id, user, commentText);
      setCommentText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEdit = () => {
    setEditText(post.text);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      Alert.alert('Error', 'Post text cannot be empty');
      return;
    }
    setSavingEdit(true);
    try {
      await editPost(post.id, editText);
      setIsEditing(false);
      // Navigation will handle updating the post via subscription
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to edit post');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Post data will update via real-time subscription if implemented
    // For now, just reset refreshing after a short delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FAFAFA' }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            borderBottomColor: isDark ? '#262626' : '#EFEFEF',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Post
        </Text>
        {isOwnPost && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.headerActionButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerActionText, { color: isDark ? '#0095F6' : '#0095F6' }]}>
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.headerActionButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerActionText, { color: '#EF4444' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
            colors={['#0095F6']}
            progressViewOffset={20}
          />
        }
      >
        {/* Post Header */}
        <View
          style={[
            styles.postCard,
            { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
          ]}
        >
          <View style={styles.postHeader}>
            <View style={styles.headerUserInfo}>
              {post.userAvatar ? (
                <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: isDark ? '#363636' : '#DBDBDB' },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {post.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {post.userName}
                </Text>
                <View style={styles.timestampRow}>
                  <Text style={[styles.timestamp, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                    {formatTimestamp(post.createdAt)}
                  </Text>
                  {isEdited && (
                    <Text style={[styles.editedLabel, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                      • edited
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Post Content */}
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: isDark ? '#262626' : '#FAFAFA',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#363636' : '#DBDBDB',
                  },
                ]}
                value={editText}
                onChangeText={setEditText}
                multiline
                maxLength={500}
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={[
                    styles.editButton,
                    {
                      backgroundColor: isDark ? '#262626' : '#F0F0F0',
                      borderColor: isDark ? '#363636' : '#DBDBDB',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.editButtonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  style={[styles.editButton, { backgroundColor: '#0095F6' }]}
                  activeOpacity={0.7}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.postContent}>
              <Text style={[styles.postText, { color: isDark ? '#F5F5F5' : '#262626' }]}>
                {post.text}
              </Text>
            </View>
          )}

          {/* Actions Bar */}
          <View style={styles.actionsBar}>
            <View style={styles.actionsLeft}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLike}
                activeOpacity={0.6}
                disabled={!user}
              >
                <Text style={styles.actionIcon}>
                  {isLiked ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
              <View style={styles.commentActionContainer}>
                <Text style={styles.actionIcon}>💬</Text>
                {commentCount > 0 && (
                  <Text style={[styles.actionCount, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {commentCount}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Likes Count */}
          {likeCount > 0 && (
            <View style={styles.likesSection}>
              <Text style={[styles.likesText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </Text>
            </View>
          )}

          {/* Comments Section */}
          {commentCount > 0 && (
            <View style={styles.commentsSection}>
              <Text style={[styles.commentsTitle, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                Comments ({commentCount})
              </Text>
              {post.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentContent}>
                    <Text style={[styles.commentAuthor, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {comment.userName}{' '}
                    </Text>
                    <Text style={[styles.commentText, { color: isDark ? '#F5F5F5' : '#262626' }]}>
                      {comment.text}
                    </Text>
                  </Text>
                  <Text style={[styles.commentTime, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                    {formatTimestamp(comment.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Comment Input */}
          {user && (
            <View
              style={[
                styles.commentInputSection,
                { borderTopColor: isDark ? '#262626' : '#EFEFEF' },
              ]}
            >
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: isDark ? '#262626' : '#FAFAFA',
                      color: isDark ? '#FFFFFF' : '#000000',
                      borderColor: isDark ? '#404040' : '#E0E0E0',
                    },
                  ]}
                  placeholder="Add a comment..."
                  placeholderTextColor={isDark ? '#8E8E8E' : '#8E8E8E'}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity
                  style={[
                    styles.commentPostButton,
                    {
                      opacity: submittingComment || !commentText.trim() ? 0.4 : 1,
                    },
                  ]}
                  onPress={handleAddComment}
                  disabled={submittingComment || !commentText.trim()}
                  activeOpacity={0.7}
                >
                  {submittingComment ? (
                    <ActivityIndicator color="#0095F6" size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.commentPostText,
                        { color: commentText.trim() ? '#0095F6' : (isDark ? '#8E8E8E' : '#8E8E8E') },
                      ]}
                    >
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Delete Post
            </Text>
            <Text style={[styles.modalMessage, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
              Are you sure you want to delete this post? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: isDark ? '#262626' : '#F0F0F0',
                    borderColor: isDark ? '#363636' : '#DBDBDB',
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
                activeOpacity={0.7}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerActionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
  },
  editedLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  editContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  editInput: {
    minHeight: 100,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 26,
  },
  commentActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  likesSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentContent: {
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  commentTime: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  commentInputSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 20,
    borderWidth: 1,
  },
  commentPostButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentPostText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

