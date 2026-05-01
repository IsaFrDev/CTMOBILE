import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, TextInput, ActivityIndicator, DeviceEventEmitter, PermissionsAndroid, Platform, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SmsScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    requestSmsPermission();

    // Android Native SmsReceiver dan kelgan real SMSlarni qabul qilish
    if (Platform.OS === 'android') {
      const subscription = DeviceEventEmitter.addListener('onSmsReceived', async (event) => {
        if (isRegistered && isEnabled) {
          // Kelgan xabarni backendda (VirusTotal/AI) tahlil qilish
          try {
            const resp = await fetch(`${API_BASE_URL}/scan/message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: event.message }),
            });
            const analysisData = await resp.json();
            
            setMessages(prev => [{
              id: Date.now(),
              text: event.message,
              sender: event.sender,
              ...analysisData,
              time: event.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, ...prev]);
          } catch (e) {
            console.error("SMS analysis error:", e);
          }
        }
      });
      return () => subscription.remove();
    }
  }, [isEnabled, isRegistered]);

  const requestSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        ]);
        console.log('Permissions granted:', granted);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const registerNumber = () => {
    if (phoneNumber.length < 9) {
      Alert.alert("Xato", "Iltimos, to'g'ri telefon raqami kiriting!");
      return;
    }
    setLoading(true);
    // Simulyatsiya: Haqiqiy ulanish jarayoni
    setTimeout(() => {
      setIsRegistered(true);
      setLoading(false);
      Alert.alert("Muvaffaqiyatli", "Raqamingiz monitoring tizimiga ulandi!");
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 SMS Monitoring</Text>
        <Text style={styles.subtitle}>Phishing xabarlardan real-vaqtda himoya</Text>
      </View>

      {!isRegistered ? (
        <View style={styles.registerCard}>
          <Text style={styles.registerTitle}>Nomerizni ulang</Text>
          <Text style={styles.registerDesc}>Monitoringni boshlash uchun telefon raqamingizni kiriting.</Text>
          <TextInput 
            style={styles.input} 
            placeholder="+998 90 123 45 67" 
            placeholderTextColor="#5A6785"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity style={styles.registerBtn} onPress={registerNumber} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Ulash va Boshlash</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.monitorCard}>
          <View style={styles.monitorHeader}>
            <View style={styles.monitorInfo}>
              <Text style={styles.accountLabel}>ULANGAN RAQAM</Text>
              <Text style={styles.accountValue}>{phoneNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsRegistered(false)}>
              <Text style={styles.logoutText}>O'chirish</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: isEnabled ? '#2ED573' : '#FF4757' }]} />
            <Text style={styles.statusText}>{isEnabled ? 'Monitoring faol' : 'To\'xtatilgan'}</Text>
            <Switch 
              trackColor={{ false: '#767577', true: '#00D4FF' }} 
              thumbColor="#fff" 
              onValueChange={setIsEnabled} 
              value={isEnabled} 
            />
          </View>
        </View>
      )}

      {messages.length > 0 && <Text style={styles.sectionTitle}>Oxirgi tahlillar</Text>}
      <View style={styles.listContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageCard, msg.result === 'phishing' ? styles.cardDanger : (msg.result === 'suspicious' ? styles.cardWarning : styles.cardSafe)]}>
            <View style={styles.cardHeader}>
              <View style={styles.senderInfo}>
                <Text style={styles.senderLabel}>KIMDAN</Text>
                <Text style={styles.senderValue}>{msg.sender}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: msg.result === 'phishing' ? '#FF4757' : (msg.result === 'suspicious' ? '#FFA502' : '#2ED573') }]}>
                <Text style={styles.badgeText}>{msg.result?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.messageText}>{msg.text}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.timeText}>{msg.time}</Text>
              {msg.result === 'phishing' && <Text style={styles.warningText}>⚠️ PHISHING HAVFI!</Text>}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <IconSymbol name="shield.fill" size={20} color="#00D4FF" />
        <Text style={styles.infoText}>Kelgan har bir SMS AI algoritmlari orqali tekshiriladi.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#8892B0', fontSize: 16, marginTop: 5 },
  registerCard: { marginHorizontal: 20, backgroundColor: '#141B2D', borderRadius: 24, padding: 24, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  registerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  registerDesc: { color: '#8892B0', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 15, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  registerBtn: { backgroundColor: '#00D4FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  monitorCard: { marginHorizontal: 20, backgroundColor: '#141B2D', borderRadius: 24, padding: 24, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  monitorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  monitorInfo: { flex: 1 },
  accountLabel: { color: '#5A6785', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  accountValue: { color: '#00D4FF', fontSize: 18, fontWeight: '800' },
  logoutText: { color: '#FF4757', fontSize: 12, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
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
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  messageText: { color: '#8892B0', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  timeText: { color: '#5A6785', fontSize: 12 },
  warningText: { color: '#FF4757', fontSize: 11, fontWeight: '800' },
  infoCard: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 15, marginBottom: 100 },
  infoText: { flex: 1, color: '#5A6785', fontSize: 11 },
});
