import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, TextInput, ActivityIndicator, Platform, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { API_BASE_URL } from '@/constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Brauzer oynasini yopish uchun kerak
WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery endpointlari
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/token/revoke',
};

export default function EmailsScreen() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [emailText, setEmailText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 1. Google Auth Request sozlamalari
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "47473682665-l0od8aalgp6doikk0bpu347nhup46jao.apps.googleusercontent.com",
      scopes: [
        'openid', 
        'https://www.googleapis.com/auth/userinfo.email', 
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      // MUHIM: Proxy havolasini qat'iy (hardcode) yozamiz
      redirectUri: "https://auth.expo.io/@islombekmansurov/ct-mobile-app",
      useProxy: true,
    },
    discovery
  );

  // 2. Login javobini kuzatish
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleLoginSuccess(authentication?.accessToken);
    } else if (response?.type === 'error') {
      console.error("Auth Error: ", response.error);
    }
  }, [response]);

  const handleLoginSuccess = async (token: string | undefined) => {
    if (!token) return;
    setIsConnecting(true);
    try {
      // User ma'lumotlarini olish
      const userResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userResp.json();
      setUserAccount(userData);

      // Xatlarni yuklashni boshlash
      fetchGmailMessages(token);
    } catch (e) {
      console.error("User info fetch error:", e);
    }
    setIsConnecting(false);
  };

  const fetchGmailMessages = async (token: string) => {
    setLoading(true);
    try {
      // Oxirgi 10 ta xatni olish
      const listResp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listResp.json();
      
      const emailDetails = [];
      if (listData.messages) {
        for (const msg of listData.messages) {
          const detailResp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const detailData = await detailResp.json();
          
          // Xatni bizning backendda tahlil qilish
          const analysisResp = await fetch(`${API_BASE_URL}/scan/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: detailData.snippet })
          });
          const analysisData = await analysisResp.json();

          emailDetails.push({
            id: msg.id,
            sender: detailData.payload.headers.find((h: any) => h.name === 'From')?.value || 'Noma\'lum',
            text: detailData.snippet,
            ...analysisData,
            time: new Date(parseInt(detailData.internalDate)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
      setResults(emailDetails);
    } catch (e) {
      console.error("Gmail fetch error:", e);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📧 Email Monitor</Text>
        <Text style={styles.subtitle}>Real-vaqtda Gmail tahlili</Text>
      </View>

      <View style={styles.monitorCard}>
        {!userAccount ? (
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Gmailni ulang</Text>
            <Text style={styles.loginDesc}>Monitoringni yoqish uchun Google orqali kiring.</Text>
            <TouchableOpacity 
              style={styles.googleBtn} 
              onPress={() => promptAsync()}
              disabled={!request || isConnecting}
            >
              {isConnecting ? <ActivityIndicator color="#000" /> : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleBtnText}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>ULANGAN POCHTA</Text>
                <Text style={styles.accountEmail}>{userAccount.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setUserAccount(null)}>
                <Text style={styles.logoutText}>O'chirish</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.monitorStatusRow}>
              <View style={[styles.dot, { backgroundColor: isEnabled ? '#2ED573' : '#FF4757' }]} />
              <Text style={styles.monitorStatusText}>Monitoring faol</Text>
              <Switch trackColor={{ false: '#767577', true: '#00D4FF' }} thumbColor="#fff" onValueChange={setIsEnabled} value={isEnabled} />
            </View>
          </View>
        )}
      </View>

      {results.length > 0 && <Text style={styles.sectionTitle}>Oxirgi tahlillar</Text>}
      <View style={styles.listContainer}>
        {results.map((msg) => (
          <View key={msg.id} style={[styles.messageCard, msg.result === 'phishing' ? styles.cardDanger : (msg.result === 'suspicious' ? styles.cardWarning : styles.cardSafe)]}>
            <View style={styles.cardHeader}>
              <View style={styles.senderInfo}>
                <Text style={styles.senderLabel}>YUBORUVCHI</Text>
                <Text style={styles.senderValue}>{msg.sender}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: msg.result === 'phishing' ? '#FF4757' : (msg.result === 'suspicious' ? '#FFA502' : '#2ED573') }]}>
                <Text style={styles.statusText}>{msg.result?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.contentText}>{msg.text}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.timeText}>{msg.time}</Text>
              {msg.result === 'phishing' && <Text style={styles.alertText}>⚠️ XAVFLI!</Text>}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#8892B0', fontSize: 16, marginTop: 5 },
  monitorCard: { marginHorizontal: 20, backgroundColor: '#141B2D', borderRadius: 24, padding: 24, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  loginContainer: { alignItems: 'center' },
  loginTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  loginDesc: { color: '#8892B0', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  googleBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 12 },
  googleIcon: { color: '#EA4335', fontSize: 20, fontWeight: '900' },
  googleBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  accountCard: {},
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  accountInfo: { flex: 1 },
  accountLabel: { color: '#5A6785', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  accountEmail: { color: '#00D4FF', fontSize: 15, fontWeight: '700' },
  logoutText: { color: '#FF4757', fontSize: 12, fontWeight: '600' },
  monitorStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  monitorStatusText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', paddingHorizontal: 20, marginBottom: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 50 },
  messageCard: { backgroundColor: '#141B2D', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1 },
  cardSafe: { borderColor: 'rgba(46, 213, 115, 0.2)' },
  cardWarning: { borderColor: 'rgba(255, 165, 2, 0.2)' },
  cardDanger: { borderColor: 'rgba(255, 71, 87, 0.3)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  senderInfo: { flex: 1 },
  senderLabel: { color: '#5A6785', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  senderValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  contentText: { color: '#8892B0', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  timeText: { color: '#5A6785', fontSize: 12 },
  alertText: { color: '#FF4757', fontSize: 12, fontWeight: '800' },
});
