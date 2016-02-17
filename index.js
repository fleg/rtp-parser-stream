'user strict';

var parseRtpPacket = require('rtp-parser').parseRtpPacket,
	inherits = require('util').inherits,
	Transform = require('stream').Transform;

function RtpParserStream(options) {
	if (!(this instanceof RtpParserStream)) {
		return new RtpParserStream(options);
	}

	options = options || {};
	options.objectMode = Boolean(options.objectMode);
	this._options = options;

	Transform.call(this, options);
}
inherits(RtpParserStream, Transform);

RtpParserStream.prototype._transform = function(chunk, enc, callback) {
	var parsed;
	try {
		parsed = parseRtpPacket(chunk);
		this.push(this._options.objectMode ? parsed : parsed.payload);
		callback();
	} catch(err) {
		callback(err);
	}
};

module.exports = RtpParserStream;
