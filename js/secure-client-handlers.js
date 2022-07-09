/**
 * Take the current values from the createSecureMessageForm form
 * and set them to the page state. Set submit button state based
 * on the state of the form.
 * @param {*} sc
 */
const handleCreateFormEvent = (sc = null) => {
    const state = getCreatePageState(sc);
    const keys = Object.keys(state);
    keys.forEach((key) => {
        if (typeof sc.state.pages.create.data[key] !== 'undefined') {
            sc.state.pages.create.data[key] = state[key];
        }
    });
    if (!sc.state.worker.encrypting) {
        if (sc.state.pages.create.data.encryptionKey && sc.state.pages.create.data.messageText) {
            enableButton(sc.dom.forms.create.buttons.generateMessage, 'Generate secure message');
        } else {
            disableButton(sc.dom.forms.create.buttons.generateMessage, 'Enter an encryption key and message text');
        }
    } else {
        disableButton(sc.dom.forms.create.buttons.generateMessage, 'Securing message...');
    }
};

/**
 * Handles the response of the web worker decryptData() method.
 * Updates the DOM and re-enables the viewMessageButton button.
 * @param {*} sc
 * @param {*} data
 * @param {*} status
 * @param {*} message
 */
const handleDecryptedDataWorkerResponse = (sc = null, data = {}, status = 200, message = '') => {
    if (status === 200) {
        const {
            messageText,
            messageType,
            timestamp,
        } = data;
        switch (messageType) {
            default:
                // Text.
                let html = '';
                html += '<p>';
                html += '<small>';
                html += `${ new Date(timestamp).toLocaleString() }`;
                html += '</small>';
                html += '<br />';
                html += '<br />';
                html += `${ messageText }`;
                html += '</p>';
                sc.dom.forms.read.nodes.decryptedMessage.innerHTML = html;
                break;
        }
    } else {
        let html = '';
        html += '<p>';
        html += `${ message }`;
        html += '</p>';
        sc.dom.forms.read.nodes.decryptedMessage.innerHTML = html;
    }
    enableButton(sc.dom.forms.read.buttons.viewMessage, 'View secure message');
};

/**
 * Handles the response of the web worker encryptData() method.
 * Updates the DOM and re-enables the generateMessageButton button.
 * @param {*} sc
 * @param {*} data
 * @param {*} status
 * @param {*} message
 */
const handleEncryptedDataWorkerResponse = (sc = null, data = {}, status = 200, message = '') => {
    const {
        encryptedMessage,
        pow,
    } = data;
    const {
        difficulty,
        hash,
        prefix,
    } = pow;
    if (pow && status === 200 && difficulty && encryptedMessage && hash && prefix && hash.substring(0, difficulty) === prefix) {
        let html = '';
        html += '<pre>';
        html += JSON.stringify(data);
        html += '</pre>';
        sc.dom.forms.create.nodes.encryptedMessage.innerHTML = html;
    } else {
        sc.dom.forms.create.nodes.encryptedMessage.innerHTML = data.message || 'Error: Failed to secure message. Please try again.';
    }
    enableButton(sc.dom.forms.create.buttons.generateMessage, 'Generate secure message');
};

/**
 * Handle when the generateMessageButton button is clicked.
 * Calls the web worker encryptData() method.
 * Sets the generateMessageButton button to disabled.
 * @param {*} sc
 */
const handleGenerateMessage = (sc = null) => {
    sc.state.pages.create.data.timestamp = new Date().getTime();
    const currentState = getCreatePageState(sc);
    const {
        encryptionKey,
        messageText,
        messageType,
        timestamp,
    } = currentState;
    if (encryptionKey && messageType && timestamp) {
        const key = `${ timestamp }-${encryptionKey}`;
        if (!sc.state.worker.encrypting) {
            sc.state.worker.encrypting = true;
            disableButton(sc.dom.forms.create.buttons.generateMessage, 'Securing message...');
            sc.dom.forms.create.nodes.encryptedMessage.innerHTML = 'Generating secure message... This might take a few seconds.';
            sc.worker.postMessage(
                {
                    cmd: 'encryptData',
                    data: {
                        encryptionKey: key,
                        messageText,
                        messageType,
                        timestamp,
                    }
                }
            );
        }
    }
};

/**
 * Handle when the viewMessageButton button is clicked.
 * Calls the web worker decryptData() method.
 * Sets the viewMessageButton button to disabled.
 * @param {*} sc
 */
const handleViewMessage = (sc = null) => {
    const currentState = getReadPageState(sc);
    const {
        decryptionKey,
        secureMessage,
    } = currentState;
    if (decryptionKey && secureMessage) {
        if (!sc.state.worker.decrypting) {
            sc.state.worker.decrypting = true;
            disableButton(sc.dom.forms.read.buttons.viewMessage, 'Decrypting message...');
            sc.dom.forms.read.nodes.decryptedMessage.innerHTML = 'Decrypting secure message... This might take a few seconds.';
            sc.worker.postMessage(
                {
                    cmd: 'decryptData',
                    data: {
                        decryptionKey,
                        secureMessage,
                    }
                }
            );
        }
    }
};

/**
 * Handles all messages received from the web worker thread
 * and routes them to the appropriate main thread method.
 * @param {*} sc
 * @param {*} messageData
 */
const handleWorkerResponse = (sc = null, messageData = {}) => {
    const {
        cmd,
        data,
        message,
        status,
    } = messageData;
    switch (cmd) {
        case 'decryptData':
            sc.state.worker.decrypting = false;
            handleDecryptedDataWorkerResponse(sc, data, status, message);
            break;
        case 'encryptData':
            sc.state.worker.encrypting = false;
            handleEncryptedDataWorkerResponse(sc, data, status, message);
            break;
        default:
            // console.log(cmd, data, status);
            break;
    }
};