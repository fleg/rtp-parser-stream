'use strict';

var expect = require('expect.js'),
	RtpParserStream = require('../index'),
	packet = require('./fixtures/packet'),
	Readable = require('stream').Readable,
	inherits = require('util').inherits;

function RtpSourceStream(total) {
	Readable.call(this);

	this._total = total;
	this._current = 0;
}
inherits(RtpSourceStream, Readable);

RtpSourceStream.prototype._read = function() {
	this.push(this._current++ < this._total ? packet.raw : null);
};

describe('RtpParserStream test', function() {
	it('call RtpParserStream without new', function() {
		var rtpParser = RtpParserStream();
		expect(rtpParser).to.be.a(RtpParserStream);
	});

	it('should transform packets to objects', function(done) {
		var count = 0,
			total = 10,
			source = new RtpSourceStream(total),
			rtpParser = new RtpParserStream({objectMode: true});

		rtpParser.on('end', function() {
			expect(count).to.equal(total);
			done();
		});

		rtpParser.on('data', function(data) {
			count++;
			expect(data).to.be.an('object');
			expect(data.version).to.equal(packet.parsed.version);
			expect(data.padding).to.equal(packet.parsed.padding);
			expect(data.extension).to.equal(packet.parsed.extension);
			expect(data.csrcCount).to.equal(packet.parsed.csrcCount);
			expect(data.marker).to.equal(packet.parsed.marker);
			expect(data.payloadType).to.equal(packet.parsed.payloadType);
			expect(data.sequenceNumber).to.equal(packet.parsed.sequenceNumber);
			expect(data.timestamp).to.equal(packet.parsed.timestamp);
			expect(data.ssrc).to.equal(packet.parsed.ssrc);
			expect(data.payload.toString('hex'))
				.to.equal(packet.parsed.payload.toString('hex'));
		});

		source.pipe(rtpParser);
	});

	it('should transform packets to payload buffers', function(done) {
		var count = 0,
			total = 10,
			source = new RtpSourceStream(total),
			rtpParser = new RtpParserStream({objectMode: false});

		rtpParser.on('end', function() {
			expect(count).to.equal(total);
			done();
		});

		rtpParser.on('data', function(data) {
			count++;
			expect(data.toString('hex'))
				.to.equal(packet.parsed.payload.toString('hex'));
		});

		source.pipe(rtpParser);
	});

	it('should emit error', function(done) {
		var rtpParser = new RtpParserStream();

		rtpParser.on('error', function(err) {
			expect(err).to.be.ok();
			done()
		});

		rtpParser.write(new Buffer('deadbeef'));
	});
});
