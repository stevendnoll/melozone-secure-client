importScripts('../ext/crypto.js');

// Constants.
const NONCE_LIMIT = 1000000;
const POW_DIFFICULTY = 4;
const POW_PREFIX = '1111';
const SYSTEM_SALT = '1111OnlySystemsThatShareTheSameSaltCanExchangeSecureMessages1111';

// https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256-in-js
var sha256 = function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value>>>amount) | (value<<(32 - amount));
    };

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;


    var hash = sha256.h = sha256.h || [];
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
            k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
        }
    }

    ascii += '\x80'
    while (ascii[lengthProperty]%64 - 56) ascii += '\x00'
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j>>8) return;
        words[i>>2] |= j << ((3 - i)%4)*8;
    }
    words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
    words[words[lengthProperty]] = (asciiBitLength)

    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16);
        var oldHash = hash;
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            var w15 = w[i - 15], w2 = w[i - 2];

            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e&hash[5])^((~e)&hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10))
                    )|0
                );
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj

            hash = [(temp1 + temp2)|0].concat(hash);
            hash[4] = (hash[4] + temp1)|0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i])|0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i]>>(j*8))&255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

const checkPOW = (encryptedMessage = '', pow = {}) => {
    if (pow) {
        const {
            difficulty,
            hash,
            limit,
            nonce,
            prefix,
            timestamp,
        } = pow;
        if (hash && hash.substring(0, difficulty) === prefix) {
            const verify = sha256(`${ encryptedMessage }-${ SYSTEM_SALT }-${ difficulty }-${ prefix }-${ timestamp }-${ limit }-${ nonce }`);
            if (verify === hash) {
                return true;
            }
        }
    }
    return false;
};

const createPOW = (encryptedMessage = '', timestamp = 0) => {
    let nonce = 0;
    let pow = sha256(`${ encryptedMessage }-${ SYSTEM_SALT }-${ POW_DIFFICULTY }-${ POW_PREFIX }-${ timestamp }-${ NONCE_LIMIT }-${ nonce }`);
    while (nonce < NONCE_LIMIT && pow.substring(0, POW_DIFFICULTY) !== POW_PREFIX) {
        nonce += 1;
        pow = sha256(`${ encryptedMessage }-${ SYSTEM_SALT }-${ POW_DIFFICULTY }-${ POW_PREFIX }-${ timestamp }-${ NONCE_LIMIT }-${ nonce }`);
    }
    return {
        difficulty: POW_DIFFICULTY,
        hash: pow,
        limit: NONCE_LIMIT,
        nonce,
        prefix: POW_PREFIX,
        timestamp,
    };
};

const decryptData = (cmd = '', data = {}) => {
    const {
        decryptionKey,
        secureMessage,
    } = data;
    if (decryptionKey && secureMessage) {
        try {
            //
            const encryptedData = JSON.parse(secureMessage.trim());
            const {
                encryptedMessage,
                pow,
            } = encryptedData;
            if (checkPOW(encryptedMessage, pow)) {
                const {
                    timestamp,
                } = pow;
                const key = `${ timestamp }-${ decryptionKey }`;
                try {
                    // CryptoJS.AES.decrypt(encrypted, pin).toString(CryptoJS.enc.Utf8);
                    const decryptedString = CryptoJS.AES.decrypt(encryptedMessage, key).toString(CryptoJS.enc.Utf8);
                    if (decryptedString) {
                        //
                        const decryptedData = JSON.parse(decryptedString);
                        if (decryptedData && decryptedData.timestamp && decryptedData.timestamp === timestamp) {
                            const {
                                messageText,
                                messageType,
                            } = decryptedData;
                            switch (messageType) {
                                default:
                                    // Text.
                                    self.postMessage({
                                        cmd,
                                        data: {
                                            messageText,
                                            messageType,
                                            timestamp,
                                        },
                                        message: 'Decrypted message.',
                                        status: 200,
                                    });
                                    break;
                            }
                        } else {
                            self.postMessage({
                                cmd,
                                data: {},
                                message: 'Message timestamp error.',
                                status: 500,
                            });
                        }
                    } else {
                        self.postMessage({
                            cmd,
                            data: {},
                            message: 'Failed to decrypt message.',
                            status: 500,
                        });
                    }
                } catch (err) {
                    self.postMessage({
                        cmd,
                        data: {},
                        message: `Message decryption failed.`,
                        status: 500,
                    });
                }
            } else {
                self.postMessage({
                    cmd,
                    data: {},
                    message: 'POW check failed.',
                    status: 400,
                });
            }
        } catch (err) {
            self.postMessage({
                cmd,
                data: {},
                message: `Decryption failed. ${ err.message }`,
                status: 500,
            });
        }
    } else {
        self.postMessage({
            cmd,
            data: {},
            message: 'Missing required parameter.',
            status: 400,
        });
    }
};

const encryptData = (cmd = '', data = {}) => {
    const {
        encryptionKey,
        messageText,
        messageType,
        timestamp,
    } = data;
    switch (messageType) {
        default:
            // Text.
            if (encryptionKey && messageText && timestamp) {
                try {
                    const messageData = {
                        messageText,
                        messageType,
                        timestamp,
                    };
                    const encryptedMessage = CryptoJS.AES.encrypt(JSON.stringify(messageData), encryptionKey).toString();
                    const pow = createPOW(encryptedMessage, messageData.timestamp);
                    self.postMessage({
                        cmd,
                        data: {
                            encryptedMessage,
                            pow,
                        },
                        message: 'Encrypted message.',
                        status: 200,
                    });
                } catch (err) {
                    self.postMessage({
                        cmd,
                        data: {},
                        message: `${ err.message }`,
                        status: 500,
                    });
                }
            } else {
                self.postMessage({
                    cmd,
                    data: {},
                    message: 'Missing required parameter.',
                    status: 400,
                });
            }
            break;
    }
};

const testMethod = (data = {}) => {
    self.postMessage({
        cmd,
        data,
        status: 200,
    });
};

try {
    self.addEventListener('message', function(e) {
        const {
            cmd,
            data,
        } = e.data;
        switch (cmd) {
            case 'decryptData':
                decryptData(cmd, data);
                break;
            case 'encryptData':
                encryptData(cmd, data);
                break;
            default:
                testMethod(cmd, data);
                break;
        }
    }, false);
} catch (err) {
    self.postMessage({
        workerException: `${ err.message }`,
    });
}