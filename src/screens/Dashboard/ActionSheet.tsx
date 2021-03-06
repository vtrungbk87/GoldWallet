import React from 'react';
import { Text, StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import { WalletItemProps, WalletItem, GradientView } from 'app/components';
import { Wallet } from 'app/consts';
import { typography, palette } from 'app/styles';

const SCREEN_HEIGHT = Dimensions.get('screen').height;
const i18n = require('../../../loc');

interface Props extends NavigationInjectedProps {
  isVisible?: boolean;
  walletItems: WalletItemProps[];
}

export const ActionSheet = (props: Props) => {
  const renderWalletItems = () => {
    const wallets = props.navigation.getParam('wallets');
    const selectedIndex = props.navigation.getParam('selectedIndex');
    const onPress = props.navigation.getParam('onPress');
    return wallets.map((wallet: Wallet, index: number) => (
      <WalletItem
        variant={wallet.label === 'All wallets' ? GradientView.Variant.Secondary : GradientView.Variant.Primary}
        value={wallet.balance}
        unit="BTCV"
        name={wallet.label}
        title={wallet.label === 'All wallets' ? 'AW' : wallet.label[0]}
        selected={index == selectedIndex}
        key={index}
        onPress={() => {
          props.navigation.goBack();
          onPress(index);
        }}
      />
    ));
  };

  return (
    <View style={styles.modal}>
      <ScrollView style={styles.containerStyle} bounces={false}>
        <View style={styles.breakLine} />
        <Text style={styles.titleStyle}>{i18n.wallets.walletModal.wallets}</Text>
        <View style={styles.walletContainer}>{renderWalletItems()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: palette.modalTransparent },
  containerStyle: {
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT / 2,
    backgroundColor: palette.white,
    borderRadius: 8,
  },
  titleStyle: {
    ...typography.headline4,
    textAlign: 'center',
  },
  walletContainer: {
    marginTop: 31,
  },
  breakLine: {
    marginBottom: 13,
    marginTop: 16,
    height: 3,
    width: 36,
    backgroundColor: palette.grey,
    alignSelf: 'center',
  },
});
