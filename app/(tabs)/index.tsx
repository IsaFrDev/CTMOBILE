import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ total_scans: 0, phishing_detected: 0, safe_scans: 0, total_users: 0, recent_scans: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/stats`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Salom, User!</Text>
            <Text style={styles.brandText}>CT <Text style={{ color: '#00D4FF' }}>Cyber Team</Text></Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <IconSymbol name="shield.fill" size={24} color="#2ED573" />
          </TouchableOpacity>
        </View>
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <View style={styles.statusIconContainer}>
              <IconSymbol name="shield.fill" size={32} color="#2ED573" />
            </View>
            <View>
              <Text style={styles.statusTitle}>Siz xavfsizsiz</Text>
              <Text style={styles.statusSubtitle}>Oxirgi tekshiruv: hozir</Text>
            </View>
          </View>
          <View style={styles.protectionBadge}><Text style={styles.protectionText}>ON</Text></View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tezkor amallar</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/scanner')}>
            <IconSymbol name="magnifyingglass" size={32} color="#00D4FF" />
            <Text style={styles.actionLabel}>Link Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/sms')}>
            <IconSymbol name="message.fill" size={32} color="#FFA502" />
            <Text style={styles.actionLabel}>SMS Check</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Real-time Statistika</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total_scans.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Skanlar</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#FF4757' }]}>{stats.phishing_detected}</Text>
            <Text style={styles.statLabel}>Phishing</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#2ED573' }]}>{stats.safe_scans}</Text>
            <Text style={styles.statLabel}>Xavfsiz</Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <IconSymbol name="chevron.right" size={20} color="#00D4FF" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Kiber-maslahat</Text>
            <Text style={styles.tipText}>Hech qachon bank kartangiz kodini SMS orqali yubormang.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 30, backgroundColor: '#0F1629', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcomeText: { color: '#8892B0', fontSize: 16 },
  brandText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  statusCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  statusIconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(46,213,115,0.1)', justifyContent: 'center', alignItems: 'center' },
  statusTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statusSubtitle: { color: '#8892B0', fontSize: 14 },
  protectionBadge: { backgroundColor: '#2ED573', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  protectionText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  content: { padding: 20 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 15, marginTop: 10 },
  actionsGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  actionCard: { flex: 1, backgroundColor: '#141B2D', borderRadius: 20, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionLabel: { color: '#E8EAF6', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#0F1629', borderRadius: 15, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statValue: { color: '#00D4FF', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#8892B0', fontSize: 12, marginTop: 4 },
  tipCard: { backgroundColor: 'rgba(0,212,255,0.05)', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: 'rgba(0,212,255,0.1)' },
  tipContent: { flex: 1 },
  tipTitle: { color: '#00D4FF', fontWeight: '700', fontSize: 14 },
  tipText: { color: '#8892B0', fontSize: 13, marginTop: 2 },
});
