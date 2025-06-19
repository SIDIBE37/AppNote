import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

interface Note {
  id: number;
  title: string;
  description: string;
  priority: 'faible' | 'moyenne' | 'élevée';
  createdAt: string;
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    loadNotes();
  }, [isFocused]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Erreur de chargement des notes', error);
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Confirmer la suppression', 'Supprimer cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const storedNotes = await AsyncStorage.getItem('notes');
          if (storedNotes) {
            const notes = JSON.parse(storedNotes);
            const updatedNotes = notes.filter((note: Note) => note.id !== id);
            await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
            loadNotes();
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity onPress={() => router.push(`/form?id=${item.id}`)}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={() => confirmDelete(item.id)}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.meta}>
          Priorité : {item.priority} | {item.createdAt.slice(0, 10).split('-').reverse().join('/')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mes Notes</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Aucune note pour le moment.</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/form')}>
        <Text style={styles.addButtonText}>+ Ajouter nouvelle note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
