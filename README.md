# MarketIn SDK

A lightweight JavaScript SDK for tracking website activities, affiliate links, and conversions.

[![Version](https://img.shields.io/npm/v/marketin-sdk.svg)](https://npmjs.org/package/marketin-sdk)
[![jsDelivr](https://data.jsdelivr.com/v1/package/gh/ayg3/sdk/badge)](https://www.jsdelivr.com/package/gh/ayg3/sdk)

## Features

- 🔗 **Affiliate Link Tracking** - Track clicks and attribute conversions
- 📊 **Page View Analytics** - Comprehensive page visit tracking
- 💰 **Conversion Tracking** - Track sales, subscriptions, and custom events
- 🍪 **Session Management** - Persistent user sessions with cookies
- 🎯 **UTM Parameter Support** - Automatic UTM parameter extraction
- 🔒 **Privacy Compliant** - GDPR and privacy-friendly implementation
- ⚡ **Lightweight** - Minified version under 10KB
- 🌐 **CDN Ready** - Available via jsDelivr

## Installation

### Via CDN (Recommended)

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/gh/ayg3/sdk@latest/marketin-sdk.min.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/gh/ayg3/sdk@1.0.1/marketin-sdk.min.js"></script>
```

### Via NPM

```bash
npm install marketin-sdk
```

### Self-hosted

Download `marketin-sdk.min.js` and host it on your server:

```html
<script src="/path/to/marketin-sdk.min.js"></script>
```

## Quick Start

```javascript
// Initialize the SDK
MarketIn.init({
    brandId: 'your-brand-id',
    debug: false // Set to true for development
});

// Track a conversion
MarketIn.trackConversion({
    eventType: 'purchase',
    value: 99.99,
    currency: 'USD',
    productId: 'product-123'
});
```

## API Reference

### Initialization

```javascript
MarketIn.init(options)
```

**Options:**
- `brandId` (required): Your brand identifier
- `campaignId` (optional): Default campaign ID
- `debug` (optional): Enable debug logging (default: false)
- `apiEndpoint` (optional): Custom API endpoint

### Page View Tracking

```javascript
MarketIn.trackPageView(options)
```

Automatically tracks page views with comprehensive data including:
- URL and referrer
- Screen resolution and language
- UTM parameters
- Session information

**Options (all optional):**
- `url`: Page URL (default: current URL)
- `referrer`: Referrer URL (default: document.referrer)
- `sessionId`: Session identifier
- `campaignId`, `affiliateId`, `brandId`: Override defaults

### Affiliate Click Tracking

```javascript
MarketIn.trackAffiliateClick({
    affiliateId: 'affiliate-123',
    campaignId: 'campaign-456',
    productId: 'product-789', // optional
    clickId: 'unique-click-id' // optional, auto-generated if not provided
})
```

Tracks initial affiliate clicks for attribution. Automatically called when URL contains affiliate parameters (`aid`, `cid`).

### Conversion Tracking

```javascript
MarketIn.trackConversion({
    eventType: 'purchase',
    value: 99.99,
    currency: 'USD',
    productId: 'product-123',
    conversionRef: 'order-456', // optional, for deduplication
    metadata: { // optional
        orderId: 'order-456',
        customerType: 'returning'
    }
})
```

**Event Types:**
- `purchase` - Product purchase
- `subscription_created` - New subscription
- `subscription_renewed` - Subscription renewal
- `lead` - Lead generation
- `signup` - User registration
- Custom event types supported

### Subscription Tracking

```javascript
MarketIn.trackConversion({
    eventType: 'subscription_created',
    value: 29.99,
    currency: 'USD',
    subscriptionId: 'sub-123',
    planId: 'plan-premium',
    interval: 'monthly',
    recurringAmount: 29.99,
    subscriptionStatus: 'active'
})
```

### Page Data Crawling

```javascript
MarketIn.crawlPageData()
```

Automatically extracts product information from pages with `data-marketin-product` attributes:

```html
<div data-marketin-product="product-123" 
     data-marketin-product-name="Premium Widget"
     data-marketin-product-price="99.99"
     data-marketin-product-category="Electronics">
    Product content...
</div>
```

### URL Parameters

The SDK automatically recognizes these URL parameters:

**Short form (recommended):**
- `aid` - Affiliate ID
- `cid` - Campaign ID  
- `pid` - Product ID
- `mi_click` - Click ID for deduplication

**Legacy form:**
- `affiliate_id` - Affiliate ID
- `campaign_id` - Campaign ID
- `product_id` - Product ID

**UTM Parameters:**
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

### Utility Methods

```javascript
// Get SDK status and configuration
const status = MarketIn.getStatus();
console.log(status.version); // "1.0.1"
console.log(status.initialized); // true/false
```

## Configuration

### Default Configuration

```javascript
{
    apiEndpoint: 'https://api.marketin.now/api/v1/',
    debug: true,
    sessionId: null, // Auto-generated
    affiliateId: null,
    campaignId: null,
    brandId: null
}
```

### Debug Mode

Enable debug mode to see detailed logging:

```javascript
MarketIn.init({
    brandId: 'your-brand-id',
    debug: true
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- IE 11+ (with polyfills)

## Privacy & GDPR

The SDK is designed to be privacy-compliant:
- No personally identifiable information is collected by default
- Uses first-party cookies only
- Respects Do Not Track headers
- Session data is not persistent across browser sessions

## Error Handling

The SDK includes comprehensive error handling:
- Failed API requests are logged but don't throw errors
- Invalid parameters are validated with helpful warnings
- Network failures are handled gracefully

## Development

```bash
# Clone the repository
git clone https://github.com/ayg3/sdk.git
cd sdk

# No build process required - edit the source files directly
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.1
- Initial release
- Basic tracking functionality
- Affiliate link support
- Conversion tracking
- Page view analytics

## Support

- 📧 Email: support@marketin.now
- 📖 Documentation: [https://docs.marketin.now](https://docs.marketin.now)
- 🐛 Issues: [GitHub Issues](https://github.com/ayg3/sdk/issues)

---

Made with ❤️ by the MarketIn team