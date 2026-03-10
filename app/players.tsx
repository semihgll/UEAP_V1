import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { database } from '../firebaseConfig';

interface Player {
  id: string;
  name: string;
  totalKills: number;
  sessionCount: number;
}

export default function Players() {
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) return;

    const rootRef = ref(database, '/');
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const stats: { [key: string]: Player } = {};

        Object.keys(data).forEach(key => {
          if (key.startsWith('.')) return;
          
          const session = data[key];
          const pId = session.PlayerID || 'Misafir_Oyuncu';
          const pName = session.PlayerID || 'İsimsiz Oyuncu'; // PlayerID'yi isim olarak kullan

          if (!stats[pId]) {
            stats[pId] = {
              id: pId,
              name: pName,
              totalKills: 0,
              sessionCount: 0,
            };
          }

          stats[pId].totalKills += (session.EnemiesKilled || 0);
          stats[pId].sessionCount += 1;
        });

        const sortedPlayers = Object.values(stats).sort((a, b) => b.totalKills - a.totalKills);
        setPlayerList(sortedPlayers);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
      </View>
      <View style={styles.playerStats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{item.sessionCount}</Text>
          <Text style={styles.statLabel}>Giriş</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{item.totalKills}</Text>
          <Text style={styles.statLabel}>Toplam Leş</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Oyuncu Sıralaması</Text>
      <FlatList
        data={playerList}
        renderItem={renderPlayer}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, textAlign: 'center' },
  playerCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    elevation: 2 
  },
  playerInfo: { flex: 1, justifyContent: 'center' },
  playerName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  playerStats: { flexDirection: 'row' },
  statBox: { alignItems: 'center', marginLeft: 15 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0066cc' },
  statLabel: { fontSize: 10, color: '#666' }
});