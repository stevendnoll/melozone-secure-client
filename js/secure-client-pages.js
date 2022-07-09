const DEFAULT_MESSAGE_TEXT = 'Please enter a message and an encryption key, then click the "Generate Secure Message" button.';
const GENERATING_MESSAGE_TEXT = 'Generating secure message... This might take a few seconds.';

/**
 * The Create page.
 * @param {*} sc
 */
const createMessagePage = (sc = null) => {
    const currentState = JSON.parse(JSON.stringify(sc.state.pages.create.data));
    let html = '';
    html += '<h1>Create Secure Message</h1>';
    html += '<p>Use the form below to create a new secure message.</p>';
    html += '<form name="createSecureMessageForm" id="createSecureMessageForm" class="secure-form" method="post" onsubmit="return false;">';
    // Message type.
    html += '<h3>Message Type</h3>';
    switch (currentState.messageType) {
        default:
            html += '<div class="form-row">';
            // Text message.
            html += '<div class="form-cell" title="Text message">';
            html += '<input type="radio" id="textMessage" name="messageType" value="text" class="radio-field" checked>';
            html += '<label for="textMessage">Text</label>';
            html += '</div>';
            // File message (coming soon).
            html += '<div class="form-cell" title="Coming Soon - Binary file message (picture, video, document, etc.)">';
            html += '<input type="radio" id="fileMessage" name="messageType" value="file" class="radio-field" disabled="disabled">';
            html += '<label for="fileMessage">File (coming soon)</label>';
            html += '</div>';
            html += '</div>';
            break;
    }

    // Message blur.
    html += '<h3>Blur Message</h3>';
    html += '<div class="form-row">';
    // Blur message.
    html += '<div class="form-cell" title="Blur message">';
    if (currentState.blurMessage) {
        html += '<input type="radio" id="blurMessage" name="messageBlur" value="blur" class="radio-field" checked>';
    } else {
        html += '<input type="radio" id="blurMessage" name="messageBlur" value="blur" class="radio-field">';
    }
    html += '<label for="blurMessage">Blur</label>';
    html += '</div>';
    // No blur.
    html += '<div class="form-cell" title="No blur">';
    if (currentState.blurMessage) {
        html += '<input type="radio" id="noBlurMessage" name="messageBlur" value="noBlur" class="radio-field">';
    } else {
        html += '<input type="radio" id="noBlurMessage" name="messageBlur" value="noBlur" class="radio-field" checked>';
    }
    html += '<label for="noBlurMessage">No blur</label>';
    html += '</div>';
    html += '</div>';

    // Encryption key field.
    html += '<h3>Encryption Key <span class="required">*</span></h3>';
    html += '<div class="form-row">';
    html += `<input type="password" id="encryptionKey" name="encryptionKey" class="input-field" title="Encryption key" value="${ currentState.encryptionKey }" />`;
    html += '</div>';
    html += '<p>The encryption key will be required to decrypt/read the secure message.</p>';

    // Message text field.
    html += '<h3>Message Text <span class="required">*</span></h3>';
    html += '<div class="form-row">';
    if (currentState.blurMessage) {
        html += `<textarea id="messageText" name="messageText" class="textarea-field hide-text" title="Text message">${ currentState.messageText }</textarea>`;
    } else {
        html += `<textarea id="messageText" name="messageText" class="textarea-field" title="Text message">${ currentState.messageText }</textarea>`;
    }
    html += '</div>';

    html += '<br />';
    html += '<p>';
    html += '<span class="required">*</span> denotes a required field';
    html += '</p>';

    // Generate message button.
    html += '<div class="form-row">';
    if (!sc.state.worker.encrypting) {
        if (currentState.encryptionKey && currentState.messageText) {
            html += '<input id="generateMessageButton" type="submit" type="button" class="submit-button" value="Generate Secure Message" title="Generate secure message" />';
        } else {
            html += '<input id="generateMessageButton" type="submit" type="button" class="submit-button" value="Generate Secure Message" title="Enter an encryption key and message text" disabled="true" />';
        }
    } else {
        html += '<input id="generateMessageButton" type="submit" type="button" class="submit-button" value="Generate Secure Message" title="Securing message..." disabled="true" />';
    }
    html += '</div>';

    // End form.
    html += '</form>';
    html += '<br />';

    // Secure message panel.
    html += '<h3>Secure Message</h3>';
    html += `<div id="encryptedMessage" class="encrypted-text">${ DEFAULT_MESSAGE_TEXT }</div>`;
    html += '<br />';
    html += '<div id="copyMessageDiv">';
    html += '<a href="javascript:void(0);" id="copyMessageLink" title="Copy to Clipboard">Copy to Clipboard</a>';
    html += '</div>';

    // Render HTML.
    headerMenu(sc);
    printStr(sc.dom.nodes.body, html, false, true);

    // Select DOM nodes.
    sc.dom.forms.create.fields.blurMessage = document.querySelector('#blurMessage') || null;
    sc.dom.forms.create.fields.encryptionKey = document.querySelector('#encryptionKey') || null;
    sc.dom.forms.create.fields.fileMessage = document.querySelector('#fileMessage') || null;
    sc.dom.forms.create.fields.messageText = document.querySelector('#messageText') || null;
    sc.dom.forms.create.fields.textMessage = document.querySelector('#textMessage') || null;
    sc.dom.forms.create.fields.noBlurMessage = document.querySelector('#noBlurMessage') || null;
    sc.dom.forms.create.nodes.copyMessageLink = document.querySelector('#copyMessageLink') || null;
    sc.dom.forms.create.nodes.encryptedMessage = document.querySelector('#encryptedMessage') || null;
    sc.dom.forms.create.buttons.generateMessage = document.querySelector('#generateMessageButton') || null;

    // Event handlers.

    sc.dom.forms.create.fields.encryptionKey.addEventListener('keyup', () => {
        handleCreateFormEvent(sc);
    });

    sc.dom.forms.create.fields.messageText.addEventListener('keyup', () => {
        handleCreateFormEvent(sc);
    });

    sc.dom.forms.create.fields.fileMessage.addEventListener('change', () => {
        handleCreateFormEvent(sc);
        createMessagePage(sc);
    });

    sc.dom.forms.create.fields.textMessage.addEventListener('change', () => {
        handleCreateFormEvent(sc);
        createMessagePage(sc);
    });

    sc.dom.forms.create.fields.blurMessage.addEventListener('change', () => {
        handleCreateFormEvent(sc);
        sc.dom.forms.create.fields.messageText.classList.add('hide-text');
    });

    sc.dom.forms.create.fields.noBlurMessage.addEventListener('change', () => {
        handleCreateFormEvent(sc);
        sc.dom.forms.create.fields.messageText.classList.remove('hide-text');
    });

    sc.dom.forms.create.buttons.generateMessage.addEventListener('click', () => {
        handleGenerateMessage(sc);
    });

    sc.dom.forms.create.nodes.copyMessageLink.addEventListener('click', () => {
        let html = sc.dom.forms.create.nodes.encryptedMessage.innerHTML;
        if (html && html !== DEFAULT_MESSAGE_TEXT && html !== GENERATING_MESSAGE_TEXT) {
            try {
                html = html.substring(5);
                html = html.substring(0, html.length - 6);
                navigator.clipboard
                .writeText(html)
                .then(() => {
                    // Copied to clipboard.
                    sc.dom.forms.create.nodes.copyMessageLink.innerHTML = 'Copied';
                    setTimeout(() => {
                        sc.dom.forms.create.nodes.copyMessageLink.innerHTML = 'Copy to Clipboard';
                    }, 1000);
                })
                .catch(() => {
                    console.log('Failed to copy to clipboard.');
                });
            } catch (err) {
                // console.log(`${ err.message }`);
            }
        }
    });
};

