import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { assets } from './src/assets';
import { demoLessons, demoProgress } from './src/data/demoData';
import { useAppStore, type TabKey } from './src/state/useAppStore';
import { colors, radii, spacing, typography } from './src/theme';

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'Home', icon: 'Home' },
  { key: 'lessons', label: 'Lessons', icon: 'Book' },
  { key: 'downloads', label: 'Downloads', icon: 'Down' },
  { key: 'progress', label: 'Progress', icon: 'Chart' },
  { key: 'settings', label: 'Settings', icon: 'Gear' },
];

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.shell}>
          <AppHeader />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'lessons' && <LessonCatalog />}
            {activeTab === 'downloads' && <DownloadsScreen />}
            {activeTab === 'progress' && <ProgressScreen />}
            {activeTab === 'settings' && <SettingsScreen />}
          </ScrollView>
          <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image source={assets.logos.brandWaveformMark} style={styles.brandMark} resizeMode="contain" />
        <View>
          <Text style={styles.brandName}>ShadowSpeak</Text>
          <Text style={styles.brandCaption}>Listen. Shadow. Improve.</Text>
        </View>
      </View>
      <View style={styles.streakPill}>
        <Text style={styles.streakText}>3 day</Text>
      </View>
    </View>
  );
}

function HomeScreen() {
  const lesson = demoLessons[0];

  return (
    <View style={styles.screenStack}>
      <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Recommended</Text>
          <Text style={styles.heroTitle}>{lesson.title}</Text>
          <Text style={styles.heroBody}>{lesson.durationMinutes} min audio-first practice</Text>
        </View>
        <Image source={assets.badges.brandWaveformNeutral} style={styles.heroArt} resizeMode="contain" />
      </View>
      <SectionTitle title="Today" action="View plan" />
      <View style={styles.metricGrid}>
        <MetricCard value="10m" label="Daily goal" />
        <MetricCard value="42m" label="This week" />
      </View>
      <PrimaryButton label="Start daily practice" />
      <InfoCard
        image={assets.illustrations.reminder}
        title="Tonight at 19:30"
        body="A local reminder helps turn practice into a quiet habit."
      />
    </View>
  );
}

function LessonCatalog() {
  return (
    <View style={styles.screenStack}>
      <SectionTitle title="Lessons" action="Filter" />
      <View style={styles.chipRow}>
        {['Beginner', 'Travel', '5-10 min'].map((chip) => (
          <View key={chip} style={styles.chip}>
            <Text style={styles.chipText}>{chip}</Text>
          </View>
        ))}
      </View>
      {demoLessons.map((lesson) => (
        <LessonCard key={lesson.lessonId} lesson={lesson} />
      ))}
    </View>
  );
}

function DownloadsScreen() {
  return (
    <View style={styles.screenStack}>
      <SectionTitle title="Offline Library" action="Manage" />
      <InfoCard
        image={assets.badges.practiceOfflineCloud}
        title="Ready offline"
        body="Downloaded lessons and queued progress stay available without a network."
      />
      {demoLessons.slice(0, 2).map((lesson) => (
        <LessonCard key={lesson.lessonId} lesson={lesson} badge="Downloaded" />
      ))}
    </View>
  );
}

function ProgressScreen() {
  return (
    <View style={styles.screenStack}>
      <SectionTitle title="Progress" action="History" />
      <View style={styles.metricGrid}>
        <MetricCard value={`${demoProgress.streakDays}`} label="Day streak" />
        <MetricCard value={`${demoProgress.minutesPracticed}`} label="Minutes" />
        <MetricCard value={`${demoProgress.completedLessonCount}`} label="Lessons" />
      </View>
      <InfoCard
        image={assets.badges.successStar}
        title="Recording comparison unlocked"
        body="Finish a session to compare native audio with your own recording."
      />
      <WaveformPreview />
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.screenStack}>
      <SectionTitle title="Settings" action="Edit" />
      <InfoCard
        image={assets.badges.brandWaveformAudio}
        title="Playback"
        body="Speed, pause timing, and screen-off practice preferences."
      />
      {['Reminder settings', 'Consent settings', 'Recording library', 'Account management'].map((item) => (
        <View key={item} style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>{item}</Text>
          <Text style={styles.settingsChevron}>›</Text>
        </View>
      ))}
    </View>
  );
}

