import bip21 from 'bip21';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  View,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { NavigationInjectedProps } from 'react-navigation';

import { images } from 'app/assets';
import { Wallet, Route } from 'app/consts';
import { CreateMessage, MessageType } from 'app/helpers/MessageCreator';
import { NavigationService } from 'app/services';
import { getStatusBarHeight } from 'app/styles';

import {
  SegwitP2SHWallet,
  LegacyWallet,
  WatchOnlyWallet,
  HDLegacyP2PKHWallet,
  HDSegwitBech32Wallet,
  HDSegwitP2SHWallet,
} from '../../class';

const wif = require('wif');

const BlueApp = require('../../BlueApp');
const bip38 = require('../../bip38');
const EV = require('../../events');
const loc = require('../../loc');
const i18n = require('../../loc');
const prompt = require('../../prompt');

const { width } = Dimensions.get('window');

const SCAN_CODE_AFTER_MS = 2 * 1000; // in miliseconds

const now = (): number => new Date().getTime();

interface BarCodeScanEvent {
  data: string;
  rawData?: string;
  type: string;
}

type Props = NavigationInjectedProps;

interface State {
  isLoading: boolean;
  message: string;
}

export default class ImportWalletQRCodeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  cameraRef = React.createRef<RNCamera>();
  lastTimeIveBeenHere = now();

  state = {
    isLoading: false,
    message: '',
  };

  showErrorMessageScreen = () =>
    CreateMessage({
      title: i18n.message.somethingWentWrong,
      description: i18n.message.somethingWentWrongWhileCreatingWallet,
      type: MessageType.error,
      buttonProps: {
        title: i18n.message.returnToDashboard,
        onPress: () => NavigationService.navigateWithReset(Route.MainCardStackNavigator),
      },
    });

  showSuccessImportMessageScreen = () =>
    CreateMessage({
      title: i18n.message.success,
      description: i18n.message.successfullWalletImport,
      type: MessageType.success,
      buttonProps: {
        title: i18n.message.returnToDashboard,
        onPress: () => NavigationService.navigateWithReset(Route.MainCardStackNavigator),
      },
    });

  onBarCodeScanned = (event: BarCodeScanEvent) => {
    console.log('event', event);
    CreateMessage({
      title: i18n.message.creatingWallet,
      description: i18n.message.creatingWalletDescription,
      type: MessageType.processingState,
      asyncTask: () => this.importMnemonic(event.data),
    });
    this.props.navigation.goBack();

    // code for importing wallet only with qr code with bug descripted in ticket https://trello.com/c/5TgN4PqE/193-import-walletu-android-iphone

    // if (now() - this.lastTimeIveBeenHere < SCAN_CODE_AFTER_MS) {
    //   this.lastTimeIveBeenHere = now();
    //   return;
    // }
    // this.lastTimeIveBeenHere = now();
    // this.setState({ isLoading: true });
    // if (event.data[0] === '6') {
    //   // password-encrypted, need to ask for password and decrypt
    //   console.log('trying to decrypt...');

    //   this.setState({
    //     message: loc.wallets.scanQrWif.decoding,
    //   });
    //   // shold_stop_bip38 = undefined; // eslint-disable-line
    //   const password = await prompt(loc.wallets.scanQrWif.input_password, loc.wallets.scanQrWif.password_explain);
    //   if (!password) {
    //     return;
    //   }
    //   try {
    //     const decryptedKey = await bip38.decrypt(event.data, password, (status: any) => {
    //       this.setState({
    //         message: loc.wallets.scanQrWif.decoding + '... ' + status.percent.toString().substr(0, 4) + ' %',
    //       });
    //     });
    //     event.data = wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed);
    //   } catch (e) {
    //     this.setState({ message: '', isLoading: false });
    //     return Alert.alert(loc.wallets.scanQrWif.bad_password);
    //   }
    //   this.setState({ message: '', isLoading: false });
    // }

    // for (const w of BlueApp.wallets) {
    //   if (w.getSecret() === event.data) {
    //     // lookig for duplicates
    //     this.setState({ isLoading: false });
    //     return Alert.alert(loc.wallets.scanQrWif.wallet_already_exists); // duplicate, not adding
    //   }
    // }

    // // is it just address..?
    // const watchOnly = new WatchOnlyWallet();
    // let watchAddr = event.data;

    // // Is it BIP21 format?
    // if (event.data.indexOf('bitcoin:') === 0 || event.data.indexOf('BITCOIN:') === 0) {
    //   try {
    //     watchAddr = bip21.decode(event.data).address;
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }

    // // Or is it a bare address?
    // // TODO: remove these hardcodes
    // if (event.data.indexOf('Y') === 0 || event.data.indexOf('R') === 0 || event.data.indexOf('royale') === 0) {
    //   try {
    //     watchAddr = event.data;
    //   } catch (err) {
    //     console.log(err.message);
    //   }
    // }

    // if (watchOnly.setSecret(watchAddr) && watchOnly.valid()) {
    //   watchOnly.setLabel(loc.wallets.scanQrWif.imported_watchonly);
    //   BlueApp.wallets.push(watchOnly);
    //   Alert.alert(
    //     loc.wallets.scanQrWif.imported_watchonly + loc.wallets.scanQrWif.with_address + watchOnly.getAddress(),
    //   );
    //   await watchOnly.fetchBalance();
    //   await watchOnly.fetchTransactions();
    //   await BlueApp.saveToDisk();
    //   this.props.navigation.popToTop();
    //   setTimeout(() => EV(EV.enum.WALLETS_COUNT_CHANGED), 500);
    //   this.setState({ isLoading: false });
    //   return;
    // }
    // // nope

    // // is it HD BIP84 mnemonic?
    // let hd;
    // hd = new HDSegwitBech32Wallet();
    // hd.setSecret(event.data);
    // if (hd.validateMnemonic()) {
    //   for (const w of BlueApp.wallets) {
    //     if (w.getSecret() === hd.getSecret()) {
    //       // lookig for duplicates
    //       this.setState({ isLoading: false });
    //       return Alert.alert(loc.wallets.scanQrWif.wallet_already_exists); // duplicate, not adding
    //     }
    //   }
    //   this.setState({ isLoading: true });
    //   hd.setLabel(loc.wallets.import.imported + ' ' + hd.typeReadable);
    //   await hd.fetchBalance();
    //   if (hd.getBalance() !== 0) {
    //     await hd.fetchTransactions();
    //     BlueApp.wallets.push(hd);
    //     await BlueApp.saveToDisk();
    //     Alert.alert(loc.wallets.import.success);
    //     this.props.navigation.popToTop();
    //     setTimeout(() => EV(EV.enum.WALLETS_COUNT_CHANGED), 500);
    //     this.setState({ isLoading: false });
    //     return;
    //   }
    // }
    // // nope

    // // is it HD legacy (BIP44) mnemonic?
    // hd = new HDLegacyP2PKHWallet();
    // hd.setSecret(event.data);
    // if (hd.validateMnemonic()) {
    //   for (const w of BlueApp.wallets) {
    //     if (w.getSecret() === hd.getSecret()) {
    //       // lookig for duplicates
    //       this.setState({ isLoading: false });
    //       return Alert.alert(loc.wallets.scanQrWif.wallet_already_exists); // duplicate, not adding
    //     }
    //   }
    //   await hd.fetchTransactions();
    //   if (hd.getTransactions().length !== 0) {
    //     await hd.fetchBalance();
    //     hd.setLabel(loc.wallets.import.imported + ' ' + hd.typeReadable);
    //     BlueApp.wallets.push(hd);
    //     await BlueApp.saveToDisk();
    //     Alert.alert(loc.wallets.import.success);
    //     this.props.navigation.popToTop();
    //     setTimeout(() => EV(EV.enum.WALLETS_COUNT_CHANGED), 500);
    //     this.setState({ isLoading: false });
    //     return;
    //   }
    // }
    // // nope

    // // is it HD mnemonic?
    // hd = new HDSegwitP2SHWallet();
    // hd.setSecret(event.data);
    // if (hd.validateMnemonic()) {
    //   for (const w of BlueApp.wallets) {
    //     if (w.getSecret() === hd.getSecret()) {
    //       // lookig for duplicates
    //       this.setState({ isLoading: false });
    //       return Alert.alert(loc.wallets.scanQrWif.wallet_already_exists); // duplicate, not adding
    //     }
    //   }
    //   this.setState({ isLoading: true });
    //   hd.setLabel(loc.wallets.import.imported + ' ' + hd.typeReadable);
    //   BlueApp.wallets.push(hd);
    //   await hd.fetchBalance();
    //   await hd.fetchTransactions();
    //   await BlueApp.saveToDisk();
    //   Alert.alert(loc.wallets.import.success);
    //   this.props.navigation.popToTop();
    //   setTimeout(() => EV(EV.enum.WALLETS_COUNT_CHANGED), 500);
    //   this.setState({ isLoading: false });
    //   return;
    // }
    // // nope

    // const newWallet = new SegwitP2SHWallet();
    // newWallet.setSecret(event.data);
    // const newLegacyWallet = new LegacyWallet();
    // newLegacyWallet.setSecret(event.data);

    // if (newWallet.getAddress() === false && newLegacyWallet.getAddress() === false) {
    //   Alert.alert(loc.wallets.scanQrWif.bad_wif);
    //   this.setState({ isLoading: false });
    //   return;
    // }

    // if (newWallet.getAddress() === false && newLegacyWallet.getAddress() !== false) {
    //   // case - WIF is valid, just has uncompressed pubkey
    //   newLegacyWallet.setLabel(loc.wallets.scanQrWif.imported_legacy);
    //   BlueApp.wallets.push(newLegacyWallet);
    //   Alert.alert(
    //     loc.wallets.scanQrWif.imported_wif +
    //       event.data +
    //       loc.wallets.scanQrWif.with_address +
    //       newLegacyWallet.getAddress(),
    //   );
    //   await newLegacyWallet.fetchBalance();
    //   await newLegacyWallet.fetchTransactions();
    //   await BlueApp.saveToDisk();
    //   this.props.navigation.popToTop();
    //   setTimeout(() => EV(EV.enum.WALLETS_COUNT_CHANGED), 500);
    //   return;
    // }

    // this.setState({ isLoading: true });
    // await newLegacyWallet.fetchBalance();
    // console.log('newLegacyWallet == ', newLegacyWallet.getBalance());

    // if (newLegacyWallet.getBalance()) {
    //   newLegacyWallet.setLabel(loc.wallets.scanQrWif.imported_legacy);
    //   BlueApp.wallets.push(newLegacyWallet);
    //   Alert.alert(
    //     loc.wallets.scanQrWif.imported_wif +
    //       event.data +
    //       loc.wallets.scanQrWif.with_address +
    //       newLegacyWallet.getAddress(),
    //   );
    //   await newLegacyWallet.fetchTransactions();
    // } else {
    //   await newWallet.fetchBalance();
    //   await newWallet.fetchTransactions();
    //   newWallet.setLabel(loc.wallets.scanQrWif.imported_segwit);
    //   BlueApp.wallets.push(newWallet);
    //   Alert.alert(
    //     loc.wallets.scanQrWif.imported_wif + event.data + loc.wallets.scanQrWif.with_address + newWallet.getAddress(),
    //   );
    // }
    // await BlueApp.saveToDisk();
    // this.props.navigation.popToTop();
    // setTimeout(() => EV(EV.enum.WALLETS_COUNT_CHANGED), 500);
  };

  saveWallet = async (w: any) => {
    if (BlueApp.getWallets().some((wallet: Wallet) => wallet.getSecret() === w.secret)) {
      Alert.alert('walletInUseValidationError');
    } else {
      w.setLabel(i18n.wallets.import.imported + ' ' + w.typeReadable);
      BlueApp.wallets.push(w);
      await BlueApp.saveToDisk();
      EV(EV.enum.WALLETS_COUNT_CHANGED);
      this.props.navigation.popToTop();

      this.showSuccessImportMessageScreen();
      // this.props.navigation.dismiss();
    }
  };

  importMnemonic = async (text: string) => {
    console.log('importMnemonic');
    try {
      // trying other wallet types
      const segwitWallet = new SegwitP2SHWallet();
      segwitWallet.setSecret(text);
      if (segwitWallet.getAddress()) {
        // ok its a valid WIF

        const legacyWallet = new LegacyWallet();
        legacyWallet.setSecret(text);

        await legacyWallet.fetchBalance();
        if (legacyWallet.getBalance() > 0) {
          // yep, its legacy we're importing
          await legacyWallet.fetchTransactions();
          return this.saveWallet(legacyWallet);
        } else {
          // by default, we import wif as Segwit P2SH
          await segwitWallet.fetchBalance();
          await segwitWallet.fetchTransactions();
          return this.saveWallet(segwitWallet);
        }
      }

      // case - WIF is valid, just has uncompressed pubkey

      const legacyWallet = new LegacyWallet();
      legacyWallet.setSecret(text);
      if (legacyWallet.getAddress()) {
        await legacyWallet.fetchBalance();
        await legacyWallet.fetchTransactions();
        return this.saveWallet(legacyWallet);
      }

      // if we're here - nope, its not a valid WIF

      const hd2 = new HDSegwitP2SHWallet();
      hd2.setSecret(text);
      if (hd2.validateMnemonic()) {
        hd2.generateAddresses();
        await hd2.fetchBalance();
        if (hd2.getBalance() > 0) {
          await hd2.fetchTransactions();
          return this.saveWallet(hd2);
        }
      }

      const hd4 = new HDSegwitBech32Wallet();
      hd4.setSecret(text);
      if (hd4.validateMnemonic()) {
        hd4.generateAddresses();
        await hd4.fetchBalance();
        if (hd4.getBalance() > 0) {
          await hd4.fetchTransactions();
          return this.saveWallet(hd4);
        }
      }

      const hd3 = new HDLegacyP2PKHWallet();
      hd3.setSecret(text);
      if (hd3.validateMnemonic()) {
        hd3.generateAddresses();
        await hd3.fetchBalance();
        if (hd3.getBalance() > 0) {
          await hd3.fetchTransactions();
          return this.saveWallet(hd3);
        }
      }

      // no balances? how about transactions count?

      if (hd2.validateMnemonic()) {
        await hd2.fetchTransactions();
        if (hd2.getTransactions().length !== 0) {
          return this.saveWallet(hd2);
        }
      }
      if (hd3.validateMnemonic()) {
        await hd3.fetchTransactions();
        if (hd3.getTransactions().length !== 0) {
          return this.saveWallet(hd3);
        }
      }
      if (hd4.validateMnemonic()) {
        await hd4.fetchTransactions();
        if (hd4.getTransactions().length !== 0) {
          return this.saveWallet(hd4);
        }
      }

      // is it even valid? if yes we will import as:
      if (hd4.validateMnemonic()) {
        return this.saveWallet(hd4);
      }

      // not valid? maybe its a watch-only address?

      const watchOnly = new WatchOnlyWallet();
      watchOnly.setSecret(text);
      if (watchOnly.valid()) {
        await watchOnly.fetchTransactions();
        await watchOnly.fetchBalance();
        return this.saveWallet(watchOnly);
      }

      // nope?

      // TODO: try a raw private key
    } catch (Err) {
      this.showErrorMessageScreen();
    }
    this.showErrorMessageScreen();
    // ReactNativeHapticFeedback.trigger('notificationError', {
    //   ignoreAndroidSystemSettings: false,
    // });
    // Plan:
    // 0. check if its HDSegwitBech32Wallet (BIP84)
    // 1. check if its HDSegwitP2SHWallet (BIP49)
    // 2. check if its HDLegacyP2PKHWallet (BIP44)
    // 3. check if its HDLegacyBreadwalletWallet (no BIP, just "m/0")
    // 4. check if its Segwit WIF (P2SH)
    // 5. check if its Legacy WIF
    // 6. check if its address (watch-only wallet)
    // 7. check if its private key (segwit address P2SH) TODO
    // 7. check if its private key (legacy address) TODO
  };

  navigateBack = () => this.props.navigation.goBack();

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <RNCamera
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }}
          style={styles.camera}
          onBarCodeRead={this.onBarCodeScanned}
          ref={this.cameraRef}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        />
        <View style={styles.crosshairContainer}>
          <Image style={styles.crosshair} source={images.scanQRcrosshair} />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={this.navigateBack}>
          <Image source={images.close} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    flex: 1,
    paddingTop: 20,
    justifyContent: 'center',
    alignContent: 'center',
  },
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  crosshairContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshair: {
    width: width * 0.58,
    height: width * 0.58,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    borderRadius: 20,
    position: 'absolute',
    top: getStatusBarHeight(),
    right: 20,
  },
});
