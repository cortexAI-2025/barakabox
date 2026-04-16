import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../store';
import { loadUser } from '../store/slices/authSlice';
import { colors } from '../utils/theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import FavoritesScreen from '../screens/home/FavoritesScreen';
import BrowseScreen from '../screens/home/BrowseScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import OfferDetailScreen from '../screens/offers/OfferDetailScreen';
import BookingScreen from '../screens/orders/BookingScreen';
import OrderConfirmationScreen from '../screens/orders/OrderConfirmationScreen';
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import ReferralScreen from '../screens/profile/ReferralScreen';
import MerchantDashboardScreen from '../screens/merchant/MerchantDashboardScreen';
import QRScannerScreen from '../screens/merchant/QRScannerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const isMerchant = user?.role === 'MERCHANT' || user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home: ['home', 'home-outline'],
            Favorites: ['heart', 'heart-outline'],
            Orders: ['bag', 'bag-outline'],
            Merchant: ['storefront', 'storefront-outline'],
            Profile: ['person', 'person-outline'],
          };
          const [active, inactive] = icons[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} options={{ title: 'Commandes' }} />
      {isMerchant && (
        <Tab.Screen name="Merchant" component={MerchantDashboardScreen} options={{ title: 'Marchand' }} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="Browse" component={BrowseScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} />
        <Stack.Screen name="MerchantQRScanner" component={QRScannerScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
