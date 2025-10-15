import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: string; // We'll use text icons for now, can upgrade to icon library later
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  disabled = false,
  children,
}) => {
  const cardContent = (
    <>
      <View style={styles.cardHeader}>
        {icon && <Text style={styles.cardIcon}>{icon}</Text>}
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, disabled && styles.textDisabled]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.cardSubtitle, disabled && styles.textDisabled]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {children && <View style={styles.cardContent}>{children}</View>}
    </>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardPressable]}
        onPress={onPress}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      {cardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardPressable: {
    transform: [{ scale: 1 }],
  },
  cardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  cardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});