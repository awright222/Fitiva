import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockTrainerData } from '../../../data/mockData';
import { TrainerClient } from '../types';
import { COLORS } from '../../../constants';
import { SectionHeader, DashboardCard, Button } from '../../../components/ui';

interface ClientListItemProps {
  client: TrainerClient;
  onPress: () => void;
}

const ClientListItem: React.FC<ClientListItemProps> = ({ client, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'needs_checkin': return COLORS.warning;
      case 'inactive': return COLORS.error;
      default: return COLORS.text.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'needs_checkin': return 'Needs Check-in';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No session scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.clientItem} onPress={onPress}>
      <View style={styles.clientHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.clientInfo}>
          <View style={styles.clientNameRow}>
            <Text style={styles.clientName}>{client.name}</Text>
            {client.unreadMessages > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{client.unreadMessages}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.clientProgram}>{client.currentProgram}</Text>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(client.status) }]}>
              <Text style={styles.statusText}>{getStatusText(client.status)}</Text>
            </View>
            <Text style={styles.progressText}>{client.programProgress}% complete</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.sessionInfo}>
        <Text style={styles.nextSessionLabel}>Next Session:</Text>
        <Text style={styles.nextSessionDate}>{formatDate(client.nextSession)}</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${client.programProgress}%` }
            ]} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface ClientDetailModalProps {
  client: TrainerClient | null;
  visible: boolean;
  onClose: () => void;
  onMessage: (clientId: string) => void;
  onViewProgram: (clientId: string) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  visible,
  onClose,
  onMessage,
  onViewProgram
}) => {
  if (!client) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'None';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Client Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.clientDetailHeader}>
            <View style={styles.largeAvatarContainer}>
              <Text style={styles.largeAvatarText}>
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.clientDetailName}>{client.name}</Text>
            <Text style={styles.clientDetailEmail}>{client.email}</Text>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Program Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Program:</Text>
              <Text style={styles.detailValue}>{client.currentProgram}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Progress:</Text>
              <Text style={styles.detailValue}>{client.programProgress}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sessions:</Text>
              <Text style={styles.detailValue}>
                {client.completedSessions} of {client.totalSessions} completed
              </Text>
            </View>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Session:</Text>
              <Text style={styles.detailValue}>{formatDate(client.lastSession)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Session:</Text>
              <Text style={styles.detailValue}>{formatDate(client.nextSession)}</Text>
            </View>
          </View>
          
          {client.notes && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{client.notes}</Text>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <Button
              title="Message Client"
              onPress={() => onMessage(client.id)}
              style={styles.actionButton}
            />
            <Button
              title="View Program"
              onPress={() => onViewProgram(client.id)}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

interface InviteClientModalProps {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string, name: string) => void;
}

const InviteClientModal: React.FC<InviteClientModalProps> = ({
  visible,
  onClose,
  onInvite
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleInvite = () => {
    if (!email.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    onInvite(email.trim(), name.trim());
    setEmail('');
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Invite New Client</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Client Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter client's full name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter client's email"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inviteActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.inviteButton}
            />
            <Button
              title="Send Invite"
              onPress={handleInvite}
              style={styles.inviteButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const TrainerClientsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'needs_checkin'>('all');
  const [selectedClient, setSelectedClient] = useState<TrainerClient | null>(null);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // TODO: Replace with Supabase query
  const clients = mockTrainerData.clients;

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const handleClientPress = (client: TrainerClient) => {
    setSelectedClient(client);
    setShowClientDetail(true);
  };

  const handleMessageClient = (clientId: string) => {
    // TODO: Navigate to messaging screen with specific client conversation
    console.log('Navigate to message client:', clientId);
    setShowClientDetail(false);
    Alert.alert('Message Client', 'Opening conversation... (Feature in development)');
  };

  const handleViewProgram = (clientId: string) => {
    // TODO: Navigate to program view for specific client
    console.log('Navigate to view program for client:', clientId);
    setShowClientDetail(false);
    Alert.alert('View Program', 'Opening program details... (Feature in development)');
  };

  const handleInviteClient = (email: string, name: string) => {
    // TODO: Implement Supabase invitation system
    console.log('Invite client:', { email, name });
    Alert.alert(
      'Invite Sent!',
      `Invitation sent to ${name} (${email}). They will receive an email to join your training program. (Feature coming soon)`
    );
  };

  const totalUnreadMessages = clients.reduce((sum, client) => sum + client.unreadMessages, 0);

  return (
    <View style={styles.container}>
      <SectionHeader title="My Clients" />
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <DashboardCard
          title="Total Clients"
          value={clients.length.toString()}
          icon="people"
          style={styles.statCard}
        />
        <DashboardCard
          title="Active"
          value={clients.filter(c => c.status === 'active').length.toString()}
          icon="fitness"
          style={styles.statCard}
        />
        <DashboardCard
          title="Unread Messages"
          value={totalUnreadMessages.toString()}
          icon="mail"
          style={styles.statCard}
        />
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'active', 'inactive', 'needs_checkin'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              statusFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setStatusFilter(filter as any)}
          >
            <Text style={[
              styles.filterText,
              statusFilter === filter && styles.activeFilterText
            ]}>
              {filter === 'all' ? 'All' : 
               filter === 'needs_checkin' ? 'Needs Check-in' :
               filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Add Client Button */}
      <TouchableOpacity 
        style={styles.addClientButton}
        onPress={() => setShowInviteModal(true)}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.addClientText}>Invite New Client</Text>
      </TouchableOpacity>
      
      {/* Client List */}
      <ScrollView style={styles.clientList} showsVerticalScrollIndicator={false}>
        {filteredClients.map((client) => (
          <ClientListItem
            key={client.id}
            client={client}
            onPress={() => handleClientPress(client)}
          />
        ))}
        
        {filteredClients.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>
              {searchQuery || statusFilter !== 'all' 
                ? 'No clients match your filters' 
                : 'No clients yet. Invite your first client!'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        visible={showClientDetail}
        onClose={() => setShowClientDetail(false)}
        onMessage={handleMessageClient}
        onViewProgram={handleViewProgram}
      />
      
      {/* Invite Client Modal */}
      <InviteClientModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteClient}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  addClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addClientText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clientList: {
    flex: 1,
  },
  clientItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clientHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  clientProgram: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sessionInfo: {
    marginBottom: 12,
  },
  nextSessionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  nextSessionDate: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  clientDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  clientDetailName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  clientDetailEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  
  // Invite modal styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  inviteButton: {
    flex: 1,
  },
});