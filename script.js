'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, //
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-01-10T17:01:17.194Z',
    '2021-01-14T08:36:17.929Z',
    '2021-01-16T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2021-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2021-06-25T18:49:59.371Z',
    '2021-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////__FUNCTIONS__//////////////////////////////

const formatMovementDate = date => {
  const calcDaysPassed = (day1, day2) =>
    Math.round(Math.abs((day2 - day1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = `${date.getFullYear()}`;

  console.log(daysPassed);
  return `${day}/${month}/${year}`;
};

const displayMovements = function (acc, sorted = false) {
  const movs = sorted
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  containerMovements.innerHTML = '';
  movs.forEach((mov, ind) => {
    const date = new Date(acc.movementsDates[ind]);

    const type = (mov > 0 && 'deposit') || 'withdrawal';
    const displayDate = formatMovementDate(date);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      ind + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const createUsername = accs => {
  // loop over the accounts: for each of the account
  // get the full name, get each letters of the username
  // add a property 'username' and store the username there

  accs.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(el => el[0])
      .join('');
  });
};
const calcDisplayBalance = user => {
  user.balance = user.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = user.balance.toFixed(2);
};

createUsername(accounts);

const updateUI = function (acc) {
  calcDisplayBalance(acc);

  displayMovements(acc);

  calcDisplaySummary(acc);
};

const deposits = mov => mov.filter(dep => dep > 0);
const withdrawals = mov => mov.filter(wid => wid < 0);

console.log(deposits(movements), withdrawals(movements));

// euro €
const eurToUSD = 1.1;
const totalDepositsUSD = movements
  .filter(el => el > 0)
  .map(el => el * eurToUSD)
  .reduce((acc, val) => acc + val, 0);

const calcDisplaySummary = function (acc) {
  const totalDeposit = acc.movements
    .filter(el => el > 0)
    .reduce((acc, val) => acc + val, 0);
  const totalWithdrawal = acc.movements
    .filter(el => el < 0)
    .reduce((acc, val) => acc + val, 0);

  const interest = acc.movements
    .filter(el => el > 0)
    .map(el => (el * acc.interestRate) / 100)
    .filter(val => val >= 1)
    .reduce((acc, val) => acc + val, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
  labelSumOut.textContent = `${Math.abs(totalWithdrawal.toFixed(2))}€`;
  labelSumIn.textContent = `${totalDeposit.toFixed(2)}€`;
};

console.log(totalDepositsUSD);

let currentAccount, timer;

// Logout timer
const logOutTimer = function () {
  // Set time in seconds
  let time = 120;
  function tick() {
    let minutes = String(Math.trunc(time / 60)).padStart(2, 0);

    let sec = `${time % 60}`.padStart(2, 0);
    time--;
    // console.log(`${minutes} : ${sec}`);
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    labelTimer.textContent = `${minutes} : ${sec}`;
  }
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// FAKE LOGIN FOR DEV PURPOSES
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 1;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    el => inputLoginUsername.value === el.username
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    //
    // logOutTimer

    if (timer) clearInterval(timer);
    timer = logOutTimer();
    // Create current date and time

    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const day = `${now.getDate()}`.padStart(2, 0);
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    user => inputTransferTo.value === user.username
  );

  inputTransferTo.value = inputTransferAmount.value = '';

  console.log(amount, receiverAcc);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    console.log('Transfer Valid');

    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // push transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset The Timer
    clearInterval(timer);
    timer = logOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // add movement
      currentAccount.movements.push(amount);

      // push transfer Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI

      updateUI(currentAccount);

      // Reset The Timer
      clearInterval(timer);
      timer = logOutTimer();

      // Clear input
      inputLoanAmount.value = '';
    }, 2500);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  let acc = inputCloseUsername.value;
  let pin = Number(inputClosePin.value);
  if (acc === currentAccount.username && pin === currentAccount.pin) {
    const index = accounts.findIndex(user => user.username === acc);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});
/////////////////////////////////////////////////
