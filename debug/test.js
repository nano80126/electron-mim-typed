// //
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { r30028, r30030, r30032 } = require('./src/json/hiper/errros');

// console.log(Buffer.from([0x00, 0x01]));
// console.log(new Buffer.from([0x00, 0x01]));

// const a = setTimeout(() => {
// 	console.log(123);
// }, 2000);

// const b = setInterval(() => {
// 	console.log(b);
// 	console.log(a.hasRef());
// 	if (a) {
// 		console.log('destoryed');
// 	}
// }, 3000);
const err = 0x00 + (0xff << 8) + (0x03 << 16) + (0x01 << 24);
let i = 0;
let msg;

console.time('start');

for (let bit = 0; bit < 32; bit++) {
	i++;
	if (((err >> bit) & 0x01) === 0b1) {
		msg += `${r30028[bit]}\n`;
		// console.log(bit, err >> bit, r30028[bit]);
	}
}

console.log(i);
console.log(msg);
console.log(err);

console.timeEnd('start');