function LessonCard({
  lesson,
  badge,
}: {
  lesson: (typeof demoLessons)[number];
  badge?: string;
}) {
  return (
    <View style={styles.lessonCard}>
      <View style={styles.lessonThumb}>
        <Text style={styles.lessonThumbText}>{lesson.topic.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.lessonBody}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonMeta}>
          {lesson.level} · {lesson.durationMinutes} min · {lesson.lines} lines
        </Text>
      </View>
      {badge ? (
        <View style={styles.smallBadge}>
          <Text style={styles.smallBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function InfoCard({
  image,
  title,
  body,
}: {
  image: number;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Image source={image} style={styles.infoImage} resizeMode="contain" />
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function PrimaryButton({ label }: { label: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function WaveformPreview() {
  const bars = [18, 34, 24, 52, 40, 28, 46, 22, 32, 16];

  return (
    <View style={styles.waveformCard}>
      <Text style={styles.infoTitle}>Practice waveform</Text>
      <View style={styles.waveform}>
        {bars.map((height, index) => (
          <View key={`${height}-${index}`} style={[styles.waveformBar, { height }]} />
        ))}
      </View>
    </View>
  );
}

function BottomTabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onChange(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  shell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    paddingTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  brandMark: {
    width: 44,
    height: 44,
  },
  brandName: {
    ...typography.h3,
    color: colors.text,
  },
  brandCaption: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  streakPill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  streakText: {
    ...typography.captionEmphasis,
    color: colors.secondary,
  },
  content: {
    padding: spacing[4],
    paddingBottom: 104,
  },
  screenStack: {
    gap: spacing[4],
  },
  heroCard: {
    minHeight: 172,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroCopy: {
    flex: 1,
    gap: spacing[2],
  },
  eyebrow: {
    ...typography.captionEmphasis,
    color: colors.secondary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.display,
    color: colors.text,
  },
  heroBody: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  heroArt: {
    width: 118,
    height: 118,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  sectionAction: {
    ...typography.bodySmallEmphasis,
    color: colors.primary,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing[4],
  },
  metricValue: {
    ...typography.h1,
    color: colors.primary,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radii.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    ...typography.bodyEmphasis,
    color: colors.surface,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  chipText: {
    ...typography.captionEmphasis,
    color: colors.text,
  },
  lessonCard: {
    minHeight: 88,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
  },
  lessonThumb: {
    width: 58,
    height: 58,
    borderRadius: radii.card,
    backgroundColor: '#F4E7D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonThumbText: {
    ...typography.bodyEmphasis,
    color: colors.secondary,
  },
  lessonBody: {
    flex: 1,
    gap: spacing[1],
  },
  lessonTitle: {
    ...typography.bodyEmphasis,
    color: colors.text,
  },
  lessonMeta: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  smallBadge: {
    backgroundColor: '#E8F4F0',
    borderRadius: radii.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  smallBadgeText: {
    ...typography.captionEmphasis,
    color: colors.success,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing[4],
  },
  infoImage: {
    width: 76,
    height: 76,
  },
  infoCopy: {
    flex: 1,
    gap: spacing[1],
  },
  infoTitle: {
    ...typography.bodyEmphasis,
    color: colors.text,
  },
  infoBody: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  settingsRow: {
    minHeight: 56,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  settingsLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingsChevron: {
    ...typography.h2,
    color: colors.textMuted,
  },
  waveformCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing[3],
    padding: spacing[4],
  },
  waveform: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waveformBar: {
    width: 14,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  bottomTabs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 76,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  tabIcon: {
    ...typography.captionEmphasis,
    color: colors.textMuted,
  },
  tabIconActive: {
    color: colors.primary,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
