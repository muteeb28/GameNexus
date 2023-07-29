// https://medium.com/@nthgergo/writing-third-party-javascript-2808a8d85a0a

(function(window) {
    var appId = document.getElementById('raaftScript').src.split('appId=')[1];

    var raaft = {
        mask: null,
        modal: null,
        appId: appId,
        flowId: null,
        subscriptionId: null,
        authKey: null,
        customer: {
            email: null,
            name: null,
            photo: null
        },
        customData: null,
        settings: {
            zIndex: 100,
            spinnerColor: null,
            demoMode: false,
            stopOutterClick: false
        },
        onComplete: null,

        init: function init(config) {
            this.authKey = config.authKey ? config.authKey : this.authKey;
            this.appId = config.appId ? config.appId : this.appId;
            this.flowId = config.flowId ? config.flowId : this.flowId;
            this.subscriptionId = config.subscriptionId ? config.subscriptionId : this.subscriptionId;
            this.customer = config.customer ? config.customer : this.customer;
            if (config.settings) {
                this.settings.zIndex = config.settings.zIndex ? config.settings.zIndex : this.settings.zIndex;
                this.settings.spinnerColor = config.settings.spinnerColor ? config.settings.spinnerColor : this.settings.spinnerColor;
                this.settings.demoMode = typeof config.settings.demoMode !== 'undefined' ? config.settings.demoMode : this.settings.demoMode;
                this.settings.stopOutterClick = typeof config.settings.stopOutterClick !== 'undefined' ? config.settings.stopOutterClick : this.settings.stopOutterClick;
            }
            this.onComplete = config.onComplete ? config.onComplete : this.onComplete;
            this.customData = config.customData ? config.customData : this.customData;
        },

        processQueue: function processQueue() {
            var _this = this;

            var queuedCalls = window.raaft.q || [];

            queuedCalls.forEach(function(call) {
                _this.callMethod(call[0], call[1]);
            });
        },

        callMethod: function callMethod(name, args) {
            var fn = this[name];
            if (typeof fn == 'function') {
                fn.call(this, args);
            } else {
                throw new Error(name + 'is not a function');
            }
        },

        processMessage: function processMessage(message) {
            const executeMessageAction = function() {
                switch (message.action) {
                    case 'CLOSE_MODAL':
                        document.body.removeChild(this.mask);
                        document.body.removeChild(this.modal);
                        break;
                    case 'REFRESH_PAGE':
                        window.location.reload();
                        break;
                    case 'CUSTOM_LINK':
                        window.location.href = message.link;
                        break;
                    default:
                        break;
                }
            }.bind(this);

            if (this.onComplete instanceof Function) {
                let retVal;
                try {
                    retVal = this.onComplete(message.outcome);
                } catch (e) {
                    console.log('Error occurred executing onComplete function.', e);
                }

                if (retVal instanceof Promise) {
                    return retVal
                        .then(function() {
                            return executeMessageAction();
                        })
                        .catch(function(e) {
                            console.log('Error occurred in onComplete promise.', e);
                            return executeMessageAction();
                        });
                }
            }
            executeMessageAction();
        },

        _getAppPath: function _getAppPath() {
            var appPath;
            try {
                var scriptPath = document.getElementsByTagName('script')['raaftScript'].src;
                scriptPath = scriptPath.replace('//', '##');
                scriptPath = scriptPath.split('/')[0];
                appPath = scriptPath.replace('##', '//');
            } catch (e) {
                appPath = 'https://app.raaft.io';
            }
            return appPath + '/widget.html';
        },

        startCancelFlow: function startCancelFlow(config) {
            try {
                if (config) this.init(config);

                var iframe = document.createElement('iframe');

                var queryArray = [];
                if (this.authKey) { queryArray.push('authorization_key=' + this.authKey); }
                if (this.appId) { queryArray.push('app_id=' + this.appId); }
                if (this.flowId) { queryArray.push('flow_id=' + this.flowId); }
                if (this.subscriptionId) { queryArray.push('subscription_id=' + this.subscriptionId); }
                if (this.customer.name) { queryArray.push('customer_name=' + encodeURIComponent(this.customer.name)); }
                if (this.customer.email) { queryArray.push('customer_email=' + encodeURIComponent(this.customer.email)); }
                if (this.customer.photo) { queryArray.push('customer_photo=' + encodeURIComponent(this.customer.photo)); }
                if (this.settings.spinnerColor) { queryArray.push('spinner_color=' + encodeURIComponent(this.settings.spinnerColor)); }
                if (this.settings.demoMode) { queryArray.push('demo_mode=' + encodeURIComponent(this.settings.demoMode)); }
                if (this.settings.stopOutterClick) { queryArray.push('stop_click=' + encodeURIComponent(this.settings.stopOutterClick)); }
                if (this.customData) { queryArray.push('customData=' + encodeURIComponent(JSON.stringify(this.customData))); }

                iframe.src = this._getAppPath() + '#/?' + queryArray.join('&');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = '0';
                iframe.style.borderRadius = '3px';

                this.mask = document.createElement('div');
                this.mask.style.position = 'fixed';
                this.mask.style.top = '0';
                this.mask.style.right = '0';
                this.mask.style.bottom = '0';
                this.mask.style.left = '0';
                this.mask.style.backgroundColor = 'grey';
                this.mask.style.opacity = '.5';
                this.mask.style.zIndex = this.settings.zIndex;

                var modalZIndex = this.settings.zIndex + 1;
                this.modal = document.createElement('div');
                this.modal.style.position = 'fixed';
                this.modal.style.width = '100%';
                this.modal.style.height = '100%';
                this.modal.style.top = '0';
                this.modal.style.bottom = '0';
                this.modal.style.left = '0';
                this.modal.style.right = '0';
                this.modal.style.zIndex = modalZIndex;

                this.modal.appendChild(iframe);
                document.body.appendChild(this.mask);
                document.body.appendChild(this.modal);
            } catch (e) {
                var xhttp = new XMLHttpRequest();
                xhttp.open('GET', 'https://app.raaft.io/trouble?' + e.message, true);
                xhttp.send();
            }
        }
    };

    // process any calls that occurred before we loaded the library
    raaft.processQueue();

    // swap the queueing code for calls to the actual object.
    window.raaft = function() {
        raaft.callMethod(arguments[0], arguments[1]);
    };

    window.addEventListener('message', receiveMessage, false);

    function receiveMessage(event) {
        if (event.origin.indexOf('raaft') !== -1 || event.origin.indexOf('localhost') !== -1) {
            raaft.processMessage(event.data);
            return;
        }
        // throw new Error('did not process message because event.origin was not recognized: ' + event.origin);
    }
})(window);
