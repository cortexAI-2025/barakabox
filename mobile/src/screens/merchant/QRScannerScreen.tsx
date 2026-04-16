import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../services/api';
import { colors, fontSizes, spacing } from '../../utils/theme';

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      const parsed = JSON.parse(data);
      const { qrCode } = parsed;

      const res = await ordersAPI.complete(qrCode);
      Alert.alert(
        '✅ Commande validée!',
        `La commande a été complétée avec succès.`,
        [{ text: 'OK', onPress: () => { setScanned(false); navigation.goBack(); } }]
      );
    } catch (e: any) {
      Alert.alert(
        'Erreur',
        e.response?.data?.message || 'QR code invalide',
        [{ text: 'Réessayer', onPress: () => setScanned(false) }]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) return <View style={styles.container}><Text>Demande d'autorisation...</Text></View>;
  if (hasPermission === false) return (
    <View style={styles.container}>
      <Text style={styles.permissionText}>Accès à la caméra refusé</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <Text style={styles.scanHint}>
            {processing ? 'Validation en cours...' : 'Scannez le QR code du client'}
          </Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 56, left: spacing.lg, padding: spacing.sm },
  scanArea: {
    width: 260, height: 260, position: 'relative',
  },
  corner: {
    position: 'absolute', width: 40, height: 40,
    borderColor: colors.primary, borderTopWidth: 4, borderLeftWidth: 4,
    top: 0, left: 0,
  },
  cornerTR: { top: 0, left: 'auto' as any, right: 0, borderLeftWidth: 0, borderRightWidth: 4 },
  cornerBL: { top: 'auto' as any, bottom: 0, left: 0, borderTopWidth: 0, borderBottomWidth: 4 },
  cornerBR: { top: 'auto' as any, bottom: 0, left: 'auto' as any, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 4, borderBottomWidth: 4 },
  scanHint: { color: '#FFF', fontSize: fontSizes.md, fontWeight: '600', marginTop: spacing.xl, textAlign: 'center' },
  permissionText: { color: '#FFF', textAlign: 'center', padding: spacing.lg },
});

export default QRScannerScreen;
