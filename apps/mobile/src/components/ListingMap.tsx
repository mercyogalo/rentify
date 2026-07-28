import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Props = {
  latitude: number;
  longitude: number;
  style?: ViewStyle;
};

export function ListingMap({ latitude, longitude, style }: Props) {
  return (
    <MapView
      style={[styles.map, style]}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 180 },
});
