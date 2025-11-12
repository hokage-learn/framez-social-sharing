import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { CreatePostScreen } from '../screens/create-post/CreatePostScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type MainTabParamList = {
  Feed: undefined;
  CreatePost: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const { tokens, mode } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: isDark ? '#8E8E8E' : '#8E8E8E',
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderTopColor: isDark ? '#262626' : '#EFEFEF',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, focused, size }) => {
            const iconSize = size || 24;
            return (
              <View
                style={[
                  styles.createIconContainer,
                  {
                    backgroundColor: focused
                      ? isDark
                        ? '#FFFFFF'
                        : '#000000'
                      : 'transparent',
                    borderColor: focused
                      ? isDark
                        ? '#FFFFFF'
                        : '#000000'
                      : isDark
                      ? '#404040'
                      : '#E0E0E0',
                  },
                ]}
              >
                <Ionicons
                  name="add"
                  size={iconSize}
                  color={
                    focused
                      ? isDark
                        ? '#000000'
                        : '#FFFFFF'
                      : isDark
                      ? '#8E8E8E'
                      : '#8E8E8E'
                  }
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  createIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

