
module.exports = buff => {
	if (typeof buff === 'string' && buff.charCodeAt(0) === 0xFEFF) {
		return buff.slice(1);
	}

	if (Buffer.isBuffer(buff) && buff[0] === 0xEF && buff[1] === 0xBB && buff[2] === 0xBF) {
		return buff.slice(3);
	}

	return buff;
};