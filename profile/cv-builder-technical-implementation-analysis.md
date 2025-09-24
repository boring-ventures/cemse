# CV Builder - Enhanced Mobile Architecture & Implementation Analysis

## Metadata

- Generated: 2025-08-22
- Enhanced by: cemse-mobile-architect + cemse-mobile-developer
- Source: src/app/(dashboard)/cv-builder/, src/components/profile/cv-manager.tsx, src/hooks/useCV.ts
- Target Platform: React Native / Expo SDK 50+
- User Role: YOUTH (Joven)
- Priority: Critical
- Dependencies: Profile Module, Authentication Module, File Upload Module, PDF Generation
- Estimated Development Time: 4-5 weeks
- Analysis Type: Complete Mobile Architecture Design + Technical Implementation

## Executive Summary

This document provides a comprehensive technical analysis and **mobile-first architecture design** for the CV Builder module migration to React Native. The analysis combines deep technical insights with production-ready architectural patterns optimized for mobile platforms, addressing all critical challenges identified in the web implementation.

**Key Architectural Decisions:**
- 🏗️ **Hybrid Navigation**: Stack + Tab pattern for optimal mobile UX
- ⚡ **Performance-First**: Component memoization and debounced state updates
- 📱 **Mobile-Native**: Camera integration, PDF sharing, offline-first approach
- 🎯 **Modular Design**: Atomic design pattern with clear separation of concerns

---

## 🏗️ MOBILE ARCHITECTURE DESIGN

### Phase 1: Navigation Architecture (ULTRATHINK)

#### **Navigation Hierarchy**
```typescript
// Complete type-safe navigation structure
type RootStackParamList = {
  CVBuilder: NavigatorScreenParams<CVBuilderStackParamList>;
  Auth: undefined;
  Dashboard: undefined;
};

type CVBuilderStackParamList = {
  CVDashboard: undefined;
  CVEditor: NavigatorScreenParams<CVEditorTabParamList>;
  CVPreview: { 
    templateId: 'modern' | 'creative' | 'minimalist';
    data: CVFormData;
  };
  PDFViewer: { 
    pdfUri: string;
    fileName: string;
  };
  CoverLetterEditor: {
    cvData: CVFormData;
  };
};

type CVEditorTabParamList = {
  PersonalInfo: undefined;
  Education: undefined;
  Experience: undefined;
  Skills: undefined;
  Projects: undefined;
  Languages: undefined;
  SocialLinks: undefined;
};
```

#### **Navigator Implementation**
```typescript
// Main CV Builder Stack Navigator
const CVBuilderStack = createStackNavigator<CVBuilderStackParamList>();

function CVBuilderNavigator() {
  return (
    <CVBuilderStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <CVBuilderStack.Screen 
        name="CVDashboard" 
        component={CVDashboardScreen}
        options={{ title: "Mi Currículum" }}
      />
      <CVBuilderStack.Screen 
        name="CVEditor" 
        component={CVEditorNavigator}
        options={{ title: "Editar CV" }}
      />
      <CVBuilderStack.Screen 
        name="CVPreview" 
        component={CVPreviewScreen}
        options={{ title: "Vista Previa" }}
      />
      <CVBuilderStack.Screen 
        name="PDFViewer" 
        component={PDFViewerScreen}
        options={{ 
          title: "CV Generado",
          headerRight: () => <ShareButton />
        }}
      />
    </CVBuilderStack.Navigator>
  );
}

// CV Editor Tab Navigator
const CVEditorTab = createBottomTabNavigator<CVEditorTabParamList>();

function CVEditorNavigator() {
  return (
    <CVEditorTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIconName(route.name);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 8 },
      })}
    >
      <CVEditorTab.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <CVEditorTab.Screen name="Education" component={EducationScreen} />
      <CVEditorTab.Screen name="Experience" component={ExperienceScreen} />
      <CVEditorTab.Screen name="Skills" component={SkillsScreen} />
    </CVEditorTab.Navigator>
  );
}
```

### Phase 2: State Management Architecture (ULTRATHINK)

