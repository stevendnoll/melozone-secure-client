(() => {
    try {
        // Secure Client object.
        const sc = {
            dom: {
                forms: {
                    create: {
                        buttons: {
                            generateMessage: null,
                        },
                        fields: {
                            blurMessage: null,
                            encryptionKey: null,
                            fileMessage: null,
                            messageText: null,
                            noBlurMessage: null,
                            textMessage: null,
                        },
                        nodes: {
                            encryptedMessage: null,
                        },
                    },
                    read: {
                        buttons: {
                            viewMessage: null,
                        },
                        fields: {
                            decryptionKey: null,
                            secureMessage: null,
                        },
                        nodes: {
                            clearMessage: null,
                            decryptedMessage: null,
                        },
                    },
                },
                nodes: {
                    body: document.querySelector('#secureClientBody') || null,
                    headerMenu: document.querySelector('#secureClientHeaderMenu') || null,
                },
            },
            state: {
                page: 'home',
                pages: {
                    create: {
                        data: {
                            blurMessage: true,
                            encryptionKey: '',
                            messageText: '',
                            messageType: 'text',
                            nonce: 0,
                            pow: '',
                            timestamp: 0,
                        },
                    },
                },
                worker: {
                    decrypting: false,
                    encrypting: false,
                },
            },
            worker: new Worker('js/secure-client-web-worker.js'),
        };

        // Event listeners.

        sc.worker.addEventListener('message', function(e) {
            handleWorkerResponse(sc, e.data);
        }, false);

        window.addEventListener('hashchange', () => {
            const scPage = location.hash.split('#').join('');
            sc.state.page = scPage;
            loadPage(sc);
        });

        // Set hash onload.
        let scHash = 'home';
        if (location.hash) {
            scHash = location.hash.split('#').join('');
        }
        sc.state.page = scHash;

        // Load page.
        loadPage(sc);
    } catch (err) {
        console.log('Secure client exception.');
        console.log(err);
    }
})();