import { StyleSheet, View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/stats/recent-scans?limit=10`).then(r => r.json()),
    ]).then(([s, scans]) => {
      setStats(s);
      setRecentScans(scans);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#00D4FF" /></View>;

  const statCards = [
    { label: 'Jami skanlar', value: stats?.total_scans || 0, color: '#00D4FF' },
    { label: 'Phishing', value: stats?.phishing_detected || 0, color: '#FF4757' },
    { label: 'Foydalanuvchilar', value: stats?.total_users || 0, color: '#2ED573' },
    { label: 'Shubhali', value: stats?.suspicious_detected || 0, color: '#FFA502' },
  ];

  const days = stats?.daily_stats || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Dashboard</Text>
        <Text style={styles.subtitle}>Real-time platforma statistikasi</Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((item, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {days.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📈 Oxirgi 7 kun</Text>
          <View style={styles.chartContainer}>
            {days.slice(0, 7).map((d: any, i: number) => {
              const max = Math.max(...days.map((x: any) => x.scans), 1);
              const h = Math.max((d.scans / max) * 80, 5);
              return (
                <View key={i} style={styles.barWrap}>
                  <Text style={styles.barValue}>{d.scans}</Text>
                  <View style={[styles.bar, { height: h, backgroundColor: d.threats > 0 ? '#FF4757' : '#00D4FF' }]} />
                  <Text style={styles.barLabel}>{d.date?.slice(5) || ''}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Oxirgi skanlar</Text>
      {recentScans.map((scan: any, i: number) => (
        <View key={i} style={styles.scanItem}>
          <Text style={[styles.scanBadge, { color: scan.result === 'phishing' ? '#FF4757' : scan.result === 'suspicious' ? '#FFA502' : '#2ED573' }]}>
            {scan.result === 'phishing' ? '🔴' : scan.result === 'suspicious' ? '🟡' : '🟢'} {scan.result?.toUpperCase()}
          </Text>
          <Text style={styles.scanType}>{scan.scan_type} · {scan.confidence ? (scan.confidence * 100).toFixed(0) + '%' : ''}</Text>
          <Text style={styles.scanDate}>{scan.created_at?.slice(0, 16)}</Text>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#0A0E1A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, marginBottom: 25 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#8892B0', fontSize: 16, marginTop: 5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 10, marginBottom: 25 },
  statCard: { width: (width - 40) / 2 - 5, backgroundColor: '#141B2D', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#8892B0', fontSize: 12, marginTop: 5 },
  chartCard: { marginHorizontal: 20, backgroundColor: '#0F1629', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  chartTitle: { color: '#E8EAF6', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barWrap: { alignItems: 'center', gap: 6 },
  bar: { width: 14, borderRadius: 7 },
  barLabel: { color: '#5A6785', fontSize: 9 },
  barValue: { color: '#00D4FF', fontSize: 10, fontWeight: '700' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 15 },
  scanItem: { marginHorizontal: 20, backgroundColor: '#141B2D', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  scanBadge: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  scanType: { color: '#8892B0', fontSize: 12 },
  scanDate: { color: '#5A6785', fontSize: 11, marginTop: 4 },
});
