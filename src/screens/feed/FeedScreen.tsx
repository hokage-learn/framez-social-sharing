import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../state/auth';
import { useTheme } from '../../theme';
import {
  subscribeToPosts,
  formatTimestamp,
  likePost,
  unlikePost,
  addComment,
  type Post,
} from '../../services/posts';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { User } from 'firebase/auth';

type FeedScreenNavigation = BottomTabNavigationProp<
  MainTabParamList,
  'Feed'
> & NativeStackNavigationProp<RootStackParamList>;

type PostItemProps = {
  item: Post;
  user: User | null;
  navigation: FeedScreenNavigation;
  isDark: boolean;
  styles: any;
};

const PostItem = memo(({ item, user, navigation, isDark, styles }: PostItemProps) => {
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const isLiked = user ? item.likes.includes(user.uid) : false;
  const likeCount = item.likes.length;
  const commentCount = item.comments.length;
  // Show only the first comment, or all if expanded
  const displayedComments = showAllComments ? item.comments : (item.comments.length > 0 ? [item.comments[0]] : []);

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like posts');
      return;
    }
    try {
      if (isLiked) {
        await unlikePost(item.id, user.uid);
      } else {
        await likePost(item.id, user.uid);
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
      await addComment(item.id, user, commentText);
      setCommentText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <View
      style={[
        styles.postCard,
        { 
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderBottomColor: isDark ? '#262626' : '#EFEFEF',
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.headerUserInfo}>
            {item.userAvatar ? (
              <Image
                source={{ uri: item.userAvatar }}
                style={styles.headerAvatar}
              />
            ) : (
              <View
                style={[
                  styles.headerAvatarPlaceholder,
                  { backgroundColor: isDark ? '#363636' : '#DBDBDB' },
                ]}
              >
                <Text style={[styles.headerAvatarText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {item.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.headerUserDetails}>
              <Text style={[styles.headerUserName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {item.userName}
              </Text>
              <View style={styles.timestampRow}>
                <Text style={[styles.headerTimestamp, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                  {formatTimestamp(item.createdAt)}
                </Text>
                {item.editedAt && (
                  <Text style={[styles.editedLabel, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                    {' • edited'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Post Content */}
        {item.text ? (
          <View style={styles.postContent}>
            <Text style={[styles.postText, { color: isDark ? '#F5F5F5' : '#262626' }]}>
              {item.text}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

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
          {commentCount > 1 && !showAllComments && (
            <TouchableOpacity
              onPress={() => setShowAllComments(true)}
              style={styles.viewCommentsButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewCommentsText, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                View all {commentCount} comments
              </Text>
            </TouchableOpacity>
          )}
          {displayedComments.map((comment) => (
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
          {showAllComments && commentCount > 1 && (
            <TouchableOpacity
              onPress={() => setShowAllComments(false)}
              style={styles.viewCommentsButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewCommentsText, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                View fewer comments
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Comment Input */}
      {user && (
        <View style={[styles.commentInputSection, { borderTopColor: isDark ? '#262626' : '#EFEFEF' }]}>
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
                <Text style={[styles.commentPostText, { color: commentText.trim() ? '#0095F6' : (isDark ? '#8E8E8E' : '#8E8E8E') }]}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

PostItem.displayName = 'PostItem';

export const FeedScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { tokens, mode } = useTheme();
  const navigation = useNavigation<FeedScreenNavigation>();
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  
  // Banner data
  const banner = {
    title: 'Welcome to Framez',
    subtitle: 'Share your moments with the community',
    imageUrl: 'https://www.brandbastion.com/hubfs/social-media-community-blogpost.png',
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
      setRefreshing(false);
      clearTimeout(timeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const renderPost = ({ item }: { item: Post }) => {
    return <PostItem item={item} user={user} navigation={navigation} isDark={isDark} styles={styles} />;
  };

  const renderBanner = () => {
    return (
      <View style={styles.bannerWrapper}>
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              shadowColor: isDark ? '#000000' : '#000000',
            },
          ]}
        >
          <ImageBackground
            source={{ uri: banner.imageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bannerContent}>
              <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>
                {banner.title}
              </Text>
              <Text style={[styles.bannerSubtitle, { color: '#FFFFFF' }]}>
                {banner.subtitle}
              </Text>
            </View>
          </ImageBackground>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FAFAFA' }]}
      edges={['top']}
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
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Framez
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost')}
          style={styles.createButton}
          activeOpacity={0.7}
        >
          <View style={[styles.createButtonIcon, { backgroundColor: isDark ? '#262626' : '#F0F0F0' }]}>
            <Text style={[styles.createButtonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderBanner}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
            colors={['#0095F6']}
            progressViewOffset={20}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}>
              <Text style={styles.emptyIcon}>📱</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              No Posts Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
              Be the first to share something with the Framez community!
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: '#0095F6' }]}
              onPress={() => navigation.navigate('CreatePost')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  createButton: {
    padding: 4,
  },
  createButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  listContent: {
    paddingBottom: 100,
  },
  bannerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  bannerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  bannerContent: {
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerUserDetails: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  headerTimestamp: {
    fontSize: 12,
    fontWeight: '400',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  viewCommentsButton: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  viewCommentsText: {
    fontSize: 14,
    fontWeight: '400',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    letterSpacing: 0.1,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: '#0095F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
