import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../state/auth';
import { useTheme } from '../../theme';
import {
  subscribeToUserPosts,
  subscribeToPosts,
  formatTimestamp,
  type Post,
} from '../../services/posts';
import { getUserProfile, type UserProfile } from '../../services/users';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type ProfileScreenNavigation = BottomTabNavigationProp<
  MainTabParamList,
  'Profile'
> & NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuthStore();
  const { tokens, mode } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigation>();
  const isDark = mode === 'dark';

  useEffect(() => {
    if (!user) return;

    // Set a timeout to stop loading if subscription doesn't fire quickly
    const timeout = setTimeout(() => {
      setLoading(false);
      console.log('Profile posts loading timeout - setting loading to false');
    }, 2000);

    // Load user profile
    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        console.log('Profile loaded:', userProfile);
      } catch (error) {
        console.warn('Error loading profile:', error);
      }
    };
    loadProfile();

    // Subscribe to user's posts
    console.log('Subscribing to user posts for:', user.uid);
    const unsubscribeUserPosts = subscribeToUserPosts(user.uid, (newPosts) => {
      console.log('User posts received:', newPosts.length);
      setPosts(newPosts);
      setLoading(false);
      setRefreshing(false);
      clearTimeout(timeout);
    });

    // Subscribe to all posts to count user's comments
    const unsubscribeAllPosts = subscribeToPosts((allPostsData) => {
      setAllPosts(allPostsData);
    });

    return () => {
      unsubscribeUserPosts();
      unsubscribeAllPosts();
      clearTimeout(timeout);
    };
  }, [user]);

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (error) {
      console.warn('Error refreshing profile:', error);
    }
    // Posts will update via subscription
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ],
    );
  };

  const renderPost = ({ item }: { item: Post }) => {
    return (
      <TouchableOpacity
        style={[
          styles.postItem,
          {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            borderBottomColor: isDark ? '#262626' : '#EFEFEF',
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      >
        {/* Post Content */}
        <View style={styles.postContent}>
          <Text
            style={[styles.postText, { color: isDark ? '#F5F5F5' : '#262626' }]}
            numberOfLines={4}
          >
            {item.text}
          </Text>
        </View>

        {/* Post Meta */}
        <View style={styles.postMeta}>
          <View style={styles.postMetaLeft}>
            <Text style={[styles.postTimestamp, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
          <View style={styles.postMetaRight}>
            {item.likes.length > 0 && (
              <View style={styles.postStat}>
                <Text style={styles.postStatIcon}>❤️</Text>
                <Text style={[styles.postStatText, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                  {item.likes.length}
                </Text>
              </View>
            )}
            {item.comments.length > 0 && (
              <View style={styles.postStat}>
                <Text style={styles.postStatIcon}>💬</Text>
                <Text style={[styles.postStatText, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                  {item.comments.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
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

  const displayName = profile?.username || user?.displayName || 'user';
  const displayEmail = profile?.email || user?.email || '';
  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
  // Comments on my posts
  const commentsOnMyPosts = posts.reduce((sum, post) => sum + post.comments.length, 0);
  // Comments I've made on other posts
  const commentsIMade = allPosts.reduce((sum, post) => {
    return sum + post.comments.filter((comment) => comment.userId === user?.uid).length;
  }, 0);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: isDark ? '#262626' : '#EFEFEF' },
        ]}
      >
        <Text style={[styles.headerUsername, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {displayName}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={styles.headerIconButton}
            activeOpacity={0.6}
          >
            <View style={[styles.addIconContainer, { backgroundColor: isDark ? '#262626' : '#F0F0F0' }]}>
              <Text style={[styles.addIcon, { color: isDark ? '#FFFFFF' : '#000000' }]}>+</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.headerIconButton}
            activeOpacity={0.6}
          >
            <Text style={[styles.logoutIcon, { color: isDark ? '#FFFFFF' : '#000000' }]}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
            colors={['#0095F6']}
            progressViewOffset={20}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile?.avatar || user?.photoURL ? (
              <Image
                source={{ uri: profile?.avatar || user?.photoURL || '' }}
                style={[styles.avatar, { borderColor: isDark ? '#363636' : '#DBDBDB' }]}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { 
                    backgroundColor: isDark ? '#262626' : '#DBDBDB',
                    borderColor: isDark ? '#363636' : '#DBDBDB',
                  },
                ]}
              >
                <Text style={[styles.avatarText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {posts.length}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                posts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {commentsOnMyPosts}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                comments{'\n'}received
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {commentsIMade}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                comments{'\n'}made
              </Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={[styles.bioName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {displayName}
          </Text>
          {displayEmail && (
            <Text style={[styles.bioEmail, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
              {displayEmail}
            </Text>
          )}
          {totalLikes > 0 || commentsOnMyPosts > 0 ? (
            <View style={styles.bioStats}>
              <Text style={[styles.bioStatsText, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
                {totalLikes} likes • {commentsOnMyPosts} comments received
              </Text>
            </View>
          ) : null}
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: isDark ? '#0095F6' : '#0095F6',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.primaryButtonText}>Create Post</Text>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDark ? '#262626' : '#F0F0F0',
                borderColor: isDark ? '#363636' : '#DBDBDB',
              },
            ]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={[styles.secondaryButtonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View
          style={[
            styles.tabsContainer,
            { borderBottomColor: isDark ? '#262626' : '#EFEFEF' },
          ]}
        >
          <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
            <View style={[styles.tabIndicator, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]} />
            <Text style={[styles.tabLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              POSTS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts List */}
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA' },
              ]}
            >
              <Text style={styles.emptyIcon}>📝</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Share Your Story
            </Text>
            <Text style={[styles.emptyDescription, { color: isDark ? '#A8A8A8' : '#8E8E8E' }]}>
              When you share posts, they will appear on your profile for others to see and engage with.
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyButton,
                { backgroundColor: '#0095F6' },
              ]}
              onPress={() => navigation.navigate('CreatePost')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Share Your First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.postsListContainer}>
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerUsername: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  logoutIcon: {
    fontSize: 24,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '600',
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  bioSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bioName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  bioEmail: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  bioStats: {
    marginTop: 4,
  },
  bioStatsText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  primaryButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0095F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  tabIndicator: {
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  postsListContainer: {
    paddingTop: 8,
  },
  postItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postMetaLeft: {
    flex: 1,
  },
  postMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  postTimestamp: {
    fontSize: 12,
    fontWeight: '400',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postStatIcon: {
    fontSize: 14,
  },
  postStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 26,
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
