import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SectionHeader } from '../../../components/ui';
import { Trainer } from '../../scheduling/types';
import { getTrainers } from '../../scheduling/data/mockData';
import { COLORS } from '../../../constants';

// Import the navigation types
type ClientMessagingParamList = {
  ClientMessages: undefined;
  ClientConversation: {
    participantId: string;
    participantName: string;
    participantAvatar?: string;
  };
  SelectTrainer: undefined;
  ComposeMessage: {
    trainerId: string;
    trainerName: string;
    trainerSpecialty?: string;
  };
};

type SelectTrainerScreenProps = {
  navigation: StackNavigationProp<ClientMessagingParamList, 'SelectTrainer'>;
};

export const SelectTrainerScreen: React.FC<SelectTrainerScreenProps> = ({ navigation }) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      // Get available trainers from scheduling data
      const availableTrainers = getTrainers();
      setTrainers(availableTrainers);
    } catch (error) {
      console.error('Error loading trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerSelect = (trainer: Trainer) => {
    // Navigate to compose message screen with selected trainer
    navigation.navigate('ComposeMessage', {
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerSpecialty: trainer.specialty,
    });
  };

  const renderTrainerCard = (trainer: Trainer) => (
    <TouchableOpacity
      key={trainer.id}
      style={styles.trainerCard}
      onPress={() => handleTrainerSelect(trainer)}
    >
      <View style={styles.trainerInfo}>
        <View style={styles.trainerHeader}>
          <Text style={styles.trainerName}>{trainer.name}</Text>
          {trainer.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {trainer.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.trainerSpecialty}>{trainer.specialty}</Text>
        
        {trainer.bio && (
          <Text style={styles.trainerBio} numberOfLines={2}>
            {trainer.bio}
          </Text>
        )}
      </View>
      
      <View style={styles.messageButton}>
        <Text style={styles.messageButtonText}>Message</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SectionHeader title="Select Trainer" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trainers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionHeader 
        title="Select Trainer" 
        subtitle="Choose a trainer to start a conversation"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {trainers.map(renderTrainerCard)}
        
        {trainers.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trainers available at the moment.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  trainerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  ratingContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  trainerSpecialty: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  trainerBio: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  messageButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});