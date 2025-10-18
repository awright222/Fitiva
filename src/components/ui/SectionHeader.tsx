import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  showBackButton = false,
  onBackPress,
}) => {
  return (
    <View style={styles.container}>
      {showBackButton && onBackPress && (
        <TouchableOpacity 
          onPress={() => {
            console.log('🔙 SectionHeader back button pressed');
            console.log('🔙 onBackPress function exists:', typeof onBackPress);
            try {
              onBackPress();
              console.log('✅ onBackPress called successfully');
            } catch (error) {
              console.error('❌ Error calling onBackPress:', error);
            }
          }} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      
      <View style={[styles.textContainer, showBackButton && styles.textContainerWithBack]}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  textContainerWithBack: {
    marginLeft: 0,
  },
});