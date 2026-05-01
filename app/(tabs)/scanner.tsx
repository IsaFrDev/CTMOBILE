import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { API_BASE_URL } from '@/constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ScannerScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`${API_BASE_URL}/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setResult({ result: 'error', risk_score: 0, confidence: 0, findings: ['❌ Server bilan bog\'lanib bo\'lmadi'], details: 'Backend ishlamayapti yoki ulanish yo\'q.' });
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Link Scanner</Text>
        <Text style={styles.subtitle}>Shubhali linklarni real-time tekshiring</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="https://example.com" placeholderTextColor="#5A6785" value={url} onChangeText={setUrl} autoCapitalize="none" />
        <TouchableOpacity style={[styles.scanButton, { opacity: url ? 1 : 0.6 }]} onPress={handleScan} disabled={loading || !url}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.scanButtonText}>🔍 Skanerlash</Text>}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.resultCard, { borderColor: result.result === 'phishing' ? '#FF4757' : result.result === 'suspicious' ? '#FFA502' : '#2ED573' }]}>
          <View style={styles.resultHeader}>
            <IconSymbol name="shield.fill" size={40} color={result.result === 'phishing' ? '#FF4757' : result.result === 'suspicious' ? '#FFA502' : '#2ED573'} />
            <View>
              <Text style={[styles.resultStatus, { color: result.result === 'phishing' ? '#FF4757' : result.result === 'suspicious' ? '#FFA502' : '#2ED573' }]}>
                {result.result === 'phishing' ? '🔴 PHISHING!' : result.result === 'suspicious' ? '🟡 SHUBHALI' : '🟢 XAVFSIZ'}
              </Text>
              <Text style={styles.resultScore}>Risk: {result.risk_score}/100 · Confidence: {(result.confidence * 100).toFixed(0)}%</Text>
            </View>
          </View>
          <Text style={styles.resultDetails}>{result.details}</Text>
          <View style={styles.findingsList}>
            {(result.findings || []).map((f: string, i: number) => (
              <Text key={i} style={styles.findingItem}>{f}</Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, marginBottom: 30 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#8892B0', fontSize: 16, marginTop: 5 },
  inputContainer: { paddingHorizontal: 20, marginBottom: 30 },
  input: { backgroundColor: '#141B2D', borderRadius: 15, padding: 18, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15, fontFamily: 'monospace' },
  scanButton: { backgroundColor: '#00D4FF', borderRadius: 15, padding: 18, alignItems: 'center', elevation: 5 },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultCard: { marginHorizontal: 20, backgroundColor: '#141B2D', borderRadius: 20, padding: 20, borderWidth: 1.5, marginBottom: 30 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  resultStatus: { fontSize: 22, fontWeight: '900' },
  resultScore: { color: '#8892B0', fontSize: 13, marginTop: 2 },
  resultDetails: { color: '#E8EAF6', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  findingsList: { gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  findingItem: { color: '#8892B0', fontSize: 14 },
});
