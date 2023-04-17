Array.random = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

let test = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(Array.random(test));