import React, { useMemo, useState } from 'react';
import { Linking } from 'react-native';
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from '../../../lib/style/withTailwind';
import { FileText, Search } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import FullScreenImage from '../../ui/FullScreenImage';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildDocumentCards,
    documentDate,
    documentTypeOptions,
    filterDocuments,
    sortDocumentsByDate,
} from '../../../functions/ceo/AnalyticsFunction';

/** 📎 Documents — booking ke saath upload hui har file, preview ke saath. */
const DocumentsPanel = ({ analytics }: AnalyticsPanelProps) => {
    const { documents } = analytics;

    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState('all');
    const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);

    const cards = useMemo(() => buildDocumentCards(documents), [documents]);
    const typeOptions = useMemo(() => documentTypeOptions(documents), [documents]);

    const rows = useMemo(
        () =>
            sortDocumentsByDate(
                filterDocuments(documents.rows, { type: activeType, search }),
            ),
        [documents.rows, activeType, search],
    );

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={FileText}
                    tint={DashboardPalette.blue}
                    title="Documents"
                    sub="Payment proofs, meters, signatures, ID proofs"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            {/* Search */}
            <View
                className="flex-row items-center rounded-xl px-3.5"
                style={{
                    backgroundColor: DashboardPalette.card,
                    borderWidth: 1,
                    borderColor: DashboardPalette.border,
                }}
            >
                <Search size={16} color={DashboardPalette.inkMuted} />
                <TextInput
                    className="flex-1 py-3 px-3 text-[13px]"
                    style={{ color: DashboardPalette.ink }}
                    placeholder="Search customer, event, booking no…"
                    placeholderTextColor={DashboardPalette.inkMuted}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 ? (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setSearch('')}>
                        <Text
                            className="text-[11px] font-bold"
                            style={{ color: DashboardPalette.goldDeep }}
                        >
                            Clear
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Type filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
            >
                {[
                    { key: 'all', label: 'All documents', value: documents.total },
                    ...typeOptions,
                ].map((option) => {
                    const active = option.key === activeType;
                    return (
                        <TouchableOpacity
                            key={option.key}
                            activeOpacity={0.85}
                            onPress={() => setActiveType(option.key)}
                            className="px-3.5 py-2 rounded-full"
                            style={{
                                backgroundColor: active
                                    ? DashboardPalette.goldSoft
                                    : DashboardPalette.card,
                                borderWidth: 1,
                                borderColor: active
                                    ? DashboardPalette.gold
                                    : DashboardPalette.border,
                            }}
                        >
                            <Text
                                className="text-[11.5px] font-bold"
                                style={{
                                    color: active
                                        ? DashboardPalette.goldDeep
                                        : DashboardPalette.inkSoft,
                                }}
                            >
                                {option.label} · {option.value}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* List */}
            {rows.length === 0 ? (
                <Text className="text-xs" style={{ color: DashboardPalette.inkMuted }}>
                    No documents match this filter.
                </Text>
            ) : (
                <View className="gap-2.5">
                    {rows.map((row) => (
                        <TouchableOpacity
                            key={row.id}
                            activeOpacity={0.85}
                            onPress={() => setPreview({ url: row.url, label: row.label })}
                            className="rounded-2xl p-3 flex-row items-center"
                            style={{
                                backgroundColor: DashboardPalette.card,
                                borderWidth: 1,
                                borderColor: DashboardPalette.border,
                            }}
                        >
                            <Image
                                source={{ uri: row.url }}
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 12,
                                    backgroundColor: DashboardPalette.sheet,
                                }}
                                resizeMode="cover"
                            />

                            <View className="flex-1 px-3">
                                <Text
                                    className="text-[12.5px] font-bold"
                                    style={{ color: DashboardPalette.ink }}
                                    numberOfLines={1}
                                >
                                    {row.label}
                                </Text>
                                <Text
                                    className="text-[11px] mt-0.5"
                                    style={{ color: DashboardPalette.inkSoft }}
                                    numberOfLines={1}
                                >
                                    {[row.customerName, row.eventName, row.hallName]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </Text>
                                <Text
                                    className="text-[10px] mt-0.5"
                                    style={{ color: DashboardPalette.inkMuted }}
                                    numberOfLines={1}
                                >
                                    {[row.bookingNumber, documentDate(row.addedAt)]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => Linking.openURL(row.url)}
                                className="px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: DashboardPalette.goldSoft }}
                            >
                                <Text
                                    className="text-[10px] font-bold"
                                    style={{ color: DashboardPalette.goldDeep }}
                                >
                                    Open
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Full-screen preview */}
            <FullScreenImage
                uri={preview?.url ?? null}
                visible={!!preview}
                onClose={() => setPreview(null)}
                caption={preview?.label}
            />
        </View>
    );
};

export default DocumentsPanel;
