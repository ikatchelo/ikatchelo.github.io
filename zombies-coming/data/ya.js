function checkType() {
  let type = 'desktop';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    type = 'mobile';
  }
  return type;
}
let deviceType = checkType();

let leaderboardDescription = {
  appID: 'test_app_id',
  default: true,
  description: {
    invert_sort_order: false,
    score_format: { options: { decimal_offset: 0 } },
    type: 'numeric',
  },
  name: 'test_leaderboard',
  title: { en: 'Leaderboard', ru: 'Таблица лидеров' },
  payload: ""
};

function createAdvMock() {
  return {
    showFullscreenAdv: ({ callbacks = {} } = {}) => {
      callbacks.onOpen?.();
      setTimeout(() => {
        callbacks.onRewarded?.();
        callbacks.onClose?.();
      }, 50);
    },
    showRewardedVideo: ({ callbacks = {} } = {}) => {
      callbacks.onOpen?.();
      setTimeout(() => {
        callbacks.onRewarded?.();
        callbacks.onClose?.();
      }, 50);
    },
    getBannerAdvStatus: () => Promise.resolve({ stickyAdvIsShowing: false, status: 'UNKNOWN' }),
    showBannerAdv: () => {},
    hideBannerAdv: () => {}
  };
}

var privYsdk = {
  serverTime: () => Date.now(),

  payments: {
    purchase: ({ id, developerPayload }) =>
      Promise.resolve({ productID: id, purchaseToken: "test", developerPayload, signature: "test" }),
    consumePurchase: () => Promise.resolve(),
    getCatalog: () => Promise.resolve([]),
    getPurchases: () => Promise.resolve([])
  },

  auth: { openAuthDialog: () => Promise.resolve() },

  features: {
    GameplayAPI: { start: () => {}, stop: () => {} },
    GamesAPI: {
      getAllGames: () => Promise.resolve({
        games: [{
          appID: '123456',
          title: 'Demo Game',
          url: 'https://example.com/game',
          coverURL: 'https://example.com/game/cover.jpg',
          iconURL: 'https://example.com/game/icon.png'
        }],
        developerURL: 'https://yandex.ru/games/developer/demo'
      }),
      getGameByID: (id) => {
      // Ищем игру по appID
      const games = [{
        appID: '123456',
        title: 'Demo Game',
        url: 'https://example.com/game',
        coverURL: 'https://example.com/game/cover.jpg',
        iconURL: 'https://example.com/game/icon.png'
      }];
      const game = games.find(g => g.appID === id);
      if (game) return Promise.resolve(game);
      return Promise.reject({ code: 'GAME_NOT_FOUND' });
    }
    }
  },

  shortcut: {
    canShowPrompt: () => Promise.resolve({ canShow: true }),
    createShortcut: () => Promise.resolve({ status: 'success' })
  },

  adv: createAdvMock(),

  feedback: {
    canReview: () => Promise.resolve({ value: false, reason: "GAME_RATED" }),
    requestReview: () => Promise.resolve({ feedbackSent: true })
  },

  deviceInfo: {
    isMobile: () => deviceType === 'mobile',
    isTablet: () => deviceType === 'tablet',
    isDesktop: () => deviceType === 'desktop',
    isTV: () => deviceType === 'tv',
    type: () => deviceType
  },

  getPayments: () => Promise.resolve({
    purchase: ({ id, developerPayload }) =>
      Promise.resolve({ productID: id, purchaseToken: "test", developerPayload, signature: "test" }),
    consumePurchase: () => Promise.resolve(),
    getCatalog: () => Promise.resolve([]),
    getPurchases: () => Promise.resolve([])
  }),

  getPlayer: () => Promise.resolve({
    getMode: () => 'lite',
    getName: () => 'player',
    getPhoto: () => 'nothing',
    getID: () => 'player_id',
    getUniqueID: () => 'player_id',
    getIDsPerGame: () => Promise.resolve([]),
    setData: () => Promise.resolve(),
    getData: () => Promise.resolve({}),
    setStats: () => Promise.resolve(),
    incrementStats: () => Promise.resolve({}),
    getStats: () => Promise.resolve({})
  }),

  getLeaderboards: () => Promise.resolve({
    getLeaderboardDescription: () => Promise.resolve(leaderboardDescription),
    getLeaderboardPlayerEntry: () => Promise.reject({ code: 'LEADERBOARD_PLAYER_NOT_PRESENT' }),
    getLeaderboardEntries: () => Promise.resolve({
      leaderboard: leaderboardDescription,
      userRank: 0,
      entries: [],
      ranges: []
    }),
    setLeaderboardScore: () => Promise.resolve()
  }),

  getStorage: () => Promise.resolve({
    setItem: (k, v) => localStorage.setItem(k, v),
    getItem: (k) => localStorage.getItem(k),
    removeItem: (k) => localStorage.removeItem(k),
    clear: () => localStorage.clear(),
    key: (i) => localStorage.key(i)
  }),

  clipboard: { writeText: () => Promise.resolve() },

  isAvailableMethod: (methodName) => Promise.resolve(
    ![
      "leaderboards.getLeaderboardPlayerEntry",
      "leaderboards.setLeaderboardScore",
      "player.getIDsPerGame"
    ].includes(methodName)
  )
};

var YaGames = {
  adv: createAdvMock(), // Доступно даже без init()
  init: function (options) {
    return new Promise(function (resolve) {
      let ysdk = privYsdk;
      ysdk.getFlags = () => Promise.resolve({ flag1: true, flag2: false });
      ysdk.environment = {
        app: { id: 'test_app_id' },
        browser: { lang: 'ru' },
        i18n: { lang: 'ru', tld: 'ru' }
      };
      resolve(ysdk);
    });
  }
};
