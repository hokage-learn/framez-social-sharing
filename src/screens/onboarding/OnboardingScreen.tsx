import { useRef, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type OnboardingScreenNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

// Background images - replace with your own image URLs
// Using Unsplash placeholders for now - you can replace these with your own images
const SLIDES = [
  {
    key: 'discover',
    headline: 'Share your world',
    body: 'Capture rich stories and visuals that resonate with the Framez community.',
    imageUrl:
      'https://images.unsplash.com/photo-1673767298248-b128f17f89af?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvbnRlbnQlMjBjcmVhdG9yfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000', // Community/people
  },
  {
    key: 'connect',
    headline: 'Connect with creators',
    body: 'Follow friends, explore new talent, and stay inspired with a vibrant feed.',
    imageUrl:
      'https://media.istockphoto.com/id/2217877638/photo/multiethnic-group-of-female-friends-looking-at-camera-cheerfully-embracing-each-other.jpg?s=612x612&w=0&k=20&c=3AnpPrP1NGcAyTSs2Gn_tptsgHNr-Uekw77Iiq61Grk=', // Creative/art
  },
  {
    key: 'express',
    headline: 'Express freely',
    body: 'Craft posts with text, photos, and motion that reflect your style.',
    imageUrl:
      'https://img.freepik.com/free-photo/skateboarder-action_23-2152024614.jpg?semt=ais_hybrid&w=740&q=80', // Expression/art
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937', // Fallback color if image doesn't load
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3.6,
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 44,
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bottomSection: {
    paddingTop: 24,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  indicatorDot: {
    height: 8,
    borderRadius: 999,
    marginHorizontal: 6,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  footerLinkRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLink: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  footerLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export const OnboardingScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);
  const { width } = useWindowDimensions();
  const navigation = useNavigation<OnboardingScreenNavigation>();

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  });

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems?.length) {
        const nextIndex = viewableItems[0].index ?? 0;
        if (typeof nextIndex === 'number') {
          setActiveIndex(nextIndex);
        }
      }
    },
  );

  const handleScrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    setActiveIndex(index);
  };

  const handlePrimaryAction = () => {
    const isLastSlide = activeIndex === SLIDES.length - 1;
    if (isLastSlide) {
      navigation.navigate('SignIn');
    } else {
      handleScrollToIndex(activeIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={viewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        renderItem={({ item }) => {
          return (
            <View style={[styles.slideContainer, { width }]}>
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                {/* Dark overlay gradient for text readability */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.75)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.overlay}>
                  <View style={styles.header}>
                    <Text style={styles.brand}>FRAMEZ</Text>
                    <TouchableOpacity
                      style={styles.skipButton}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('SignIn')}
                    >
                      <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.textContent}>
                    <Text style={styles.headline}>{item.headline}</Text>
                    <Text style={styles.body}>{item.body}</Text>
                  </View>

                  <View style={styles.bottomSection}>
                    <View style={styles.indicatorRow}>
                      {SLIDES.map((slide, idx) => {
                        const dotIsActive = idx === activeIndex;
                        return (
                          <View
                            key={slide.key}
                            style={[
                              styles.indicatorDot,
                              {
                                width: dotIsActive ? 48 : 24,
                                backgroundColor: dotIsActive
                                  ? '#FFFFFF'
                                  : 'rgba(255, 255, 255, 0.4)',
                              },
                            ]}
                          />
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      activeOpacity={0.8}
                      onPress={handlePrimaryAction}
                    >
                      <Text style={styles.primaryLabel}>
                        {activeIndex === SLIDES.length - 1
                          ? 'Get started'
                          : 'Next'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.footerLinkRow}>
                      <TouchableOpacity
                        style={styles.footerLink}
                        activeOpacity={0.6}
                        onPress={() => navigation.navigate('SignIn')}
                      >
                        <Text style={styles.footerLinkText}>
                          Already have an account?
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