#### **Complete State Design**
```typescript
// Global CV State with Context + Reducer
interface CVState {
  // Core data
  formData: CVFormData;
  
  // UI state
  ui: {
    activeSection: keyof CVFormData;
    collapsedSections: Record<string, boolean>;
    isEditing: boolean;
    hasUnsavedChanges: boolean;
    validationErrors: ValidationErrors;
  };
  
  // File handling
  files: {
    profileImage: {
      uri: string | null;
      uploading: boolean;
      uploadProgress: number;
      error: string | null;
    };
  };
  
  // PDF generation
  pdf: {
    isGenerating: boolean;
    selectedTemplate: CVTemplate;
    availableTemplates: CVTemplate[];
    lastGeneratedUri: string | null;
  };
  
  // Network state
  network: {
    isOnline: boolean;
    pendingUpdates: Partial<CVFormData>[];
    lastSyncTime: Date | null;
  };
}

// Action types for type-safe dispatching
type CVAction = 
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'ADD_EDUCATION'; payload: EducationItem }
  | { type: 'REMOVE_EDUCATION'; payload: { index: number } }
  | { type: 'UPDATE_EDUCATION'; payload: { index: number; data: Partial<EducationItem> } }
  | { type: 'ADD_EXPERIENCE'; payload: WorkExperience }
  | { type: 'UPDATE_EXPERIENCE'; payload: { index: number; data: Partial<WorkExperience> } }
  | { type: 'REMOVE_EXPERIENCE'; payload: { index: number } }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'REMOVE_SKILL'; payload: { skillName: string } }
  | { type: 'UPDATE_SKILL_LEVEL'; payload: { skillName: string; level: SkillLevel } }
  | { type: 'SET_PROFILE_IMAGE'; payload: { uri: string } }
  | { type: 'SET_IMAGE_UPLOAD_PROGRESS'; payload: { progress: number } }
  | { type: 'SET_IMAGE_UPLOAD_ERROR'; payload: { error: string } }
  | { type: 'TOGGLE_SECTION_COLLAPSE'; payload: { section: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationErrors }
  | { type: 'MARK_CHANGES_SAVED' }
  | { type: 'SET_PDF_GENERATING'; payload: { isGenerating: boolean } }
  | { type: 'SET_PDF_TEMPLATE'; payload: { template: CVTemplate } }
  | { type: 'SET_PDF_GENERATED'; payload: { uri: string } }
  | { type: 'SET_NETWORK_STATUS'; payload: { isOnline: boolean } }
  | { type: 'ADD_PENDING_UPDATE'; payload: Partial<CVFormData> }
  | { type: 'CLEAR_PENDING_UPDATES' }
  | { type: 'SET_LAST_SYNC_TIME'; payload: { time: Date } };

// Reducer implementation with performance optimization
const cvReducer = (state: CVState, action: CVAction): CVState => {
  switch (action.type) {
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        formData: {
          ...state.formData,
          personalInfo: {
            ...state.formData.personalInfo,
            ...action.payload,
          },
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };
      
    case 'ADD_EDUCATION':
      return {
        ...state,
        formData: {
          ...state.formData,
          education: {
            ...state.formData.education,
            educationHistory: [
              ...(state.formData.education?.educationHistory || []),
              action.payload,
            ],
          },
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };
      
    case 'UPDATE_EDUCATION':
      const updatedEducationHistory = [...(state.formData.education?.educationHistory || [])];
      updatedEducationHistory[action.payload.index] = {
        ...updatedEducationHistory[action.payload.index],
        ...action.payload.data,
      };
      
      return {
        ...state,
        formData: {
          ...state.formData,
          education: {
            ...state.formData.education,
            educationHistory: updatedEducationHistory,
          },
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };
      
    // ... más casos del reducer
    
    default:
      return state;
  }
};
```

