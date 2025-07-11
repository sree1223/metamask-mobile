import React from 'react';
import Wallet from './';
import { renderScreen } from '../../../util/test/renderWithProvider';
import { screen } from '@testing-library/react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Routes from '../../../constants/navigation/Routes';
import { backgroundState } from '../../../util/test/initial-root-state';
import { MOCK_ACCOUNTS_CONTROLLER_STATE } from '../../../util/test/accountsControllerTestUtils';
import { WalletViewSelectorsIDs } from '../../../../e2e/selectors/wallet/WalletView.selectors';
import Engine from '../../../core/Engine';
import { useSelector } from 'react-redux';

const MOCK_ADDRESS = '0xc4955c0d639d99699bfd7ec54d9fafee40e4d272';

jest.mock('../../../util/address', () => {
  const actual = jest.requireActual('../../../util/address');
  return {
    ...actual,
    getLabelTextByAddress: jest.fn(),
  };
});

jest.mock('../../../util/notifications/constants/config', () => ({
  isNotificationsFeatureEnabled: jest.fn(() => true),
}));

jest.mock('../../../core/Engine', () => {
  const { MOCK_ACCOUNTS_CONTROLLER_STATE: mockAccountsControllerState } =
    jest.requireActual('../../../util/test/accountsControllerTestUtils');
  const { KeyringTypes } = jest.requireActual('@metamask/keyring-controller');

  return {
    getTotalEvmFiatAccountBalance: jest.fn().mockReturnValue({
      totalNativeTokenBalance: { amount: '1', unit: 'ETH' },
      totalBalanceFiat: 3200,
      balances: {
        '0x0': { amount: '1', unit: 'ETH' },
      },
    }),
    context: {
      NftController: {
        allNfts: {
          [MOCK_ADDRESS]: {
            [MOCK_ADDRESS]: [],
          },
        },
        allNftContracts: {
          [MOCK_ADDRESS]: {
            [MOCK_ADDRESS]: [],
          },
        },
      },
      TokenRatesController: {
        poll: jest.fn(),
      },
      TokenDetectionController: {
        detectTokens: jest.fn(),
      },
      NftDetectionController: {
        detectNfts: jest.fn(),
      },
      AccountTrackerController: {
        refresh: jest.fn(),
      },
      KeyringController: {
        state: {
          keyrings: [
            {
              accounts: ['0xC4955C0d639D99699Bfd7Ec54d9FaFEe40e4D272'],
              type: KeyringTypes.hd,
              metadata: {
                id: '01JNG71B7GTWH0J1TSJY9891S0',
                name: '',
              },
            },
          ],
        },
      },
      AccountsController: {
        ...mockAccountsControllerState,
        state: mockAccountsControllerState,
      },
      PreferencesController: {
        setTokenNetworkFilter: jest.fn(),
      },
      TokensController: {
        addTokens: jest.fn(),
      },
    },
  };
});

jest.mock('../../../core/Engine/Engine', () => ({
  __esModule: true,
  default: {
    get context() {
      return {
        MultichainNetworkController: {
          getNetworksWithTransactionActivityByAccounts: jest
            .fn()
            .mockResolvedValue(undefined),
        },
      };
    },
    get controllerMessenger() {
      return {
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      };
    },
  },
}));

const mockInitialState = {
  networkOnboarded: {
    networkOnboardedState: {
      '0x1': true,
    },
  },
  security: {
    dataCollectionForMarketing: true,
  },
  swaps: {
    [MOCK_ADDRESS]: { isLive: true },
    hasOnboarded: false,
    isLive: true,
  },
  wizard: {
    step: 0,
  },
  settings: {
    primaryCurrency: 'usd',
  },
  engine: {
    backgroundState: {
      ...backgroundState,
      AccountsController: {
        ...MOCK_ACCOUNTS_CONTROLLER_STATE,
      },
      TokensController: {
        ...backgroundState.TokensController,
        detectedTokens: [{ address: '0x123' }],
        allDetectedTokens: {
          '0x1': {
            '0xc4966c0d659d99699bfd7eb54d8fafee40e4a756': [
              { address: '0x123' },
            ],
          },
        },
      },
    },
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest
    .fn()
    .mockImplementation((callback) => callback(mockInitialState)),
}));

jest.mock('react-native-scrollable-tab-view', () => {
  const ScrollableTabViewMock = jest
    .fn()
    .mockImplementation(() => ScrollableTabViewMock);
  // TODO - Clean up mock.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ScrollableTabViewMock.defaultProps = {
    onChangeTab: jest.fn(),
    renderTabBar: jest.fn(),
  };
  return ScrollableTabViewMock;
});

jest.mock('../../../util/address', () => ({
  ...jest.requireActual('../../../util/address'),
  getInternalAccountByAddress: jest.fn().mockReturnValue({
    address: MOCK_ADDRESS,
    balance: '0x0',
    name: 'Account 1',
    type: 'default',
    metadata: {
      keyring: {
        type: 'HD Key Tree',
      },
    },
  }),
}));
const render = (Component: React.ComponentType) =>
  renderScreen(
    Component,
    {
      name: Routes.WALLET_VIEW,
    },
    {
      state: mockInitialState,
    },
  );

const renderWithoutDetectedTokens = (Component: React.ComponentType) =>
  renderScreen(
    Component,
    {
      name: Routes.WALLET_VIEW,
    },
    {
      state: {
        ...mockInitialState,
        engine: {
          backgroundState: {
            ...mockInitialState.engine.backgroundState,
            TokensController: {
              ...mockInitialState.engine.backgroundState.TokensController,
              // @ts-expect-error we are testing the invalid case
              detectedTokens: 'invalid-array',
            },
          },
        },
      },
    },
  );

describe('Wallet', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render correctly', () => {
    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    const wrapper = render(Wallet);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('should render correctly when there are no detected tokens', () => {
    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    const wrapper = renderWithoutDetectedTokens(Wallet);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('should render scan qr icon', () => {
    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    render(Wallet);
    const scanButton = screen.getByTestId(
      WalletViewSelectorsIDs.WALLET_SCAN_BUTTON,
    );
    expect(scanButton).toBeDefined();
  });
  it('should render ScrollableTabView', () => {
    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    render(Wallet);
    expect(ScrollableTabView).toHaveBeenCalled();
  });
  it('should render the address copy button', () => {
    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    render(Wallet);
    const addressCopyButton = screen.getByTestId(
      WalletViewSelectorsIDs.NAVBAR_ADDRESS_COPY_BUTTON,
    );
    expect(addressCopyButton).toBeDefined();
  });
  it('should render the account picker', () => {
    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    render(Wallet);
    const accountPicker = screen.getByTestId(
      WalletViewSelectorsIDs.ACCOUNT_ICON,
    );
    expect(accountPicker).toBeDefined();
  });

  it('Should add tokens to state automatically when there are detected tokens', () => {
    const mockedAddTokens = jest.mocked(Engine.context.TokensController);

    //@ts-expect-error we are ignoring the navigation params on purpose because we do not want to mock setOptions to test the navbar
    render(Wallet);

    expect(mockedAddTokens.addTokens).toHaveBeenCalledTimes(1);
  });

  it('should render correctly when Solana support is enabled', () => {
    jest
      .mocked(useSelector)
      .mockImplementation((callback: (state: unknown) => unknown) =>
        callback(mockInitialState),
      );
    //@ts-expect-error we are ignoring the navigation params on purpose
    const wrapper = render(Wallet);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
