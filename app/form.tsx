import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FormScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'faible' | 'moyenne' | 'élevée'>('faible');
  const [noteId, setNoteId] = useState<number | null>(null);

  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.id) {
      loadNote(Number(params.id));
    }
  }, [params]);

  const loadNote = async (id: number) => {
    const storedNotes = await AsyncStorage.getItem('notes');
    if (storedNotes) {
      const notes = JSON.parse(storedNotes);
      const note = notes.find((n: any) => n.id === id);
      if (note) {
        setNoteId(note.id);
        setTitle(note.title);
        setDescription(note.description);
        setPriority(note.priority || 'faible');
      }
    }
  };

  const saveNote = async () => {
    const storedNotes = await AsyncStorage.getItem('notes');
    let notes = storedNotes ? JSON.parse(storedNotes) : [];

    if (noteId !== null) {
      notes = notes.map((note: any) =>
        note.id === noteId ? { ...note, title, description, priority } : note
      );
    } else {
      const newNote = {
        id: Date.now(),
        title,
        description,
        priority,
        createdAt: new Date().toISOString(),
      };
      notes.push(newNote);
    }

    await AsyncStorage.setItem('notes', JSON.stringify(notes));
    router.push('/');
  };

  const deleteNote = async () => {
    if (noteId === null) return;

    Alert.alert('Confirmation', 'Supprimer cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const storedNotes = await AsyncStorage.getItem('notes');
          if (storedNotes) {
            const notes = JSON.parse(storedNotes);
            const updatedNotes = notes.filter((note: any) => note.id !== noteId);
            await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
            router.push('/');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Titre de la note"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Contenu de la note"
        multiline
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {['faible', 'moyenne', 'élevée'].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.priorityButton,
              priority === value && styles.priorityButtonSelected,
            ]}
            onPress={() => setPriority(value as any)}
          >
            <Text style={{ color: priority === value ? '#fff' : '#000' }}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="SAVE" onPress={saveNote} />
      </View>

      {noteId !== null && (
        <View style={styles.buttonContainer}>
          <Button title="Supprimer" color="red" onPress={deleteNote} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#7EE4EC',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 5,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  priorityButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  priorityButtonSelected: {
    backgroundColor: '#f45B69',
  },
  buttonContainer: {
    marginTop: 20,
    
  },
});