#### **Context Provider Implementation**
```typescript
// CV Context Provider with performance optimization
interface CVContextType {
  state: CVState;
  dispatch: React.Dispatch<CVAction>;
  // High-level actions
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  addEducation: (education: EducationItem) => void;
  updateEducation: (index: number, data: Partial<EducationItem>) => void;
  removeEducation: (index: number) => void;
  addExperience: (experience: WorkExperience) => void;
  updateExperience: (index: number, data: Partial<WorkExperience>) => void;
  removeExperience: (index: number) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (skillName: string) => void;
  updateSkillLevel: (skillName: string, level: SkillLevel) => void;
  uploadProfileImage: (imageUri: string) => Promise<void>;
  generatePDF: (template: CVTemplate) => Promise<string>;
  saveCVData: () => Promise<void>;
  toggleSectionCollapse: (section: string) => void;
}

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cvReducer, initialCVState);
  const { mutateAsync: updateCVAPI } = useUpdateCV();
  const { mutateAsync: uploadImageAPI } = useUploadProfileImage();
  
  // Debounced auto-save functionality
  const debouncedSave = useMemo(
    () => debounce(async (data: CVFormData) => {
      try {
        await updateCVAPI(data);
        dispatch({ type: 'MARK_CHANGES_SAVED' });
        dispatch({ type: 'SET_LAST_SYNC_TIME', payload: { time: new Date() } });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    [updateCVAPI]
  );
  
  // Auto-save effect
  useEffect(() => {
    if (state.ui.hasUnsavedChanges && state.network.isOnline) {
      debouncedSave(state.formData);
    }
  }, [state.formData, state.ui.hasUnsavedChanges, state.network.isOnline, debouncedSave]);
  
  // High-level action creators
  const updatePersonalInfo = useCallback((data: Partial<PersonalInfo>) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: data });
  }, []);
  
  const addEducation = useCallback((education: EducationItem) => {
    dispatch({ type: 'ADD_EDUCATION', payload: education });
  }, []);
  
  const uploadProfileImage = useCallback(async (imageUri: string) => {
    dispatch({ type: 'SET_IMAGE_UPLOAD_PROGRESS', payload: { progress: 0 } });
    
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      
      const result = await uploadImageAPI(formData, {
        onUploadProgress: (progress) => {
          dispatch({ 
            type: 'SET_IMAGE_UPLOAD_PROGRESS', 
            payload: { progress: progress.loaded / progress.total } 
          });
        },
      });
      
      dispatch({ type: 'SET_PROFILE_IMAGE', payload: { uri: result.imageUrl } });
    } catch (error) {
      dispatch({ 
        type: 'SET_IMAGE_UPLOAD_ERROR', 
        payload: { error: error.message } 
      });
    }
  }, [uploadImageAPI]);
  
  const generatePDF = useCallback(async (template: CVTemplate): Promise<string> => {
    dispatch({ type: 'SET_PDF_GENERATING', payload: { isGenerating: true } });
    
    try {
      const pdfComponent = <CVPDFTemplate template={template} data={state.formData} />;
      const pdfDocument = pdf(pdfComponent);
      const pdfBuffer = await pdfDocument.toBuffer();
      
      const fileName = `CV_${state.formData.personalInfo?.firstName}_${state.formData.personalInfo?.lastName}_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, pdfBuffer.toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      dispatch({ type: 'SET_PDF_GENERATED', payload: { uri: fileUri } });
      
      return fileUri;
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      dispatch({ type: 'SET_PDF_GENERATING', payload: { isGenerating: false } });
    }
  }, [state.formData]);
  
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      updatePersonalInfo,
      addEducation,
      updateEducation: (index: number, data: Partial<EducationItem>) => {
        dispatch({ type: 'UPDATE_EDUCATION', payload: { index, data } });
      },
      removeEducation: (index: number) => {
        dispatch({ type: 'REMOVE_EDUCATION', payload: { index } });
      },
      addExperience: (experience: WorkExperience) => {
        dispatch({ type: 'ADD_EXPERIENCE', payload: experience });
      },
      updateExperience: (index: number, data: Partial<WorkExperience>) => {
        dispatch({ type: 'UPDATE_EXPERIENCE', payload: { index, data } });
      },
      removeExperience: (index: number) => {
        dispatch({ type: 'REMOVE_EXPERIENCE', payload: { index } });
      },
      addSkill: (skill: Skill) => {
        dispatch({ type: 'ADD_SKILL', payload: skill });
      },
      removeSkill: (skillName: string) => {
        dispatch({ type: 'REMOVE_SKILL', payload: { skillName } });
      },
      updateSkillLevel: (skillName: string, level: SkillLevel) => {
        dispatch({ type: 'UPDATE_SKILL_LEVEL', payload: { skillName, level } });
      },
      uploadProfileImage,
      generatePDF,
      saveCVData: async () => {
        await updateCVAPI(state.formData);
        dispatch({ type: 'MARK_CHANGES_SAVED' });
      },
      toggleSectionCollapse: (section: string) => {
        dispatch({ type: 'TOGGLE_SECTION_COLLAPSE', payload: { section } });
      },
    }),
    [state, updatePersonalInfo, addEducation, uploadProfileImage, generatePDF, updateCVAPI]
  );
  
  return (
    <CVContext.Provider value={contextValue}>
      {children}
    </CVContext.Provider>
  );
};
```

### Phase 3: Component Architecture (ATOMIC DESIGN)

#### **Atoms - Base Components**
```typescript
// atoms/CVFormField.tsx
interface CVFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  required?: boolean;
  testID?: string;
}