/**
 * A generic error page.
 * @param {*} sc
 * @param {*} message
 */
const errorPage = (sc = null, message = '') => {
    headerMenu(sc);
    let html = '';
    html += '<h2>Error</h2>';
    html += '<p>';
    html += message;
    html += '</p>';
    printStr(sc.dom.nodes.body, html, false, true);
};

/**
 * The Home page.
 * @param {*} sc
 */
const homePage = (sc = null) => {
    let html = '';
    html += '<h1>Home</h1>';
    html += '<h2>Introduction</h2>';
    html += '<p>The Melozone Secure Client is a free open-source JavaScript web client that lets users generate secure encrypted messages locally on their devices. It also provides a means to decrypt and read the secure messages.</p>';
    html += '<p>A proof-of-work hash is provided with each secure message to ensure the original message is never modified.</p>';
    html += '<h2>Usage</h2>';
    html += '<p>Use the <b>Create</b> tab to generate a secure message. Use the <b>Read</b> tab to view a secure message.</p>';
    html += '<h2>Technical Details</h2>';
    html += '<h3>Serverless</h3>';
    html += '<p>The source code for the Melozone Secure Client does not include any server-side functionality. All encryption and decryption is done locally on your device.</p>';
    html += '<h3>No Recovery</h3>';
    html += '<p>For security reasons, there is no way to recover an encryption key once it is lost or forgotten. The onus is on you, the user, to keep track of your encryption keys.</p>';
    html += '<h3>Communication</h3>';
    html += '<p>The Melozone Secure Client does not provide any means of sharing the secure messages you generate. Because the messages are encrypted on your device and include a verifiable proof-of-work hash, you should feel comfortable sharing the secure encrypted messages via existing communication channels (email, chat, text, etc.).</p>';
    html += '<p>Anyone who wishes to view one of your secure messages will need to know the encryption key you used when the message was created (you can assign a unique encryption key to each message, or you can re-use the same encryption key on multiple messages).</p>';
    html += '<h4>Alice, Bob, and Joe</h4>';
    html += '<p>Let us assume Alice wants to communicate securely with Bob and Joe individually. In this case, Alice should use a different encryption key when generating messages for Bob than she does when generating messages for Joe.</p>';
    html += '<p>Now let us assume Alice wants to generate a message for both Bob and Joe. In this case, Alice would use a new encryption key that she could share with both Bob and Joe.</p>';
    html += '<p>Following those scenarios, Alice would have to keep track of three encryption keys. Key 1 would be between Alice and Bob. Key 2 would be between Alice and Joe, and Key 3 would be between all three (Alice, Bob, and Joe all know Key 3).</p>';
    headerMenu(sc);
    printStr(sc.dom.nodes.body, html, false, true);
};

