const clearInnerHTML = (node = null) => {
    node.innerHTML = '';
};

const disableButton = (node = null, title = '') => {
    node.disabled = true;
    if (title) {
        node.title = title;
    }
};

const enableButton = (node = null, title = '') => {
    node.disabled = false;
    if (title) {
        node.title = title;
    }
};

const escapeHtml = (html = '') => {
    var text = document.createTextNode(html);
    var p = document.createElement('p');
    p.appendChild(text);
    return p.innerHTML;
};

const getCreatePageState = (sc = null) => {
    const state = {
        blurMessage: sc.dom.forms.create.fields.blurMessage.checked || false,
        encryptionKey: sc.dom.forms.create.fields.encryptionKey.value || '',
        messageText: sc.dom.forms.create.fields.messageText.value || '',
        messageType: sc.state.pages.create.data.messageType || 'text',
        timestamp: sc.state.pages.create.data.timestamp || 0,
    };
    return state;
};

const getReadPageState = (sc = null) => {
    const state = {
        decryptionKey: sc.dom.forms.read.fields.decryptionKey.value || '',
        secureMessage: sc.dom.forms.read.fields.secureMessage.value || '',
    };
    return state;
};

const printStr = (target = null, str = '', escape = true, clear = false) => {
    if (target && str) {
        if (escape) {
            str = escapeHtml(str);
        }
        if (!clear) {
            target.innerHTML += str;
        } else {
            target.innerHTML = str;
        }
    }
};