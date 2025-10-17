import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { SectionHeader } from '../../components/ui';
import { mockTrainerData } from '../../data/mockData';

// Types for client data (matching Supabase schema)
interface Client {
  id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
  last_active: string;
  current_program: {
    id: string;
    title: string;
    start_date: string;
    progress: number;
  } | null;
  session_stats: {
    total_sessions: number;
    completed_sessions: number;
    last_session: string | null;
    next_session: string | null;
  };
  engagement: {
    streak_days: number;
    total_logins: number;
    missed_sessions: number;
    completion_rate: number;
    last_login: string;
  };
  status: 'active' | 'inactive';
}

interface Program {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  difficulty: string;
  created_by: string;
}

export const TrainerClientsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [clients, setClients] = useState<Client[]>(mockTrainerData.clients as Client[]);
  const [availablePrograms] = useState<Program[]>(mockTrainerData.availablePrograms as Program[]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for adding new client
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    programId: '',
    message: ''
  });  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  // Get status color based on client status and progress
  const getStatusColor = (client: Client) => {
    if (client.status === 'inactive') return '#ff6b6b';
    if (!client.current_program) return '#ffa726';
    if (client.current_program.progress >= 80) return '#4caf50';
    if (client.current_program.progress >= 50) return '#2196f3';
    return '#ff9800';
  };

  // Handle client actions
  const handleMessageClient = (client: Client) => {
    console.log('Message Client button pressed for:', client.full_name);
    console.log('Navigation object:', navigation);
    
    try {
      // Close the client modal first
      setShowClientModal(false);
      setSelectedClient(null);
      
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        // Navigate to Messages tab and open conversation with this client
        navigation.navigate('Messages', {
          screen: 'TrainerConversation',
          params: {
            participantId: client.id,
            participantName: client.full_name,
            participantAvatar: client.profile_image,
            participantRole: 'client' as const,
          }
        });
        console.log('Navigation to Messages completed');
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', `Could not open conversation: ${error}`);
    }
  };

  const handleViewPrograms = (client: Client) => {
    if (client.current_program) {
      // TODO: Navigate to program details screen with proper routing
      // navigation.navigate('ProgramDetails', { 
      //   programId: client.current_program.id,
      //   clientId: client.id 
      // });
      // This should join on programs table: programs.client_id AND programs.trainer_id
      Alert.alert('View Program', `Opening "${client.current_program.title}" program details for ${client.full_name}`);
    } else {
      Alert.alert('No Program', `${client.full_name} doesn't have an assigned program yet.`);
    }
  };

  const handleRemoveClient = (client: Client) => {
    Alert.alert(
      'Remove Client',
      `Are you sure you want to remove ${client.full_name} from your client list?\n\nThis will unlink their data but preserve their progress.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Supabase soft delete implementation
            // Option 1: Update user_organizations to unlink trainer
            // await supabase.from('user_organizations')
            //   .update({ trainer_id: null, updated_at: new Date() })
            //   .eq('user_id', client.id);
            // 
            // Option 2: Add deleted_at timestamp for soft delete
            // await supabase.from('trainer_client_assignments')
            //   .update({ deleted_at: new Date() })
            //   .eq('client_id', client.id)
            //   .eq('trainer_id', currentUser.id);
            
            setClients(prev => prev.filter(c => c.id !== client.id));
            setShowClientModal(false);
            Alert.alert('Client Removed', `${client.full_name} has been removed from your client list. Their progress data has been preserved.`);
          },
        },
      ]
    );
  };

  // Add new client handler
  const handleAddClient = () => {
    // TODO: Implement Supabase client invitation
    // 1. Validate form data
    // 2. Create pending invitation record
    // 3. Send invitation email via Supabase Edge Function
    // 4. Show success/error feedback
    // 5. Reset form and close modal
    
    console.log('Mock: Sending invitation to:', newClientForm);
    
    // Simulate success for now
    Alert.alert(
      'Invitation Sent! 📧',
      `An invitation has been sent to ${newClientForm.email}. They will receive instructions to download the app and join your training program.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setNewClientForm({
              name: '',
              email: '',
              phone: '',
              age: '',
              programId: '',
              message: ''
            });
            setShowAddClientModal(false);
          }
        }
      ]
    );
  };

  // Engagement Summary Component
  const EngagementSummary: React.FC<{ client: Client }> = ({ client }) => {
    const getStreakColor = (days: number) => {
      if (days >= 7) return '#4caf50';
      if (days >= 3) return '#ff9800';
      return '#f44336';
    };

    const getStreakText = (days: number) => {
      if (days === 0) return 'No active streak';
      if (days === 1) return '1 day streak';
      return `${days} day streak`;
    };

    return (
      <View style={styles.engagementContainer}>
        <Text style={styles.engagementTitle}>Engagement Summary</Text>
        
        <View style={styles.engagementGrid}>
          <View style={styles.engagementCard}>
            <View style={[styles.streakIndicator, { backgroundColor: getStreakColor(client.engagement.streak_days) }]}>
              <Ionicons name="flame" size={16} color="white" />
            </View>
            <Text style={styles.engagementNumber}>{client.engagement.streak_days}</Text>
            <Text style={styles.engagementLabel}>{getStreakText(client.engagement.streak_days)}</Text>
          </View>

          <View style={styles.engagementCard}>
            <Text style={styles.engagementNumber}>{client.engagement.total_logins}</Text>
            <Text style={styles.engagementLabel}>Total Logins</Text>
          </View>

          <View style={styles.engagementCard}>
            <Text style={styles.engagementNumber}>{client.engagement.completion_rate}%</Text>
            <Text style={styles.engagementLabel}>Completion Rate</Text>
          </View>

          <View style={styles.engagementCard}>
            <Text style={styles.engagementNumber}>{client.engagement.missed_sessions}</Text>
            <Text style={styles.engagementLabel}>Missed Sessions</Text>
          </View>
        </View>

        <Text style={styles.lastLoginText}>
          Last login: {formatRelativeTime(client.engagement.last_login)}
        </Text>
        
        {/* TODO: Add Supabase integration for engagement tracking
            - Query engagement_reports table for detailed metrics
            - Join with session_completions for streak calculations
            - Track login_history for activity patterns
            - Calculate retention and engagement scores
        */}
      </View>
    );
  };
  const ClientCard: React.FC<{ client: Client }> = ({ client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => {
        setSelectedClient(client);
        setShowClientModal(true);
      }}
    >
      <View style={styles.clientHeader}>
        <View style={styles.clientAvatar}>
          {client.profile_image ? (
            <Image source={{ uri: client.profile_image }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={24} color={COLORS.text.secondary} />
          )}
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.full_name}</Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(client) }]} />
      </View>

      <View style={styles.clientDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Active:</Text>
          <Text style={styles.detailValue}>{formatRelativeTime(client.last_active)}</Text>
        </View>
        
        {client.current_program && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Program:</Text>
            <Text style={styles.detailValue}>{client.current_program.title}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sessions:</Text>
          <Text style={styles.detailValue}>
            {client.session_stats.completed_sessions}/{client.session_stats.total_sessions} completed
          </Text>
        </View>

        {client.session_stats.next_session && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Session:</Text>
            <Text style={styles.detailValue}>{formatDate(client.session_stats.next_session)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Client Detail Modal
  const ClientDetailModal: React.FC = () => (
    <Modal
      visible={showClientModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedClient?.full_name}
          </Text>
          <TouchableOpacity onPress={() => setShowClientModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {selectedClient && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.clientProfile}>
              <View style={styles.clientAvatarLarge}>
                {selectedClient.profile_image ? (
                  <Image source={{ uri: selectedClient.profile_image }} style={styles.avatarImageLarge} />
                ) : (
                  <Ionicons name="person" size={48} color={COLORS.text.secondary} />
                )}
              </View>
              <Text style={styles.clientNameLarge}>{selectedClient.full_name}</Text>
              <Text style={styles.clientEmailLarge}>{selectedClient.email}</Text>
            </View>

            <EngagementSummary client={selectedClient} />

            <SectionHeader title="Session Statistics" />
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{selectedClient.session_stats.completed_sessions}</Text>
                <Text style={styles.statLabel}>Completed Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{selectedClient.session_stats.total_sessions}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
            </View>

            {selectedClient.current_program && (
              <>
                <SectionHeader title="Current Program" />
                <View style={styles.programCard}>
                  <Text style={styles.programTitle}>{selectedClient.current_program.title}</Text>
                  <Text style={styles.programStartDate}>
                    Started: {formatDate(selectedClient.current_program.start_date)}
                  </Text>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${selectedClient.current_program.progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{selectedClient.current_program.progress}%</Text>
                  </View>
                </View>
              </>
            )}

            <SectionHeader title="Actions" />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                onPress={() => handleMessageClient(selectedClient)}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text style={styles.actionButtonText}>Message Client</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
                onPress={() => handleViewPrograms(selectedClient)}
              >
                <Ionicons name="fitness" size={20} color="white" />
                <Text style={styles.actionButtonText}>View Programs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ff6b6b' }]}
                onPress={() => handleRemoveClient(selectedClient)}
              >
                <Ionicons name="person-remove" size={20} color="white" />
                <Text style={styles.actionButtonText}>Remove Client</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  // Add Client Modal (placeholder)
  const AddClientModal: React.FC = () => (
    <Modal
      visible={showAddClientModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Client</Text>
          <TouchableOpacity onPress={() => setShowAddClientModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter full name"
                value={newClientForm.name}
                onChangeText={(text) => setNewClientForm({...newClientForm, name: text})}
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter email address"
                value={newClientForm.email}
                onChangeText={(text) => setNewClientForm({...newClientForm, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter phone number"
                value={newClientForm.phone}
                onChangeText={(text) => setNewClientForm({...newClientForm, phone: text})}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter age"
                value={newClientForm.age}
                onChangeText={(text) => setNewClientForm({...newClientForm, age: text})}
                keyboardType="numeric"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assign Program</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {newClientForm.programId ? 
                    mockTrainerData.availablePrograms.find(p => p.id === newClientForm.programId)?.title || 'Select Program'
                    : 'Select Program (Optional)'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
              </View>
              <Text style={styles.helperText}>
                You can assign a program now or later from the client details
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Personal Message</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                placeholder="Add a personal welcome message (optional)"
                value={newClientForm.message}
                onChangeText={(text) => setNewClientForm({...newClientForm, message: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => {
                setShowAddClientModal(false);
                setNewClientForm({
                  name: '',
                  email: '',
                  phone: '',
                  age: '',
                  programId: '',
                  message: ''
                });
              }}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.primaryButton,
                (!newClientForm.name || !newClientForm.email) && styles.disabledButton
              ]}
              onPress={handleAddClient}
              disabled={!newClientForm.name || !newClientForm.email}
            >
              <Ionicons name="person-add" size={16} color="white" />
              <Text style={styles.actionButtonText}>Send Invitation</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              An invitation email will be sent to the client with instructions to download the app and join your training program.
            </Text>
          </View>
          
          {/* TODO: Implement Supabase client invitation
              - Create pending_invitations table
              - Send email via Supabase Edge Functions
              - Track invitation status (pending, accepted, expired)
              - Auto-create client record on invitation acceptance
              - Integration with Supabase Auth signup flow
          */}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <SectionHeader title="My Clients" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.text.secondary}
        />
      </View>

      {/* Add Client Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddClientModal(true)}
      >
        <Ionicons name="person-add" size={20} color="white" />
        <Text style={styles.addButtonText}>Add New Client</Text>
      </TouchableOpacity>

      {/* Client List */}
      <ScrollView style={styles.clientList} showsVerticalScrollIndicator={false}>
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.text.secondary} />
            <Text style={styles.emptyStateText}>No clients found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first client'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ClientDetailModal />
      <AddClientModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clientList: {
    flex: 1,
  },
  clientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  clientDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  clientProfile: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  clientAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImageLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  clientNameLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  clientEmailLarge: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  programCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  programStartDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Engagement Summary Styles
  engagementContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  engagementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  engagementCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  streakIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  engagementNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  engagementLabel: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  lastLoginText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Form Styles
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
    flex: 1,
  },
  secondaryButtonText: {
    color: COLORS.text.secondary,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});