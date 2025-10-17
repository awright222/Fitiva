import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ViewStyle,
  TextInputProps 
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  secureTextEntry?: boolean;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  secureTextEntry = false,
  containerStyle,
  numberOfLines, // Extract numberOfLines to handle separately
  ...textInputProps
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            hasError && styles.inputError,
          ]}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={COLORS.gray}
          accessibilityLabel={label}
          numberOfLines={numberOfLines} // Keep using numberOfLines for now since rows doesn't exist
          {...textInputProps}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure(!isSecure)}
            accessibilityLabel={isSecure ? "Show password" : "Hide password"}
          >
            <Text style={styles.eyeText}>
              {isSecure ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  
  required: {
    color: COLORS.error,
  },
  
  inputContainer: {
    position: 'relative',
  },
  
  input: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: COLORS.primary,
  },
  
  inputError: {
    borderColor: COLORS.error,
  },
  
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  
  eyeText: {
    fontSize: FONT_SIZES.lg,
  },
  
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  
  errorText: {
    color: COLORS.error,
  },
});