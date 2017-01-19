// EaseNumber.js

import Scheduler from './Scheduler';

class EaseNumber {
	constructor(mValue, mEasing=0.1) {
		this.easing       = mEasing;
		this._value       = mValue;
		this._targetValue = mValue;
		Scheduler.addEF( ()=> this._update());		
	}


	_update() {
		this._checkLimit();
		this._value += (this._targetValue - this._value) * this.easing;	
	}

	setTo(mValue) {
		this._targetValue = this._value = mValue;
	}


	add(mAdd) {
		this._targetValue += mAdd;
	}

	limit(mMin, mMax, loop = false) {
		if(mMin > mMax) {
			this.limit(mMax, mMin);
			return;
		}

		this._loop = loop
		this._min = mMin;
		this._max = mMax;

		this._checkLimit();
	}


	_checkLimit() {
		if(this._min !== undefined && this._targetValue < this._min) {
			if(this._loop){
				this._targetValue = this._max;
			}else{
				this._targetValue = this._min;
			}
		} 

		if(this._max !== undefined && this._targetValue > this._max) {
			if(this._loop){
				this._targetValue = this._min;
			}else{
				this._targetValue = this._max;
			}
		} 
	}


	//	GETTERS / SETTERS

	set value(mValue) {
		this._targetValue = mValue;
	}

	get value() {
		return this._value;
	}

	get targetValue() {
		return this._targetValue;
	}

}


export default EaseNumber;