export const CVFormField = React.memo<CVFormFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  required = false,
  testID,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const debouncedOnChangeText = useMemo(
    () => debounce(onChangeText, 300),
    [onChangeText]
  );
  
  const borderColor = error ? theme.colors.error : 
                     isFocused ? theme.colors.primary : 
                     theme.colors.border;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TextInput
        style={[
          styles.input,
          {
            borderColor,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            height: multiline ? numberOfLines * 24 + 16 : 48,
          }
        ]}
        value={value}
        onChangeText={debouncedOnChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        testID={testID}
      />
      
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

// atoms/SkillTag.tsx
interface SkillTagProps {
  skill: Skill;
  onRemove: (skillName: string) => void;
  onLevelChange: (skillName: string, level: SkillLevel) => void;
  editable?: boolean;
}

export const SkillTag = React.memo<SkillTagProps>(({
  skill,
  onRemove,
  onLevelChange,
  editable = true,
}) => {
  const theme = useTheme();
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  
  const levelColors = {
    Beginner: theme.colors.warning,
    Skillful: theme.colors.info,
    Experienced: theme.colors.success,
    Expert: theme.colors.primary,
  };
  
  const handleLevelPress = () => {
    if (editable) {
      setShowLevelPicker(true);
    }
  };
  
  const handleLevelSelect = (level: SkillLevel) => {
    onLevelChange(skill.name, level);
    setShowLevelPicker(false);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Pressable
        style={[styles.levelIndicator, { backgroundColor: levelColors[skill.experienceLevel] }]}
        onPress={handleLevelPress}
        disabled={!editable}
      >
        <Text style={styles.levelText}>{skill.experienceLevel[0]}</Text>
      </Pressable>
      
      <Text style={[styles.skillName, { color: theme.colors.text }]}>
        {skill.name}
      </Text>
      
      {editable && (
        <Pressable
          style={styles.removeButton}
          onPress={() => onRemove(skill.name)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
        </Pressable>
      )}
      
      <Modal
        visible={showLevelPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevelPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLevelPicker(false)}>
          <View style={[styles.levelPickerModal, { backgroundColor: theme.colors.surface }]}>
            {(['Beginner', 'Skillful', 'Experienced', 'Expert'] as SkillLevel[]).map((level) => (
              <Pressable
                key={level}
                style={[styles.levelOption, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleLevelSelect(level)}
              >
                <Text style={[styles.levelOptionText, { color: theme.colors.text }]}>
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});
```

#### **Molecules - Composite Components**
```typescript
// molecules/CollapsibleSection.tsx
interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: number;
  icon?: string;
}

export const CollapsibleSection = React.memo<CollapsibleSectionProps>(({
  title,
  isCollapsed,
  onToggle,
  children,
  badge,
  icon,
}) => {
  const theme = useTheme();
  const animatedHeight = useSharedValue(isCollapsed ? 0 : 1);
  const animatedRotation = useSharedValue(isCollapsed ? 0 : 1);
  
  useEffect(() => {
    animatedHeight.value = withSpring(isCollapsed ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
    animatedRotation.value = withSpring(isCollapsed ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isCollapsed]);
  
  const animatedContentStyle = useAnimatedStyle(() => ({
    height: interpolate(animatedHeight.value, [0, 1], [0, 200], Extrapolate.CLAMP),
    opacity: animatedHeight.value,
  }));
  
  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(animatedRotation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Pressable
        style={[styles.header, { borderBottomColor: theme.colors.border }]}
        onPress={onToggle}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={theme.colors.primary} 
              style={styles.icon}
            />
          )}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          {badge !== undefined && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        
        <Animated.View style={animatedChevronStyle}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </Animated.View>
      </Pressable>
      
      <Animated.View style={[styles.content, animatedContentStyle]}>
        <ScrollView style={styles.scrollContent} nestedScrollEnabled>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
});

// molecules/DynamicFormArray.tsx
interface DynamicFormArrayProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, data: Partial<T>) => void;
  renderItem: (item: T, index: number, onUpdate: (data: Partial<T>) => void) => React.ReactNode;
  addButtonText: string;
  emptyStateText: string;
  maxItems?: number;
}

export function DynamicFormArray<T>({
  items,
  onAdd,
  onRemove,
  onUpdate,
  renderItem,
  addButtonText,
  emptyStateText,
  maxItems = 10,
}: DynamicFormArrayProps<T>) {
  const theme = useTheme();
  
  const handleUpdate = useCallback((index: number) => (data: Partial<T>) => {
    onUpdate(index, data);
  }, [onUpdate]);
  
  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            {emptyStateText}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.itemContainer, { borderBottomColor: theme.colors.border }]}>
              {renderItem(item, index, handleUpdate(index))}
              
              <Pressable
                style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
                onPress={() => onRemove(index)}
              >
                <Ionicons name="trash" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
      
      {items.length < maxItems && (
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{addButtonText}</Text>
        </Pressable>
      )}
    </View>
  );
}

// molecules/ImagePickerModal.tsx
interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
}

export const ImagePickerModal = React.memo<ImagePickerModalProps>(({
  visible,
  onClose,
  onImageSelected,
}) => {
  const theme = useTheme();
  
  const selectFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };
  
  const capturePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar fotos.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Seleccionar Imagen
          </Text>
          
          <Pressable
            style={[styles.option, { borderBottomColor: theme.colors.border }]}
            onPress={capturePhoto}
          >
            <Ionicons name="camera" size={24} color={theme.colors.primary} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              Tomar Foto
            </Text>
          </Pressable>
          
          <Pressable
            style={[styles.option, { borderBottomColor: theme.colors.border }]}
            onPress={selectFromLibrary}
          >
            <Ionicons name="images" size={24} color={theme.colors.primary} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              Seleccionar de Galería
            </Text>
          </Pressable>
          
          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
});
```

#### **Organisms - Complex Components**
```typescript
// organisms/PersonalInfoForm.tsx
interface PersonalInfoFormProps {
  data: PersonalInfo;
  onUpdate: (data: Partial<PersonalInfo>) => void;
  profileImageUri?: string;
  onImageUpload: (imageUri: string) => Promise<void>;
  uploadProgress?: number;
  uploadError?: string;
}

export const PersonalInfoForm = React.memo<PersonalInfoFormProps>(({
  data,
  onUpdate,
  profileImageUri,
  onImageUpload,
  uploadProgress = 0,
  uploadError,
}) => {
  const theme = useTheme();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Validation logic
  const validateField = useCallback((field: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Por favor ingresa un email válido';
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
          errors.phone = 'Por favor ingresa un número de teléfono válido';
        }
        break;
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'El nombre es requerido';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'El apellido es requerido';
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      ...errors,
      [field]: errors[field] || undefined,
    }));
  }, []);
  
  const handleFieldChange = useCallback((field: keyof PersonalInfo, value: string) => {
    validateField(field, value);
    onUpdate({ [field]: value });
  }, [onUpdate, validateField]);
  
  const handleImageSelected = useCallback(async (imageUri: string) => {
    try {
      await onImageUpload(imageUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la imagen. Inténtalo de nuevo.');
    }
  }, [onImageUpload]);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Image Section */}
      <View style={styles.imageSection}>
        <Pressable
          style={[styles.imageContainer, { borderColor: theme.colors.border }]}
          onPress={() => setShowImagePicker(true)}
        >
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="person" size={40} color={theme.colors.textSecondary} />
            </View>
          )}
          
          <View style={[styles.imageOverlay, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </View>
          
          {uploadProgress > 0 && uploadProgress < 1 && (
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${uploadProgress * 100}%`,
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            </View>
          )}
        </Pressable>
        
        {uploadError && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {uploadError}
          </Text>
        )}
      </View>
      
      {/* Personal Information Fields */}
      <View style={styles.fieldsContainer}>
        <CVFormField
          label="Nombre"
          value={data.firstName || ''}
          onChangeText={(text) => handleFieldChange('firstName', text)}
          placeholder="Ingresa tu nombre"
          required
          error={validationErrors.firstName}
          testID="personal-info-first-name"
        />
        
        <CVFormField
          label="Apellido"
          value={data.lastName || ''}
          onChangeText={(text) => handleFieldChange('lastName', text)}
          placeholder="Ingresa tu apellido"
          required
          error={validationErrors.lastName}
          testID="personal-info-last-name"
        />
        
        <CVFormField
          label="Email"
          value={data.email || ''}
          onChangeText={(text) => handleFieldChange('email', text)}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={validationErrors.email}
          testID="personal-info-email"
        />
        
        <CVFormField
          label="Teléfono"
          value={data.phone || ''}
          onChangeText={(text) => handleFieldChange('phone', text)}
          placeholder="+56 9 1234 5678"
          keyboardType="phone-pad"
          error={validationErrors.phone}
          testID="personal-info-phone"
        />
        
        <CVFormField
          label="Dirección"
          value={data.address || ''}
          onChangeText={(text) => handleFieldChange('address', text)}
          placeholder="Dirección completa"
          testID="personal-info-address"
        />
        
        <CVFormField
          label="Ciudad"
          value={data.city || ''}
          onChangeText={(text) => handleFieldChange('city', text)}
          placeholder="Ciudad de residencia"
          testID="personal-info-city"
        />
        
        <CVFormField
          label="Descripción Personal"
          value={data.personalDescription || ''}
          onChangeText={(text) => handleFieldChange('personalDescription', text)}
          placeholder="Describe brevemente tu perfil profesional..."
          multiline
          numberOfLines={4}
          testID="personal-info-description"
        />
      </View>
      
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
      />
    </ScrollView>
  );
});

// organisms/EducationForm.tsx
interface EducationFormProps {
  data: Education;
  onUpdate: (data: Partial<Education>) => void;
}

export const EducationForm = React.memo<EducationFormProps>(({
  data,
  onUpdate,
}) => {
  const theme = useTheme();
  
  const addEducation = useCallback(() => {
    const newEducation: EducationItem = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentlyStudying: false,
    };
    
    onUpdate({
      educationHistory: [...(data.educationHistory || []), newEducation],
    });
  }, [data.educationHistory, onUpdate]);
  
  const removeEducation = useCallback((index: number) => {
    const updatedHistory = data.educationHistory?.filter((_, i) => i !== index) || [];
    onUpdate({ educationHistory: updatedHistory });
  }, [data.educationHistory, onUpdate]);
  
  const updateEducation = useCallback((index: number, educationData: Partial<EducationItem>) => {
    const updatedHistory = [...(data.educationHistory || [])];
    updatedHistory[index] = { ...updatedHistory[index], ...educationData };
    onUpdate({ educationHistory: updatedHistory });
  }, [data.educationHistory, onUpdate]);
  
  const renderEducationItem = useCallback((item: EducationItem, index: number, onItemUpdate: (data: Partial<EducationItem>) => void) => (
    <View style={styles.educationItem}>
      <CVFormField
        label="Institución"
        value={item.institution || ''}
        onChangeText={(text) => onItemUpdate({ institution: text })}
        placeholder="Universidad, Instituto, Colegio..."
        required
      />
      
      <CVFormField
        label="Título/Grado"
        value={item.degree || ''}
        onChangeText={(text) => onItemUpdate({ degree: text })}
        placeholder="Ingeniería, Licenciatura, Técnico..."
        required
      />
      
      <CVFormField
        label="Área de Estudio"
        value={item.fieldOfStudy || ''}
        onChangeText={(text) => onItemUpdate({ fieldOfStudy: text })}
        placeholder="Informática, Administración, Diseño..."
      />
      
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <CVFormField
            label="Fecha Inicio"
            value={item.startDate || ''}
            onChangeText={(text) => onItemUpdate({ startDate: text })}
            placeholder="MM/YYYY"
          />
        </View>
        
        <View style={styles.dateField}>
          <CVFormField
            label="Fecha Fin"
            value={item.endDate || ''}
            onChangeText={(text) => onItemUpdate({ endDate: text })}
            placeholder="MM/YYYY"
            editable={!item.isCurrentlyStudying}
          />
        </View>
      </View>
      
      <View style={styles.checkboxContainer}>
        <Pressable
          style={[
            styles.checkbox,
            {
              backgroundColor: item.isCurrentlyStudying ? theme.colors.primary : 'transparent',
              borderColor: theme.colors.primary,
            }
          ]}
          onPress={() => onItemUpdate({ 
            isCurrentlyStudying: !item.isCurrentlyStudying,
            endDate: !item.isCurrentlyStudying ? '' : item.endDate,
          })}
        >
          {item.isCurrentlyStudying && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </Pressable>
        
        <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
          Actualmente estudiando
        </Text>
      </View>
      
      <CVFormField
        label="Descripción (Opcional)"
        value={item.description || ''}
        onChangeText={(text) => onItemUpdate({ description: text })}
        placeholder="Logros, actividades relevantes, promedio..."
        multiline
        numberOfLines={3}
      />
    </View>
  ), [theme.colors]);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <DynamicFormArray
        items={data.educationHistory || []}
        onAdd={addEducation}
        onRemove={removeEducation}
        onUpdate={updateEducation}
        renderItem={renderEducationItem}
        addButtonText="Agregar Educación"
        emptyStateText="No has agregado información educativa aún"
        maxItems={5}
      />
    </ScrollView>
  );
});
```

### Phase 4: Screen Implementation (TEMPLATES)

#### **Main Screens**
```typescript
// screens/CVBuilderDashboard.tsx
export const CVBuilderDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { state } = useCV();
  const theme = useTheme();
  
  const progressData = useMemo(() => {
    const sections = [
      { key: 'personalInfo', name: 'Información Personal', completed: !!state.formData.personalInfo?.firstName },
      { key: 'education', name: 'Educación', completed: (state.formData.education?.educationHistory?.length || 0) > 0 },
      { key: 'experience', name: 'Experiencia', completed: (state.formData.workExperience?.length || 0) > 0 },
      { key: 'skills', name: 'Habilidades', completed: (state.formData.skills?.length || 0) > 0 },
    ];
    
    const completedSections = sections.filter(section => section.completed).length;
    const progressPercentage = (completedSections / sections.length) * 100;
    
    return { sections, completedSections, progressPercentage };
  }, [state.formData]);
  
  const handleContinueEditing = useCallback(() => {
    navigation.navigate('CVEditor', { screen: 'PersonalInfo' });
  }, [navigation]);
  
  const handlePreviewCV = useCallback(() => {
    navigation.navigate('CVPreview', {
      templateId: state.pdf.selectedTemplate.id,
      data: state.formData,
    });
  }, [navigation, state.pdf.selectedTemplate, state.formData]);
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Mi Currículum</Text>
        <Text style={styles.headerSubtitle}>
          Crea tu CV profesional en pocos pasos
        </Text>
      </View>
      
      {/* Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
          Progreso del CV
        </Text>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.colors.success,
                  width: `${progressData.progressPercentage}%`,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {progressData.completedSections} de {progressData.sections.length} secciones completadas
          </Text>
        </View>
        
        <FlatList
          data={progressData.sections}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.progressItem}>
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={item.completed ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[
                styles.progressItemText,
                {
                  color: item.completed ? theme.colors.text : theme.colors.textSecondary,
                  fontWeight: item.completed ? '600' : '400',
                }
              ]}>
                {item.name}
              </Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
      
      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
          onPress={handleContinueEditing}
        >
          <Ionicons name="create" size={24} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Continuar Editando</Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.secondaryAction,
            {
              backgroundColor: progressData.progressPercentage >= 50 ? theme.colors.success : theme.colors.border,
              opacity: progressData.progressPercentage >= 50 ? 1 : 0.6,
            }
          ]}
          onPress={handlePreviewCV}
          disabled={progressData.progressPercentage < 50}
        >
          <Ionicons name="eye" size={24} color="#FFFFFF" />
          <Text style={styles.secondaryActionText}>Vista Previa</Text>
        </Pressable>
      </View>
      
      {/* Recent Templates */}
      <View style={[styles.templatesCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.templatesTitle, { color: theme.colors.text }]}>
          Plantillas Disponibles
        </Text>
        
        <FlatList
          data={state.pdf.availableTemplates}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <CVTemplateCard
              template={item}
              isSelected={item.id === state.pdf.selectedTemplate.id}
              onSelect={() => {
                // Update selected template
              }}
            />
          )}
        />
      </View>
    </ScrollView>
  );
};

// screens/sections/PersonalInfoScreen.tsx
export const PersonalInfoScreen: React.FC = () => {
  const { state, updatePersonalInfo, uploadProfileImage } = useCV();
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PersonalInfoForm
        data={state.formData.personalInfo || {}}
        onUpdate={updatePersonalInfo}
        profileImageUri={state.files.profileImage.uri}
        onImageUpload={uploadProfileImage}
        uploadProgress={state.files.profileImage.uploadProgress}
        uploadError={state.files.profileImage.error}
      />
    </View>
  );
};

// screens/sections/EducationScreen.tsx
export const EducationScreen: React.FC = () => {
  const { state, dispatch } = useCV();
  const theme = useTheme();
  
  const handleUpdateEducation = useCallback((data: Partial<Education>) => {
    dispatch({
      type: 'UPDATE_EDUCATION_SECTION',
      payload: {
        ...state.formData.education,
        ...data,
      },
    });
  }, [dispatch, state.formData.education]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <EducationForm
        data={state.formData.education || { educationHistory: [] }}
        onUpdate={handleUpdateEducation}
      />
    </View>
  );
};
```

### Phase 5: PDF Generation & Sharing

#### **Mobile PDF Service**
```typescript
// services/PDFService.ts
class PDFService {
  static async generatePDF(
    data: CVFormData,
    template: CVTemplate,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(0.1);
      
      // Create PDF component based on template
      const PDFComponent = this.getTemplateComponent(template);
      const pdfDocument = pdf(<PDFComponent data={data} />);
      
      onProgress?.(0.3);
      
      // Generate PDF buffer
      const pdfBuffer = await pdfDocument.toBuffer();
      
      onProgress?.(0.6);
      
      // Create file name
      const fileName = this.generateFileName(data, template);
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write to file system
      await FileSystem.writeAsStringAsync(fileUri, pdfBuffer.toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      onProgress?.(1.0);
      
      return fileUri;
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
  
  static async sharePDF(fileUri: string, fileName: string): Promise<void> {
    try {
      const shareResult = await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir CV',
        UTI: 'com.adobe.pdf',
      });
      
      return shareResult;
    } catch (error) {
      throw new Error(`Share failed: ${error.message}`);
    }
  }
  
  static async saveToDisk(fileUri: string, fileName: string): Promise<string> {
    try {
      // Check if we can save to user's documents
      const permissions = await MediaLibrary.requestPermissionsAsync();
      
      if (permissions.granted) {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        return asset.uri;
      } else {
        throw new Error('Permission denied to save file');
      }
    } catch (error) {
      throw new Error(`Save to disk failed: ${error.message}`);
    }
  }
  
  private static getTemplateComponent(template: CVTemplate): React.ComponentType<{ data: CVFormData }> {
    switch (template.id) {
      case 'modern':
        return ModernProfessionalPDF;
      case 'creative':
        return CreativePortfolioPDF;
      case 'minimalist':
        return MinimalistPDF;
      default:
        return ModernProfessionalPDF;
    }
  }
  
  private static generateFileName(data: CVFormData, template: CVTemplate): string {
    const firstName = data.personalInfo?.firstName || 'CV';
    const lastName = data.personalInfo?.lastName || '';
    const timestamp = new Date().toISOString().slice(0, 10);
    
    return `CV_${firstName}_${lastName}_${template.name}_${timestamp}.pdf`;
  }
}

// screens/PDFViewerScreen.tsx
interface PDFViewerScreenProps {
  route: RouteProp<CVBuilderStackParamList, 'PDFViewer'>;
  navigation: StackNavigationProp<CVBuilderStackParamList, 'PDFViewer'>;
}

export const PDFViewerScreen: React.FC<PDFViewerScreenProps> = ({ route, navigation }) => {
  const { pdfUri, fileName } = route.params;
  const theme = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      await PDFService.sharePDF(pdfUri, fileName);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el PDF');
    } finally {
      setIsSharing(false);
    }
  }, [pdfUri, fileName]);
  
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await PDFService.saveToDisk(pdfUri, fileName);
      Alert.alert('Éxito', 'PDF guardado en tu dispositivo');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el PDF');
    } finally {
      setIsSaving(false);
    }
  }, [pdfUri, fileName]);
  
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleShare}
            disabled={isSharing}
          >
            <Ionicons name="share" size={20} color="#FFFFFF" />
          </Pressable>
          
          <Pressable
            style={[styles.headerButton, { backgroundColor: theme.colors.success }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons name="download" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, handleShare, handleSave, isSharing, isSaving, theme.colors]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebView
        source={{ uri: pdfUri }}
        style={styles.pdfViewer}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Cargando PDF...
            </Text>
          </View>
        )}
      />
    </View>
  );
};
```

---

## 🔧 MOBILE-SPECIFIC OPTIMIZATIONS

### Performance Optimization Strategy

#### **Component Memoization**
```typescript
// Mandatory memoization for all CV components
const PersonalInfoForm = React.memo(PersonalInfoFormComponent, (prevProps, nextProps) => {
  return (
    isEqual(prevProps.data, nextProps.data) &&
    prevProps.profileImageUri === nextProps.profileImageUri &&
    prevProps.uploadProgress === nextProps.uploadProgress
  );
});

const EducationForm = React.memo(EducationFormComponent, (prevProps, nextProps) => {
  return isEqual(prevProps.data, nextProps.data);
});

const SkillsForm = React.memo(SkillsFormComponent, (prevProps, nextProps) => {
  return isEqual(prevProps.data, nextProps.data);
});
```

#### **Debounced Form Updates**
```typescript
// Custom hook for debounced CV updates
const useDebouncedCVUpdate = (delay: number = 1000) => {
  const { saveCVData } = useCV();
  
  const debouncedSave = useMemo(
    () => debounce(async (data: CVFormData) => {
      try {
        await saveCVData();
        console.log('CV auto-saved successfully');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay),
    [saveCVData, delay]
  );
  
  return debouncedSave;
};

// Usage in components
const PersonalInfoScreen = () => {
  const { state, updatePersonalInfo } = useCV();
  const debouncedSave = useDebouncedCVUpdate(2000);
  
  useEffect(() => {
    if (state.ui.hasUnsavedChanges) {
      debouncedSave(state.formData);
    }
  }, [state.formData, state.ui.hasUnsavedChanges, debouncedSave]);
  
  return (
    <PersonalInfoForm
      data={state.formData.personalInfo || {}}
      onUpdate={updatePersonalInfo}
    />
  );
};
```

#### **List Virtualization**
```typescript
// Virtualized education history for large datasets
const VirtualizedEducationList = ({ educationHistory, onUpdate, onRemove }) => {
  const renderEducationItem = useCallback(({ item, index }) => (
    <EducationItem
      data={item}
      index={index}
      onUpdate={(data) => onUpdate(index, data)}
      onRemove={() => onRemove(index)}
    />
  ), [onUpdate, onRemove]);
  
  const getItemLayout = useCallback((data, index) => ({
    length: 200, // Estimated height
    offset: 200 * index,
    index,
  }), []);
  
  return (
    <FlatList
      data={educationHistory}
      keyExtractor={(item, index) => `education-${index}`}
      renderItem={renderEducationItem}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={3}
      showsVerticalScrollIndicator={false}
    />
  );
};
```

### Offline-First Architecture

#### **Data Persistence Strategy**
```typescript
// services/OfflineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineService {
  private static readonly CV_DATA_KEY = '@cv_builder_data';
  private static readonly PENDING_UPDATES_KEY = '@cv_builder_pending_updates';
  
  static async saveCVDataOffline(data: CVFormData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CV_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save CV data offline:', error);
    }
  }
  
  static async loadCVDataOffline(): Promise<CVFormData | null> {
    try {
      const data = await AsyncStorage.getItem(this.CV_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load CV data offline:', error);
      return null;
    }
  }
  
  static async addPendingUpdate(update: Partial<CVFormData>): Promise<void> {
    try {
      const existing = await this.getPendingUpdates();
      const updated = [...existing, { ...update, timestamp: Date.now() }];
      await AsyncStorage.setItem(this.PENDING_UPDATES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save pending update:', error);
    }
  }
  
  static async getPendingUpdates(): Promise<Array<Partial<CVFormData> & { timestamp: number }>> {
    try {
      const data = await AsyncStorage.getItem(this.PENDING_UPDATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load pending updates:', error);
      return [];
    }
  }
  
  static async clearPendingUpdates(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PENDING_UPDATES_KEY);
    } catch (error) {
      console.error('Failed to clear pending updates:', error);
    }
  }
  
  static async syncPendingUpdates(apiCall: (data: CVFormData) => Promise<void>): Promise<void> {
    const pendingUpdates = await this.getPendingUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const { timestamp, ...updateData } = update;
        await apiCall(updateData as CVFormData);
      } catch (error) {
        console.error('Failed to sync update:', error);
        // Keep failed updates for next sync attempt
        continue;
      }
    }
    
    await this.clearPendingUpdates();
  }
}

// Network state management hook
const useNetworkState = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { saveCVData } = useCV();
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      
      if (state.isConnected) {
        // Sync pending updates when back online
        OfflineService.syncPendingUpdates(saveCVData);
      }
    });
    
    return unsubscribe;
  }, [saveCVData]);
  
  return isOnline;
};
```

---

## 📱 REQUIRED REACT NATIVE LIBRARIES

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@tanstack/react-query": "^4.36.1",
    "@react-pdf/renderer": "^3.1.14",
    "expo-image-picker": "~14.7.1",
    "expo-file-system": "~15.6.0",
    "expo-sharing": "~11.7.0",
    "expo-media-library": "~15.9.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-netinfo/netinfo": "^11.2.1",
    "react-hook-form": "^7.48.2",
    "react-native-keyboard-aware-scroll-view": "^0.9.5",
    "react-native-reanimated": "~3.6.2",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-safe-area-context": "^4.8.2",
    "react-native-vector-icons": "^10.0.3",
    "react-native-webview": "^13.6.4",
    "lodash": "^4.17.21",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.202",
    "react-native-flipper": "^0.212.0"
  }
}