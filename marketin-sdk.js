/**
 * MarketIn SDK
 * A JavaScript SDK for tracking website activities and affiliate links
 * Version: 1.0.1
 * GitHub: https://github.com/yourusername/marketin-sdk
 */

(function(window) {
    'use strict';

    // Configuration
    const config = {
        apiEndpoint: 'https://api.marketin.now/api/v1/',
        // apiEndpoint: 'http://localhost:8000/api/v1',
        debug: true,
        sessionId: null,
        affiliateId: null,
        campaignId: null,
        brandId: null // To be generated on the main API and passed by brand owners.. brand owners will have pass this in the init method of the SDK
    };

    // Utility functions
    const utils = {
        generateUUID: () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        getQueryParam: (param) => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        },

        // Basic cookie helpers for idempotency tokens
        setCookie: (name, value, days = 30) => {
            try {
                const expires = new Date(Date.now() + days * 864e5).toUTCString();
                let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
                if (window.location.protocol === 'https:') {
                    cookie += '; Secure';
                }
                document.cookie = cookie;
            } catch (_) {}
        },
        getCookie: (name) => {
            try {
                const cookies = document.cookie ? document.cookie.split('; ') : [];
                for (const c of cookies) {
                    const [k, v] = c.split('=');
                    if (k === name) return decodeURIComponent(v || '');
                }
            } catch (_) {}
            return null;
        },

        log: (message = '') => {
            if (config.debug) {
                console.log(`[MarketIn SDK] ${message}`);
            }
        }
    };

    // Core SDK functionality
    const MarketIn = {
        init: (options = {}) => {
            // Merge options with default config
            Object.assign(config, options);
            // Normalize common option keys
            if (options.campaignId && !config.campaignId) {
                config.campaignId = options.campaignId;
            }
            if (options.brandId) {
                config.brandId = options.brandId;
            }
            
            // Generate session ID if not provided
            if (!config.sessionId) {
                config.sessionId = utils.generateUUID();
            }

            // Check for affiliate + campaign + product IDs in URL
            // New short params (preferred): aid, cid, pid
            // Legacy long params still supported: affiliate_id, campaign_id, product_id
            const affiliateId = utils.getQueryParam('aid') || utils.getQueryParam('affiliate_id');
            const campaignId = utils.getQueryParam('cid') || utils.getQueryParam('campaign_id');
            const productId = utils.getQueryParam('pid') || utils.getQueryParam('product_id');
            if (affiliateId && campaignId) {
                config.affiliateId = affiliateId;
                config.campaignId = campaignId;
                const clickId = utils.getQueryParam('mi_click');
                // Call with options object (positional still supported inside the method)
                MarketIn.trackAffiliateClick({ affiliateId, campaignId, productId, clickId, referrer: document.referrer, landingUrl: window.location.href });
            }

            // Track page view
            MarketIn.trackPageView();
            

            utils.log('SDK initialized');
        },

        /**
         * Logs a page view on the brand site. Logs analytics; does NOT (re)assign attribution.
         * Prefer calling on every page load. Reads any stored attribution context (campaign/affiliate) from config.
         * Properties (all optional, SDK auto-fills when omitted):
         * - url: string (default window.location.href)
         * - referrer: string (default document.referrer)
         * - sessionId: string (default config.sessionId)
         * - timestamp: string ISO (default new Date().toISOString())
         * - userAgent: string (default navigator.userAgent)
         * - screenResolution: string WxH (default window.screen.width x window.screen.height)
         * - language: string (default navigator.language)
         * - pageTitle: string (default document.title)
         * - utmSource, utmMedium, utmCampaign, utmTerm, utmContent: strings (auto-read from query)
         * - campaignId, affiliateId, brandId: strings/numbers (default from config)
         */
        trackPageView: (options = {}) => {
            const data = {
                url: options.url || window.location.href,
                referrer: options.referrer || document.referrer,
                sessionId: options.sessionId || config.sessionId,
                timestamp: options.timestamp || new Date().toISOString(),
                userAgent: options.userAgent || navigator.userAgent,
                screenResolution: options.screenResolution || `${window.screen.width}x${window.screen.height}`,
                language: options.language || navigator.language,
                pageTitle: options.pageTitle || document.title,
                utmSource: options.utmSource ?? utils.getQueryParam('utm_source'),
                utmMedium: options.utmMedium ?? utils.getQueryParam('utm_medium'),
                utmCampaign: options.utmCampaign ?? utils.getQueryParam('utm_campaign'),
                utmTerm: options.utmTerm ?? utils.getQueryParam('utm_term'),
                utmContent: options.utmContent ?? utils.getQueryParam('utm_content'),
                campaignId: options.campaignId ?? config.campaignId ?? utils.getQueryParam('cid') ?? utils.getQueryParam('campaign_id'),
                affiliateId: options.affiliateId ?? config.affiliateId ?? utils.getQueryParam('aid') ?? utils.getQueryParam('affiliate_id'),
                brandId: options.brandId ?? config.brandId
            };
            console.log("log activity data", data)
            MarketIn.sendToAPI('log-activity', data);
        },

        /**
         * Logs the initial affiliate click/landing. Low-volume, attribution-establishing event.
         * Call once when the user lands with referral params (ideally via server redirect).
         *
         * Required:
         * - affiliateId: string|number
         * - campaignId: string|number
         *
         * Optional:
         * - productId: string|number
         * - clickId: string (idempotency key if available)
         * - referrer: string (defaults to document.referrer)
         * - landingUrl: string (defaults to window.location.href)
         * - timestamp: string ISO (default now)
         * - userAgent: string (default navigator.userAgent)
         */
        trackAffiliateClick: (arg1, arg2) => {
            try {
                // Backward compatibility: (affiliateId, campaignId)
                const options = (typeof arg1 === 'object') ? arg1 : { affiliateId: arg1, campaignId: arg2 };

                const { affiliateId, campaignId } = options;
                if (!affiliateId || !campaignId) {
                    utils.log('trackAffiliateClick requires both affiliateId and campaignId');
                    return;
                }

                // Update config context
                config.affiliateId = config.affiliateId || affiliateId;
                config.campaignId = config.campaignId || campaignId;

                // Generate or reuse a clickId for idempotency (URL -> cookie -> UUID)
                const existingCookieClickId = utils.getCookie('mi_click');
                const derivedClickId = options.clickId || utils.getQueryParam('mi_click') || existingCookieClickId || utils.generateUUID();
                // Persist clickId in cookie if not already stored
                if (!existingCookieClickId && derivedClickId) {
                    utils.setCookie('mi_click', derivedClickId, 30);
                }

                const data = {
                    affiliateId: options.affiliateId,
                    campaignId: options.campaignId,
                    productId: options.productId || undefined,
                    clickId: derivedClickId || undefined,
                    referrer: options.referrer || document.referrer,
                    url: options.landingUrl || window.location.href,
                    sessionId: config.sessionId,
                    timestamp: options.timestamp || new Date().toISOString(),
                    userAgent: options.userAgent || navigator.userAgent
                };

                console.log("affiliate click data from sdk:", data)
                MarketIn.sendToAPI('log-affiliate-click', data);
                utils.log(`Affiliate click tracked: ${affiliateId}`);
            } catch (error) {
                utils.log(`Failed to track affiliate click: ${error.message}`);
            }
        },

        
        sendToAPI: (endpoint, data) => {
            try {
                const url = `${config.apiEndpoint}/${endpoint}/`;
                const headers = {
                    'Content-Type': 'application/json',
                    'X-MarketIn-SDK': '1.0.1'
                };

                // Add optional headers if available
                if (config.campaignId) {
                    headers['X-CAMPAIGN-ID'] = config.campaignId;
                }
                if (config.brandId) {
                    headers['X-BRAND-ID'] = config.brandId;
                }

                utils.log(`Sending request to: ${url}`);

                fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(response => {
                    utils.log(`API Success: ${JSON.stringify(response)}`);
                })
                .catch(error => {
                    utils.log(`API Error: ${error.message}`);
                });
                
            } catch (error) {
                utils.log(`Failed to send API request: ${error.message}`);
            }
        },

        // Method to crawl page data
        crawlPageData: () => {
            try {
                utils.log("Starting page data crawl");
                
                const data = {
                    url: window.location.href,
                    title: document.title,
                    meta: {
                        description: document.querySelector('meta[name="description"]')?.content || '',
                        keywords: document.querySelector('meta[name="keywords"]')?.content || ''
                    },
                    products: Array.from(document.querySelectorAll('[data-marketin-product]')).map(el => ({
                        id: el.dataset.marketinProduct,
                        name: el.dataset.marketinProductName || '',
                        price: el.dataset.marketinProductPrice || '0',
                        category: el.dataset.marketinProductCategory || ''
                    }))
                };
                
                utils.log(`Found ${data.products.length} products to crawl`);
                if (data.products.length > 0) {
                    utils.log(`Product names: ${data.products.map(p => p.name).join(', ')}`);
                }

                MarketIn.sendToAPI('crawl-data', data);
                
            } catch (error) {
                utils.log(`Failed to crawl page data: ${error.message}`);
            }
        },

        // Track a conversion event and attribute to affiliate via tracking IDs
        trackConversion: ({ eventType, value = 0, currency = 'USD', conversionRef, productId, metadata = {}, subscriptionId, periodNumber, planId, interval, recurringAmount, subscriptionStatus } = {}) => {
            try {
                if (!config.campaignId || !config.affiliateId) {
                    utils.log('Conversion skipped: missing campaignId or affiliateId');
                    return;
                }

                const isSubscription = typeof eventType === 'string' && eventType.startsWith('subscription');
                if (!isSubscription && !productId) {
                    utils.log('Conversion aborted: productId is required for non-subscription events');
                    return;
                }

                // Basic de-duplication: prevent same (sessionId,eventType) from being sent repeatedly
                const dedupeKey = `mi_conv_${config.sessionId}_${eventType}`;
                const lastRef = window.localStorage.getItem(dedupeKey);
                if (lastRef && lastRef === conversionRef) {
                    utils.log(`Duplicate conversion ignored for event: ${eventType}`);
                    return;
                }

                // Default productId from URL if not provided
                const resolvedProductId = productId || utils.getQueryParam('pid') || utils.getQueryParam('product_id');

                const payload = {
                    campaignId: parseInt(config.campaignId),
                    affiliateId: parseInt(config.affiliateId),
                    sessionId: config.sessionId,
                    eventType,
                    value,
                    currency,
                    conversionRef: conversionRef || utils.generateUUID()
                };
                // attach productId if provided (required by server)
                if (resolvedProductId) payload.productId = resolvedProductId;
                // Subscription helper: map high-level args into metadata for backend
                if (eventType && eventType.startsWith('subscription')) {
                    payload.metadata = Object.assign({}, metadata, {
                        subscriptionId,
                        periodNumber,
                        planId,
                        interval,
                        recurringAmount,
                        subscriptionStatus
                    });
                } else if (Object.keys(metadata).length) {
                    payload.metadata = metadata;
                }

                // If no token is provided, SDK uses the public proxy endpoint
                const conversionEndpoint = config.token ? 'log-conversion' : 'sdk-log-conversion';

                MarketIn.sendToAPI(conversionEndpoint, payload);
                window.localStorage.setItem(dedupeKey, payload.conversionRef);
                utils.log(`Conversion tracked: ${eventType} ${value} ${currency}`);
            } catch (error) {
                utils.log(`Failed to track conversion: ${error.message}`);
            }
        },

        // Get SDK status and configuration
        getStatus: () => {
            return {
                version: '1.0.1',
                config: { ...config },
                sessionId: config.sessionId,
                initialized: !!config.sessionId
            };
        }
    };

    // Expose SDK to window object
    window.MarketIn = MarketIn;

})(window);