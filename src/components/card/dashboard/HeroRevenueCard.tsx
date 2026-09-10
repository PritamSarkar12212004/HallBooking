import React from 'react';
import { View, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import { LinearGradient } from 'react-native-linear-gradient';
import { Sparkles, ArrowUpRight, CalendarCheck2, Wallet } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import { formatCompactINR } from '../../../functions/formate/CurrencyFormate';
import { DashboardStats } from '../../../interface/api/dashboardInterface';

interface HeroRevenueCardProps {
    stats?: DashboardStats;
    onPress: () => void;
}

const HeroRevenueCard = React.memo(({ stats, onPress }: HeroRevenueCardProps) => {
    const total = stats?.totalRevenue ?? 0;
    const collected = stats?.collectedAmount ?? 0;
    const today = stats?.todayEvents ?? 0;
    const pending = stats?.pendingPaymentsAmount ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0;

    return (
        <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
            <LinearGradient
                colors={['#FFD98A', '#F7B02F', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    borderRadius: 26,
                    padding: 20,
                    shadowColor: '#92400E',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.25,
                    shadowRadius: 18,
                    elevation: 6,
                    overflow: 'hidden',
                }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                        <Sparkles size={14} color="#3D2400" />
                        <Text className="text-[12px] font-extrabold tracking-[0.18em]" style={{ color: '#3D2400' }}>
                            TOTAL REVENUE
                        </Text>
                    </View>
                    <ArrowUpRight size={18} color="#3D2400" />
                </View>
                <Text className="text-[40px] font-black leading-[44px] mt-1.5" style={{ color: '#221300' }}>
                    {formatCompactINR(total)}
                </Text>

                <View className="mt-4">
                    <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-xs font-bold" style={{ color: '#3D2400' }}>
                            {formatCompactINR(collected)} collected
                        </Text>
                        <Text className="text-xs font-black" style={{ color: '#3D2400' }}>{pct}%</Text>
                    </View>
                    <View className="h-2.5 rounded-full bg-white/50 overflow-hidden">
                        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#1A1300' }} />
                    </View>
                </View>

                <View className="flex-row gap-2 mt-4">
                    <View className="flex-1 flex-row items-center rounded-xl px-3 py-2 bg-white/90">
                        <CalendarCheck2 size={13} color={DashboardPalette.ink} />
                        <Text className="text-xs font-bold ml-1.5" style={{ color: DashboardPalette.ink }}>{today} today</Text>
                    </View>
                    <View className="flex-1 flex-row items-center rounded-xl px-3 py-2 bg-white/90">
                        <Wallet size={13} color={DashboardPalette.goldDeep} />
                        <Text className="text-xs font-bold ml-1.5" style={{ color: DashboardPalette.ink }}>{formatCompactINR(pending)} due</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});

HeroRevenueCard.displayName = 'HeroRevenueCard';

export default HeroRevenueCard;