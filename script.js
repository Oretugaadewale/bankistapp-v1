'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

// always pass the data into a function
// The sort is false by default
const displayMovement = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
   <div class="movements__row">
     <div class="movements__type 
       movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__value">${mov}</div>
   </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//show or computing total balance both credit and debit
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};
// Amount in or adding all positive no together

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  //amount out
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  // interest given by bank on deposit
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    // you get interest when you deposit is 1
    .filter((int, i, arr) => {
      console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

//computing username or create username eg js or jd or stw
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);
console.log(accounts);

const updateUi = function (acc) {
  //display movement
  displayMovement(acc.movements);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  calcDisplaySummary(acc);
};
//events Handler
// for username login

//we just define the variable
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent from submiting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display ui message
    labelWelcome.textContent = `welcome back,
     ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    //Clear input field, so that the password and username wont be seen
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //update UI
    updateUi(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  // to eraze the input field once amount is been posted on it
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    // To check if receiver acct does not exist.
    receiverAcc?.username !== currentAccount.username
  ) {
    // console.log(`transfer valid`);
    //sender acct should be debited
    //doing the transfer
    currentAccount.movements.push(-amount);
    //receiver to be credited
    receiverAcc.movements.push(amount);

    //update ui
    updateUi(currentAccount);
  }
});

// To request loan using some method
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // add movement
    currentAccount.movements.push(amount);

    //update UI
    updateUi(currentAccount);
  }
  //
  inputLoanAmount.value = '';
});

// to delete account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // indexOf(23)

    //delete account splice enabled us to do so
    accounts.splice(index, 1);

    //hide ui once account is deleted
    containerApp.style.opacity = 0;
  }
  // To clear input field generally
  // to clear the field on the close account value
  inputCloseUsername.value = inputClosePin = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovement(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/*
/////////////////////////////////////////////////
// slice
let arr = ['a', 'b', 'c', 'd', 'e'];
console.log(arr.slice(2));// will show c d e
console.log(arr.slice(2, 4)); // will be c d it wont pick the last item in the array which is the e
console.log(arr.slice(-2)); it start to count from 1 from the back
console.log(arr.slice(-1));
console.log(arr.slice(1, -2));
console.log(arr.slice()); // to create a shallow copy
console.log(...arr); // to create same shallow copy

//splice
//it mutate the array
arr.splice(-1); it remove the last number just like slice
console.log(arr);
arr.splice(1, 2); position the delete 2 elements
console.log(arr);

//reverse
// it mutate the array it means to change the array
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

//concat it dosent mutate the array
you can either you the spread ope or concat
const letters = arr.concat(arr2);
console.log(letters);
console.log(...arr, ...arr2);

//join
console.log(letters.join('-'));

//at method
const arr3 = [23, 11, 64];
console.log(arr[0]);
console.log(arr.at(0));
console.log('jonas'.at(1)); it also works on strings

// getting last array element
console.log(arr[arr.length - 1]);
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));

console.log('jonas'.at(0));
console.log('jonas'.at(-1));
*/

/*
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// looping array for of
// the abs means absolute value
// for (const movement of movements) {
  / the i in square bracket means index while movement means value
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`movement ${i + 1}:you deposited ${movement}`);
  } else {
    console.log(`movement ${i + 1}:you withdraw ${Math.abs(movement)}`);
  }
}

// looping array forEach
//in foreach loop continue and break dosent work inside it
console.log(`----forEach---`);
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`movement ${i + 1}:you deposited ${mov}`);
  } else {
    console.log(`movement ${i + 1}:you withdraw ${Math.abs(mov)}`);
  }
});

//personal example
let arr = ['a', 'b', 'c', 'd', 'e'];

arr.forEach(function (item, index, arr) {
  console.log(item, index);
});
*/
/*
//using foreach with map
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

//using foreach in set
//set dosent have key and index
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);
currenciesUnique.forEach(function (value, _, map) {
  console.log(`${value}: ${value}`);
});
*/

/*

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const eurToUsd = 1.1;
// map will return another array as the for of loop
const movementUSD = movements.map(function (mov) {
  return mov * eurToUsd;
});
console.log(movements);
console.log(movementUSD);

//looping into an empty array using for of loop
const movementsUSDfor = [];
for (const mov of movements) movementsUSDfor.push(mov * eurToUsd);
console.log(movementsUSDfor);

// coding challenge using map with arrow function
const newMovement = movements.map(movements => movements * eurToUsd);
console.log(newMovement);

//no side effect
const movementDescription = movements.map(
  (mov, i) =>
    `movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'}${Math.abs(
      mov
    )}`
);
console.log(movementDescription);

const move = [];
for (const mov of movements) if (mov > 0) move.push(mov);
console.log(move);

//  filter
const withdrawals = [200, 450, -400, 3000, -650, -130, 70, 1300];

const wit = withdrawals.filter(function (mov) {
  return mov < 0;
});
console.log(wit);
// You can also do it this way
const withs = [200, 450, -400, 3000, -650, -130, 70, 1300];
const withd = withs.filter(withs => withs < 0);
console.log(withd);

// reduce method
//accumulator -> SNOWBAL
//solution 1
// const balance = movements.reduce(function (acc, cur, i, arr) {
  //console.log(`iteration ${i}: ${acc}`);
//   return acc + cur;
// }, 0);
// console.log(balance);


//solution 2
const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);



//solution 3 using for of loop
let balance2 = 0;
for (const mov of movements) balance2 += mov;
console.log(balance2);

//maximum value
const checkMaxiNum = [200, 450, -400, 3000, -650, -130, 70, 1300];

const max = checkMaxiNum.reduce((acc, mov) => {
  //the accumulators is the value the current value is
  //the value the reduce method is adding eg the next
  if (acc > mov) return acc;
  else return mov;
}, checkMaxiNum[0]);
console.log(max);

const moveme = [
  { name: 'company one', category: 'finance', start: 1981, end: 2002 },
  { name: 'company two', category: 'finance', start: 1985, end: 2033 },
  { name: 'company three', category: 'retail', start: 1991, end: 2022 },
  { name: 'company four', category: 'sport', start: 2000, end: 2003 },
  { name: 'company five', category: 'retail', start: 2000, end: 2001 },
];

const num = [200, 450, 400, 3000, 650, 130, 70, 1300];
// const num2 = num.filter(function (num) {
//   return num < 0;
// });
// console.log(num2);

// moveme.forEach(function (movv) {
//   console.log(movv);
// });

const eightiesCompany = moveme.filter(
  eighties => eighties.start >= 1980 && eighties.start < 1990
);
console.log(eightiesCompany);

const companyeighty = moveme.filter(
  company => company.start >= 2000 && company.end < 2004
);

console.log(companyeighty);

const companyRetail = moveme.filter(function (company) {
  if (company.category === 'retail') {
    return true;
  }
});
console.log(companyRetail);

const companies = moveme.filter(company => company.category === 'retail');
console.log(companies);

const prices = [];
for (let i = 0; i < num.length; i++) {
  if (num[i] >= 200) {
    prices.push(num[i]);
  }
}
console.log(prices);

const lowPrice = num.filter(function (score) {
  return score <= 200;
});
console.log(lowPrice);

let price = num.filter(num => num <= 200);
console.log(price);

// The magic channing
//adding all deposit together form eurToUsd
// let eurToUsd = 1.1;
console.log(movements);
//pipeline
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map((mov, i, arr) => {
    return mov * eurToUsd;
  })
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDepositsUSD);
*/
// const money = accounts.filter(acct => acct.owner === 'Jessica Davis');
// console.log(money);

//find
// const account = accounts.find(acct => acct.owner === 'Jessica Davis');
// console.log(account);

// remeber we have the movement array up
//1, To check all depost sum
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((acc, cur) => acc + cur, 0);
console.log(bankDepositSum);

//2. to check no of 1k deposit
//first way of solving it
// const numDeposit1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(acc => acc >= 1000).length;
// console.log(numDeposit1000);

//second way to solve it
const numDeposit1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0);
console.log(numDeposit1000);
//prefix example to understand ++ operator
let a = 10;
console.log(++a);
console.log(a);

//3
// doing the same thing as no 2 but putting it in an object
// we use destructuring
const { deposits, withdrawls } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawls += cur);
      // here we use bracket notation
      sums[cur > 0 ? 'deposits' : 'withdrawls'] += cur;
      return sums;
    },
    { deposits: 0, withdrawls: 0 }
  );
console.log(deposits, withdrawls);

// 4.
// this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  const capitzalize = str => str[0].toUpperCase() + str.slice(1);
  //words that are not to be capitalized
  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitzalize(word)))
    .join(' ');

  return capitzalize(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));

//step1
const letsdoTitleCase = function (capletter) {
  //step 2
  const remove = ['this', 'is', 'but'];
  //step 3
  const titlecap = capletter
    .toLowerCase()
    .split(' ')
    // step 4
    .map(word =>
      remove.includes(word) ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join(' ');
  return titlecap;
};
console.log(letsdoTitleCase(`the boy is good`));

/*
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

//the i in square bracket means index while movement means value
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`movement ${i + 1}:you deposited ${movement}`);
  } else {
    console.log(`movement ${i + 1}:you withdraw ${Math.abs(movement)}`);
  }
}*/

// movements.forEach(function (mov, i) {
//   if (mov > 0) {
//     console.log(`you have made ${i + 1} deposited ${mov}`);
//   } else {
//     console.log(`you have ${i + 1} withdraw ${Math.abs(mov)}`);
//   }
// });

// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesUnique);
// currenciesUnique.forEach(function (value, _) {
//   console.log(`${value}: ${value}`);
// });
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const euroToUsd = 1.1;

const movementUSD = [];

for (const move of movements) movementUSD.push(move * euroToUsd);
console.log(movementUSD);

const weMove = movements.map(mov => mov * euroToUsd);
console.log(weMove);

const movementDescription = movements.map(
  (mov, i) =>
    `movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'}${Math.abs(
      mov
    )}`
);
console.log(movementDescription);

// some method
console.log(movements);

//Equality
console.log(movements.includes(-130));

// Condition
console.log(movements.some(mov => mov === -130));
const anyDeposit = movements.some(mov => mov > 0);
console.log(anyDeposit);

//Every
console.log(movements.every(mov => mov > 0));
console.log(account4.movements.every(mov => mov > 0));

//seperate call back
// dry principle
const deposit = mov => mov > 0;
console.log(movements.some(deposit));
console.log(movements.every(deposit));
console.log(movements.filter(deposit));

//flat method
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat());

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat(2));

//flat
const overalBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance);

//flatmap
const overalBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance2);

///////////////////////////////////////
// Sorting Arrays
//it mutate the array
// sort dosent work with number and strings
// Strings
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners);

// Numbers
console.log(movements);

// return < 0, A, B (keep order)
// return > 0, B, A (switch order)

// Ascending
// movements.sort((a, b) => {
// a and b is called current value
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
//it wil bring negative
movements.sort((a, b) => a - b);
console.log(movements);

// Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
// it will bring positive
movements.sort((a, b) => b - a);
console.log(movements);

/*
///////////////////////////////////////
// More Ways of Creating and Filling Arrays
const arr = [1, 2, 3, 4, 5, 6, 7];
console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// Emprty arrays + fill method
const x = new Array(7);
console.log(x);
// console.log(x.map(() => 5));
//it means to add 1 from the index of 3 to 5
x.fill(1, 3, 5);
x.fill(1);
console.log(x);

//it means to add 23 from the index of 2 to 6
arr.fill(23, 2, 6);
console.log(arr);

// Array.from
const y = Array.from({ length: 7 }, () => 1);
console.log(y);

const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
});
*/
