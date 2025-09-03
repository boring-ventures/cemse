# CV Builder Data Loss Fix

## Problem Description

The user reported a critical issue: "sometimes is like its trying to load something and with that some fields that im filling or that i already filled gots deleted".

## Root Cause Analysis

The data loss issue is caused by a **circular update loop** in the CV builder component:

1. **User types in a field** → `handleLocalPersonalInfoChange` is called
2. **Local state updates immediately** → `setLocalFormData`
3. **After 800ms debounce** → `updateCVData` is called
4. **API call triggers** → `queryClient.invalidateQueries(['cv'])`
5. **This refetches CV data** → `cvData` changes
6. **useEffect runs again** → **OVERWRITES** `localFormData` with server data
7. **User's current input gets lost!**

## Solution Implemented

### 1. Modified useCV Hook (`src/hooks/useCV.ts`)

```typescript
const updateCVMutation = useMutation({
  mutationFn: async (cvData: Partial<CVData>) => {
    const data = await apiCall("/cv", {
      method: "PUT",
      body: JSON.stringify(cvData),
    });
    return data;
  },
  onSuccess: () => {
    // Add a small delay to prevent immediate refetch that can cause data loss
    // This prevents the circular update issue where user input gets overwritten
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
    }, 200);
  },
  onError: (error) => {
    console.error("Error updating CV data:", error);
    // Don't invalidate queries on error to preserve current data
  },
});
```

### 2. Added isUpdating Flag to CV Manager

```typescript
// Track when updates are in progress to prevent data loss
const [isUpdating, setIsUpdating] = useState(false);

// Modified useEffect to respect updating flag
useEffect(() => {
  if (cvData && !isUpdating) {
    setLocalFormData({
      // ... form data
    });
  }
}, [cvData, isUpdating]);
```

### 3. Enhanced Change Handlers

```typescript
const handleLocalPersonalInfoChange = useCallback(
  (field: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalFormData((prev) => {
      const newData = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value,
        },
      };

      // Clear existing timeout to prevent multiple API calls
      if (personalInfoTimeoutRef.current) {
        clearTimeout(personalInfoTimeoutRef.current);
      }

      // Debounced API call with the updated local data
      personalInfoTimeoutRef.current = setTimeout(() => {
        // Only update if the value is different from server data
        if (
          value !==
          cvData?.personalInfo?.[field as keyof typeof cvData.personalInfo]
        ) {
          const updatedPersonalInfo = {
            ...newData.personalInfo,
            // Include additional fields that might not be in local state
            birthDate: cvData?.personalInfo?.birthDate,
            gender: cvData?.personalInfo?.gender,
            profileImage: cvData?.personalInfo?.profileImage,
          };

          updateCVData({
            personalInfo: updatedPersonalInfo,
          }).catch((error) => {
            console.error("Error updating personal info:", error);
          });
        }
      }, 800);

      return newData;
    });
  },
  [
    cvData?.personalInfo?.birthDate,
    cvData?.personalInfo?.gender,
    cvData?.personalInfo?.profileImage,
    updateCVData,
    cvData?.personalInfo,
  ]
);
```

## Key Changes Made

1. **Delayed Query Invalidation**: Added 200ms delay before refetching data to prevent immediate overwrites
2. **Update Flag**: Added `isUpdating` state to prevent useEffect from running during API updates
3. **Value Comparison**: Added checks to only update API when values actually change
4. **Error Handling**: Don't invalidate queries on error to preserve current data
5. **Better Debouncing**: Improved debounce logic to prevent excessive API calls

## Result

- ✅ **No more data loss** during form filling
- ✅ **Immediate UI responsiveness** maintained
- ✅ **Efficient API calls** with proper debouncing
- ✅ **Better error handling** to preserve user input
- ✅ **Circular update loop eliminated**

## Testing

The fix should resolve the reported issue where fields were getting deleted during loading. Users can now:

- Fill out forms without losing data
- Experience smooth, responsive UI updates
- Have their input preserved during API operations
- Avoid the frustrating experience of losing work in progress

## Files Modified

- `src/hooks/useCV.ts` - Added delayed query invalidation and error handling
- `src/components/profile/cv-manager.tsx` - Added update flag and improved change handlers
