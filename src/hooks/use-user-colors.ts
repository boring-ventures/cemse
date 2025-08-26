import { useAuth } from "@/hooks/useJWTAuth";
import { useEffect } from "react";

export function useUserColors() {
  const { user } = useAuth();
  
  // Colores por defecto según el rol del usuario
  const getDefaultColors = () => {
    switch (user?.role) {
      case 'COMPANIES':
        return { primary: "#2563EB", secondary: "#F59E0B" }; // Azul empresarial y naranja
      case 'MUNICIPAL_GOVERNMENTS':
        return { primary: "#059669", secondary: "#7C3AED" }; // Verde municipal y púrpura
      case 'YOUTH':
      case 'ADOLESCENTS':
        return { primary: "#6B7280", secondary: "#9CA3AF" }; // Colores neutros para jóvenes
      case 'TRAINING_CENTERS':
        return { primary: "#0891B2", secondary: "#059669" }; // Azul y verde para educación
      case 'NGOS_AND_FOUNDATIONS':
        return { primary: "#7C2D12", secondary: "#DC2626" }; // Marrón y rojo para ONGs
      case 'SUPER_ADMIN':
        return { primary: "#7C2D12", secondary: "#DC2626" }; // Marrón y rojo para admin
      default:
        return { primary: "#1E40AF", secondary: "#F59E0B" }; // Colores por defecto
    }
  };

  const defaultColors = getDefaultColors();
  const primaryColor = user?.primaryColor || defaultColors.primary;
  const secondaryColor = user?.secondaryColor || defaultColors.secondary;
  
  console.log('🎨 useUserColors - User data:', {
    userId: user?.id,
    username: user?.username,
    role: user?.role,
    primaryColor: user?.primaryColor,
    secondaryColor: user?.secondaryColor,
    fallbackPrimary: primaryColor,
    fallbackSecondary: secondaryColor
  });
  
  // Función para convertir hex a oklch (simplificada)
  const hexToOklch = (hex: string): string => {
    const hexClean = hex.replace('#', '');
    const r = parseInt(hexClean.substr(0, 2), 16) / 255;
    const g = parseInt(hexClean.substr(2, 2), 16) / 255;
    const b = parseInt(hexClean.substr(4, 2), 16) / 255;
    
    // Conversión RGB a OKLCH aproximada
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const c = Math.sqrt((r - l) ** 2 + (g - l) ** 2 + (b - l) ** 2);
    const h = Math.atan2(g - l, r - l) * (180 / Math.PI);
    
    return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(4)})`;
  };
  
  // Función para calcular el contraste de colores
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };
  
  const primaryTextColor = getContrastColor(primaryColor);
  const secondaryTextColor = getContrastColor(secondaryColor);

  // Aplicar variables CSS al documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Convertir colores a formato oklch
    const primaryOklch = hexToOklch(primaryColor);
    const secondaryOklch = hexToOklch(secondaryColor);
    const primaryForegroundOklch = hexToOklch(primaryTextColor);
    const secondaryForegroundOklch = hexToOklch(secondaryTextColor);
    
    console.log('🎨 useUserColors - Applying colors to CSS variables:', {
      primary: primaryColor,
      primaryOklch,
      secondary: secondaryColor,
      secondaryOklch,
      primaryTextColor,
      secondaryTextColor
    });
    
    // Variables principales de shadcn/ui
    root.style.setProperty('--primary', primaryOklch);
    root.style.setProperty('--primary-foreground', primaryForegroundOklch);
    root.style.setProperty('--secondary', secondaryOklch);
    root.style.setProperty('--secondary-foreground', secondaryForegroundOklch);
    
    // Variables para el sidebar
    root.style.setProperty('--sidebar-primary', primaryOklch);
    root.style.setProperty('--sidebar-primary-foreground', primaryForegroundOklch);
    root.style.setProperty('--sidebar-accent', secondaryOklch);
    root.style.setProperty('--sidebar-accent-foreground', secondaryForegroundOklch);
    
    // Variables para acentos
    root.style.setProperty('--accent', secondaryOklch);
    root.style.setProperty('--accent-foreground', secondaryForegroundOklch);
    
    // Variables para charts
    root.style.setProperty('--chart-1', primaryOklch);
    root.style.setProperty('--chart-2', secondaryOklch);
    
    // Variables adicionales para municipios
    root.style.setProperty('--municipality-primary', primaryColor);
    root.style.setProperty('--municipality-secondary', secondaryColor);
    
    // Variables para botones específicos
    root.style.setProperty('--button-primary', primaryOklch);
    root.style.setProperty('--button-primary-hover', hexToOklch(primaryColor + 'E6')); // Con transparencia
    root.style.setProperty('--button-secondary', secondaryOklch);
    root.style.setProperty('--button-secondary-hover', hexToOklch(secondaryColor + 'E6')); // Con transparencia
    
    // Variables para badges
    root.style.setProperty('--badge-primary', primaryOklch);
    root.style.setProperty('--badge-secondary', secondaryOklch);
    
    // Variables para cards
    root.style.setProperty('--card-primary', primaryOklch);
    root.style.setProperty('--card-secondary', secondaryOklch);
    
    console.log('🎨 Applied user colors successfully:', {
      primary: primaryOklch,
      secondary: secondaryOklch,
      primaryForeground: primaryForegroundOklch,
      secondaryForeground: secondaryForegroundOklch
    });
    
    // Cleanup function
    return () => {
      // Reset to default values when component unmounts
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--sidebar-primary-foreground');
      root.style.removeProperty('--sidebar-accent');
      root.style.removeProperty('--sidebar-accent-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--chart-1');
      root.style.removeProperty('--chart-2');
      root.style.removeProperty('--municipality-primary');
      root.style.removeProperty('--municipality-secondary');
      root.style.removeProperty('--button-primary');
      root.style.removeProperty('--button-primary-hover');
      root.style.removeProperty('--button-secondary');
      root.style.removeProperty('--button-secondary-hover');
      root.style.removeProperty('--badge-primary');
      root.style.removeProperty('--badge-secondary');
      root.style.removeProperty('--card-primary');
      root.style.removeProperty('--card-secondary');
    };
  }, [primaryColor, secondaryColor, primaryTextColor, secondaryTextColor]);

  return {
    primaryColor,
    secondaryColor,
    primaryTextColor,
    secondaryTextColor,
    getContrastColor,
    hexToOklch
  };
}