/**
 * The Read page.
 * @param {*} sc
 */
const readMessagePage = (sc = null) => {
    const setButtonState = () => {
        if (sc.dom.forms.read.fields.decryptionKey.value && sc.dom.forms.read.fields.secureMessage.value) {
            sc.dom.forms.read.buttons.viewMessage.disabled = false;
        } else {
            sc.dom.forms.read.buttons.viewMessage.disabled = true;
        }
    };

    let html = '';
    html += '<h1>Read Secure Message</h1>';
    html += '<p>Read a secure message.</p>';
    html += '<form name="readSecureMessageForm" id="readSecureMessageForm" class="secure-form" method="post" onsubmit="return false;">';

    // Encrypted message field.
    html += '<h3>Encrypted Message <span class="required">*</span></h3>';
    html += '<div class="form-row">';
    html += '<textarea id="secureMessage" name="secureMessage" class="textarea-field" title="Secure message"></textarea>';
    html += '</div>';
    html += '<br />';
    html += '<div>';
    html += '<a href="javascript:void(0);" id="pasteMessageLink" title="Paste from Clipboard">Paste from Clipboard</a>';
    html += '</div>';

    // Decryption key field.
    html += '<h3>Decryption Key <span class="required">*</span></h3>';
    html += '<div class="form-row">';
    html += '<input type="password" id="decryptionKey" name="decryptionKey" class="input-field" title="Decryption key" />';
    html += '</div>';

    html += '<br />';
    html += '<p>';
    html += '<span class="required">*</span> denotes a required field';
    html += '</p>';

    // View message button.
    html += '<div class="form-row">';
    html += '<input id="viewMessageButton" type="submit" type="button" class="submit-button" value="View Secure Message" title="Enter an encrypted message and a decryption key" disabled="true" />';
    html += '</div>';

    // End form.
    html += '</form>';
    html += '<br />';

    // Secure message panel.
    html += '<h3>Secure Message</h3>';
    html += '<div id="decryptedMessage" class="decrypted-text">Please enter an encrypted message and a decryption key, then click the "View Secure Message" button.</div>';
    html += '<br />';
    html += '<div>';
    html += '<a href="javascript:void(0);" id="clearMessageLink" title="Clear message from screen">Clear Message</a>';
    html += '</div>';
    headerMenu(sc);
    printStr(sc.dom.nodes.body, html, false, true);

    // Select DOM nodes.
    sc.dom.forms.read.fields.decryptionKey = document.querySelector('#decryptionKey') || null;
    sc.dom.forms.read.fields.secureMessage = document.querySelector('#secureMessage') || null;
    sc.dom.forms.read.nodes.clearMessage = document.querySelector('#clearMessageLink') || null;
    sc.dom.forms.read.nodes.decryptedMessage = document.querySelector('#decryptedMessage') || null;
    sc.dom.forms.read.nodes.pasteMessageLink = document.querySelector('#pasteMessageLink') || null;
    sc.dom.forms.read.buttons.viewMessage = document.querySelector('#viewMessageButton') || null;

    // Event handlers.

    sc.dom.forms.read.fields.decryptionKey.addEventListener('keyup', () => {
        setButtonState();
    });

    sc.dom.forms.read.fields.secureMessage.addEventListener('keyup', () => {
        setButtonState();
    });

    sc.dom.forms.read.buttons.viewMessage.addEventListener('click', () => {
        handleViewMessage(sc);
    });

    sc.dom.forms.read.nodes.clearMessage.addEventListener('click', () => {
        let html = '';
        html += 'Please enter an encrypted message and a decryption key, then click the "View Secure Message" button.';
        sc.dom.forms.read.nodes.decryptedMessage.innerHTML = html;
    });

    sc.dom.forms.read.nodes.pasteMessageLink.addEventListener('click', () => {
        navigator.clipboard
            .readText()
            .then((val) => {
                if (val) {
                    sc.dom.forms.read.fields.secureMessage.value = val;
                    setButtonState();
                }
            })
            .catch(() => {
                // console.log('Failed to read from clipboard.');
            });
    });
};

/**
 * Loads the appropriate page.
 * @param {*} sc
 */
const loadPage = (sc = null) => {
    try {
        switch (sc.state.page) {
            case 'create':
                createMessagePage(sc);
                break;
            case 'read':
                readMessagePage(sc);
                break;
            default:
                homePage(sc);
                break;
        }
    } catch (err) {
        errorPage(sc, err.message);
    }
};