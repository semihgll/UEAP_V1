import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { database } from '../firebaseConfig';

interface GameSession {
  EnemiesKilled?: number;
  UsedSkills?: string[];
  [key: string]: any;
}

interface Stats {
  totalKills: number;
  averageKills: string | number;
  totalSessions: number;
  totalSkillsUsed: number;
}

interface Skill {
  name: string;
  count: number;
}

export default function Analysis() {
  const [stats, setStats] = useState<Stats>({
    totalKills: 0,
    averageKills: 0,
    totalSessions: 0,
    totalSkillsUsed: 0
  });

  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) return;

    const rootRef = ref(database, '/');
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessionKeys = Object.keys(data).filter(key => !key.startsWith('.'));
        const sessionValues = sessionKeys.map(key => data[key] as GameSession);

        const totalKills = sessionValues.reduce((sum, item) => sum + (item.EnemiesKilled || 0), 0);
        const totalSessions = sessionKeys.length;
        const averageKills = totalSessions > 0 ? (totalKills / totalSessions).toFixed(2) : 0;

        const skillCount: Record<string, number> = {};
        let totalSkillsUsed = 0;

        sessionValues.forEach(session => {
          if (session.UsedSkills && Array.isArray(session.UsedSkills)) {
            session.UsedSkills.forEach((skill: string) => {
              skillCount[skill] = (skillCount[skill] || 0) + 1;
              totalSkillsUsed++;
            });
          }
        });

        const skillsArray: Skill[] = Object.entries(skillCount)
          .sort((a, b) => b[1] - a[1])
          .map(([skill, count]) => ({
            name: skill,
            count: count
          }));

        setStats({ totalKills, averageKills, totalSessions, totalSkillsUsed });
        setSkillsData(skillsArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerEmoji}>📊</Text>
        <Text style={styles.header}>Oyun Analizi</Text>
        <Text style={styles.subHeader}>Detaylı performans istatistikleri</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>💀</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalKills}</Text>
          <Text style={styles.statLabel}>Toplam Öldürme</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📈</Text>
          </View>
          <Text style={styles.statValue}>{stats.averageKills}</Text>
          <Text style={styles.statLabel}>Ortalama Öldürme</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🎮</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Toplam Oturum</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>⚔️</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalSkillsUsed}</Text>
          <Text style={styles.statLabel}>Skill Kullanımı</Text>
        </View>
      </View>

      {skillsData.length > 0 ? (
        <View style={styles.skillSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 En Çok Kullanılan Skiller</Text>
            <Text style={styles.sectionSubtitle}>
              Toplam {skillsData.length} farklı skill kullanıldı
            </Text>
          </View>

          <View style={styles.topSkillCard}>
            <Text style={styles.topSkillBadge}>#1</Text>
            <Text style={styles.topSkillName}>{skillsData[0].name}</Text>
            <Text style={styles.topSkillCount}>{skillsData[0].count} kez kullanıldı</Text>
            <View style={styles.topSkillBar}>
              <View style={[styles.topSkillBarFill, { width: '100%' }]} />
            </View>
          </View>

          <View style={styles.skillsListContainer}>
            {skillsData.slice(1).map((skill, index) => {
              const percentage = (skill.count / skillsData[0].count) * 100;
              return (
                <View key={index} style={styles.skillItem}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillRank}>#{index + 2}</Text>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillValue}>{skill.count} kez</Text>
                  </View>
                  <View style={styles.skillBarContainer}>
                    <View
                      style={[
                        styles.skillBarFill,
                        { width: `${percentage}%` }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataEmoji}>🎮</Text>
          <Text style={styles.noDataTitle}>Henüz Skill Verisi Yok</Text>
          <Text style={styles.noDataText}>
            Oyunda skill kullanmaya başladığınızda
          </Text>
          <Text style={styles.noDataText}>
            burada detaylı analizler görünecek
          </Text>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500'
  },

  headerContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF'
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 10
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5
  },
  subHeader: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400'
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between'
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  statIcon: {
    fontSize: 24
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '500'
  },

  skillSection: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400'
  },

  topSkillCard: {
    backgroundColor: '#4ECDC4',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  topSkillBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12
  },
  topSkillName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  topSkillCount: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 15
  },
  topSkillBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  topSkillBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4
  },

  skillsListContainer: {
    gap: 15
  },
  skillItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  skillRank: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6C757D',
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 35,
    textAlign: 'center'
  },
  skillName: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600'
  },
  skillValue: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600'
  },
  skillBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden'
  },
  skillBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3
  },

  noDataContainer: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noDataEmoji: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10
  },
  noDataText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22
  }
});