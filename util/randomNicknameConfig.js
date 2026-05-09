
import generateRandomNickname from '@articles-media/articles-dev-box/generateRandomNickname';

const randomNicknameConfig = {
  type: 'Basic',
  parts: [
    [
      'Savvy', 'Wealthy', 'Ambitious', 'Bold', 'Ruthless', 'Shrewd', 'Enterprising', 'Opportunistic',
      'Prosperous', 'Astute', 'Visionary', 'Risky', 'Dynamic', 'Influential', 'Powerful', 'Resourceful',
      'Strategic', 'Cunning', 'Decisive', 'Dominant', 'Competitive', 'Innovative', 'Aggressive', 'Expansive',
      'Lucrative', 'Profitable', 'Global', 'Elite', 'Privileged', 'Industrial'
    ],
    [
      'Tycoon', 'Magnate', 'Mogul', 'Investor', 'Broker', 'Baron', 'Capitalist', 'Financier',
      'Entrepreneur', 'Executive', 'Trader', 'Banker', 'Industrialist', 'Shareholder', 'Speculator', 'CEO',
      'Chairman', 'Director', 'Venture', 'Merchant', 'Oligarch', 'Boss', 'Owner', 'Manager',
      'CFO', 'Founder', 'Partner', 'Stockholder', 'Dealer', 'Rainmaker'
    ]
  ]
};

export default () => generateRandomNickname(randomNicknameConfig);