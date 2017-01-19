const EaseNumbers = (() => {
	const VO = {
		value: 0,
		target: 0,
		easing: 0,
		setValue(v) {
			this.target = v;
		}
	};

	const _numbers = [];
	let _numbersLength;

	function addNew(mValue = 0, mEasing = 0.1) {
		const numVo = Object.assign({}, VO);
		numVo.value = mValue;
		numVo.target = mValue;
		numVo.easing = mEasing;
		_numbers.push(numVo);
		_numbersLength = _numbers.length;
		return numVo;
	}

	function update() {
		for (let i = 0; i < _numbersLength; i++) {
			_numbers[i].value += (_numbers[i].target - _numbers[i].value) * _numbers[i].easing;
		}
	}

	return {
		addNew,
		update
	};
})();

export default EaseNumbers