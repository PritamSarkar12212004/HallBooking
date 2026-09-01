import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Animated,
    Dimensions,
    Modal as RNModal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Divider, Drawer, IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../const/theme/Theme';
import { MainRoute, TabRoute } from '../../const/routes/route';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 320);
const ANIM_DURATION = 260;

export interface AppMenuItem {
    key?: string;
    icon: string;
    label: string;
    active?: boolean;
    onPress?: () => void;
}

export interface AppMenuSection {
    title?: string;
    items: AppMenuItem[];
}

export interface AppDrawerHeader {
    title?: string;
    subtitle?: string;
    onClose?: () => void;
}

interface AppDrawerContextValue {
    isOpen: boolean;
    openDrawer: (
        sections?: AppMenuSection[],
        header?: AppDrawerHeader,
    ) => void;
    closeDrawer: () => void;
    setSections: (sections: AppMenuSection[]) => void;
    setHeader: (header: AppDrawerHeader) => void;
}

const AppDrawerContext = createContext<AppDrawerContextValue | undefined>(undefined);

export const useAppDrawer = () => {
    const ctx = useContext(AppDrawerContext);
    if (!ctx) {
        throw new Error('useAppDrawer must be used within <AppDrawer> (inside the Wrapper).');
    }
    return ctx;
};

const defaultSections = (navigation: any): AppMenuSection[] => [
    {
        title: 'MAIN MENU',
        items: [
            {
                key: 'home',
                icon: 'home-variant',
                label: 'Home',
                onPress: () => navigation.navigate(MainRoute.MainTabs, { screen: TabRoute.Home }),
            },
            {
                key: 'bookings',
                icon: 'calendar-check',
                label: 'Bookings',
                onPress: () => navigation.navigate(MainRoute.MainTabs, { screen: TabRoute.Bookings }),
            },
            {
                key: 'halls',
                icon: 'office-building',
                label: 'Halls',
                onPress: () => navigation.navigate(MainRoute.HallCalendar),
            },
        ],
    },
    {
        title: 'MORE',
        items: [
            {
                key: 'reports',
                icon: 'chart-box',
                label: 'Reports',
                onPress: () => navigation.navigate(MainRoute.Reports),
            },
            {
                key: 'profile',
                icon: 'account',
                label: 'Profile',
                onPress: () => navigation.navigate(MainRoute.Profile),
            },
        ],
    },
];

const AppDrawer = ({ children }: { children: React.ReactNode }) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [sections, setSections] = useState<AppMenuSection[] | null>(null);
    const [header, setHeader] = useState<AppDrawerHeader | null>(null);

    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setMounted(true);
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: ANIM_DURATION,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: ANIM_DURATION,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (mounted) {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -DRAWER_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => setMounted(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const openDrawer = useCallback(
        (sectionsArg?: AppMenuSection[], headerArg?: AppDrawerHeader) => {
            if (sectionsArg) setSections(sectionsArg);
            if (headerArg) setHeader(headerArg);
            setVisible(true);
        },
        [],
    );

    const closeDrawer = useCallback(() => setVisible(false), []);

    const value = useMemo<AppDrawerContextValue>(
        () => ({
            isOpen: visible,
            openDrawer,
            closeDrawer,
            setSections,
            setHeader,
        }),
        [visible, openDrawer, closeDrawer],
    );

    const itemsToRender = sections ?? defaultSections(navigation);
    const handleClose = header?.onClose ?? closeDrawer;

    return (
        <AppDrawerContext.Provider value={value}>
            {children}
        <RNModal
            visible={mounted}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <View style={styles.root}>
                <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
                    <Pressable style={styles.overlayPress} onPress={handleClose} />
                </Animated.View>

                <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
                    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                        <View style={{ flex: 1 }}>
                            <Text
                                variant="titleLarge"
                                style={{ color: Theme.text.primary, fontWeight: '700' }}
                            >
                                {header?.title ?? 'Menu'}
                            </Text>
                            {header?.subtitle ? (
                                <Text variant="bodySmall" style={{ color: Theme.text.secondary }}>
                                    {header.subtitle}
                                </Text>
                            ) : null}
                        </View>
                        <IconButton
                            icon="close"
                            size={22}
                            iconColor={Theme.text.primary}
                            containerColor={Theme.background.third}
                            style={{ margin: 0 }}
                            onPress={handleClose}
                        />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
                    >
                        {itemsToRender.map((section, idx) => (
                            <View key={section.title ?? `section-${idx}`}>
                                <Drawer.Section title={section.title} showDivider={false}>
                                    {section.items.map((item) => (
                                        <Drawer.Item
                                            key={item.key ?? item.label}
                                            icon={item.icon}
                                            label={item.label}
                                            active={item.active}
                                            theme={{
                                                colors: {
                                                    primary: Theme.button.primary,
                                                    secondaryContainer: Theme.background.third,
                                                    onSecondaryContainer: Theme.text.primary,
                                                    onSurfaceVariant: Theme.text.secondary,
                                                },
                                            }}
                                            onPress={() => {
                                                closeDrawer();
                                                item.onPress?.();
                                            }}
                                        />
                                    ))}
                                </Drawer.Section>
                                {idx < itemsToRender.length - 1 ? (
                                    <Divider style={{ backgroundColor: Theme.border.primary }} />
                                ) : null}
                            </View>
                        ))}
                    </ScrollView>
                </Animated.View>
            </View>
        </RNModal>
        </AppDrawerContext.Provider>
    );
};

export default AppDrawer;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    overlayPress: {
        flex: 1,
    },
    panel: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: DRAWER_WIDTH,
        backgroundColor: Theme.background.secondary,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Theme.border.primary,
    },
});