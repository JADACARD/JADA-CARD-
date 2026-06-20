
import { cards } from './cards.js';
import { WALLET, addBalance, canClaimDaily, claimDaily } from './wallet.js';

console.log('JADA Cards loaded:', cards.length);
console.log('Wallet balance:', WALLET.balance);
console.log('Can claim daily test:', canClaimDaily('test-card'));

// Test add balance
addBalance(100);
console.log('After adding 100:', WALLET.balance);
