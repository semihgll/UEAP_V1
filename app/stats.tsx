import { off, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { database } from '../firebaseConfig';

interface Session {
  id: string;
  EnemiesKilled: number;
  PlayerID: string;
  SessionID: string;
}

export default function GameStats() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  if (!database) {
    setError('Firebase başlatılamadı. Config dosyanızı kontrol edin.');
    setLoading(false);
    return;
  }
  
  const rootRef = ref(database, '/');
  
  fetchData();
  
  return () => {

    off(rootRef);
  };
}, []);

  const fetchData = () => {
    if (!database) {
      setError('Firebase bağlantısı yok');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const rootRef = ref(database, '/');
      
      onValue(rootRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          const sessionArray: Session[] = Object.keys(data)
            .filter(key => !key.startsWith('.')) 
            .map(key => ({
              id: key,
              EnemiesKilled: data[key].EnemiesKilled || 0,
              PlayerID: data[key].PlayerID || 'null',
              SessionID: data[key].SessionID || key
            }))
            .sort((a, b) => b.id.localeCompare(a.id)); 
          
          setSessions(sessionArray);
          setError(null);
        } else {
          console.log('⚠️ Veri boş');
          setSessions([]);
        }
        setLoading(false);
        setRefreshing(false);
      }, (err) => {
        console.error('❌ Veri çekme hatası:', err);
        setError('Veri çekme hatası: ' + err.message);
        setLoading(false);
        setRefreshing(false);
      });
    } catch (err: any) {
      console.error('❌ Firebase hatası:', err);
      setError('Firebase hatası: ' + err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.sessionTitle}>Oturum</Text>
        <Text style={styles.firebaseKey}>{item.id}</Text>
      </View>
      
      <Text style={styles.sessionId}>{item.SessionID}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statLabel}>Öldürülen Düşman</Text>
          <Text style={styles.statValue}>{item.EnemiesKilled}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👤</Text>
          <Text style={styles.statLabel}>Oyuncu ID</Text>
          <Text style={styles.statValue}>
            {item.PlayerID === 'null' || !item.PlayerID ? 'Yok' : item.PlayerID}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHelp}>Firebase ayarlarını kontrol edin</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🎮 Oyun İstatistikleri</Text>
        <Text style={styles.subHeader}>Toplam Oturum: {sessions.length}</Text>
      </View>
      
      {sessions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Henüz veri yok</Text>
          <Text style={styles.emptySubtext}>Unreal Engine'den veri gelmesi bekleniyor</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0066cc']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerContainer: { paddingVertical: 20, paddingHorizontal: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subHeader: { fontSize: 14, textAlign: 'center', color: '#666', marginTop: 5 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorIcon: { fontSize: 48, marginBottom: 15 },
  errorText: { fontSize: 16, color: '#d32f2f', textAlign: 'center', marginBottom: 10 },
  errorHelp: { fontSize: 14, color: '#999', textAlign: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 15 },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 10, fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#bbb' },
  listContainer: { padding: 15 },
  sessionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sessionTitle: { fontSize: 12, color: '#999', textTransform: 'uppercase', fontWeight: '600' },
  firebaseKey: { fontSize: 10, color: '#bbb', fontFamily: 'monospace' },
  sessionId: { fontSize: 13, color: '#666', marginBottom: 20, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 6 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  statItem: { flex: 1, alignItems: 'center', padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10 },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#999', marginBottom: 5, textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0066cc' },
});