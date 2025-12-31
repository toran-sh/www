# Branding & Logo Setup

This document describes the branding assets and logo implementation for Toran.

## Logo Assets

### Source Logo
- **File**: `www/public/logo.png`
- **Dimensions**: 640x640 px
- **Format**: PNG with transparency (RGBA)
- **Design**: Blue geometric T-shape representing the Toran brand

### Generated Favicon Sizes

All favicons generated from the source logo:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 32x32 | Legacy browser favicon |
| `favicon-16x16.png` | 16x16 | Browser tab icon (small) |
| `favicon-32x32.png` | 32x32 | Browser tab icon (standard) |
| `apple-touch-icon.png` | 180x180 | iOS home screen icon |
| `android-chrome-192x192.png` | 192x192 | Android home screen icon |
| `android-chrome-512x512.png` | 512x512 | Android splash screen |

### Configuration Files

- **`site.webmanifest`**: PWA manifest for installable web app
- **`browserconfig.xml`**: Microsoft tile configuration

## Implementation

### HTML Meta Tags

The `www/index.html` includes comprehensive meta tags for:
- **Favicons**: Multiple sizes for different devices
- **Theme colors**: Brand color (#5eb8e1) for browser UI
- **Open Graph**: Social media preview cards
- **Twitter Cards**: Twitter-specific preview cards
- **PWA support**: Web app manifest and theme colors

### React Components

#### Layout Component
**File**: `www/src/components/Layout.tsx`

The header logo appears in the top-left corner:
```tsx
<img src="/logo.png" alt="Toran" className="logo-icon" />
```

**Styling** (`www/src/components/Layout.css`):
- Size: 2rem x 2rem (32x32px)
- Filter: Inverted to white to match header gradient
- Positioned with flexbox alongside "toran.dev" text

#### Login Page
**File**: `www/src/pages/Login.tsx`

The logo appears centered above the login form:
```tsx
<img src="/logo.png" alt="Toran Logo" className="login-logo" />
```

**Styling** (`www/src/pages/Login.css`):
- Size: 80x80px
- Animation: Fade-in with scale effect (0.5s)
- Centered with auto margins

## Brand Colors

### Primary Color
- **Hex**: `#5eb8e1`
- **RGB**: `94, 184, 225`
- **Usage**: Logo, theme color, header gradient

### Secondary Color
- **Hex**: Varies (gradient endpoint)
- **Usage**: Header gradient

### Theme Implementation
The blue logo color (#5eb8e1) is used throughout the app:
- Browser theme color (address bar on mobile)
- Header gradient
- Button styles
- Link colors

## PWA (Progressive Web App)

### Manifest (`site.webmanifest`)
```json
{
  "name": "Toran - API Gateway",
  "short_name": "Toran",
  "theme_color": "#5eb8e1",
  "background_color": "#ffffff",
  "display": "standalone",
  "icons": [192x192, 512x512]
}
```

### Features
- **Installable**: Can be added to home screen on mobile/desktop
- **Standalone**: Opens without browser UI when installed
- **Branded**: Uses logo for app icon
- **Themed**: Uses brand color for splash screen

## File Sizes

| File | Size |
|------|------|
| logo.png (640x640) | 242 KB |
| favicon-16x16.png | 1.5 KB |
| favicon-32x32.png | 2.1 KB |
| apple-touch-icon.png | 21 KB |
| android-chrome-192x192.png | 24 KB |
| android-chrome-512x512.png | 158 KB |
| favicon.ico | 2.1 KB |

**Total**: ~451 KB for all branding assets

## Browser Support

### Favicon Support
- ✅ Modern browsers: PNG favicons
- ✅ Legacy browsers: ICO favicon
- ✅ iOS Safari: Apple touch icon
- ✅ Android Chrome: Android chrome icons
- ✅ Windows: Microsoft tile

### PWA Support
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge
- ✅ Safari (iOS 11.3+)
- ✅ Firefox
- ✅ Samsung Internet

## SEO & Social Media

### Open Graph Tags
When shared on Facebook/LinkedIn:
- Shows logo as preview image
- Displays "Toran - API Gateway & Debugger" as title
- Shows description with feature highlights

### Twitter Cards
When shared on Twitter:
- Large image card format
- Logo as preview image
- Branded title and description

## Best Practices Implemented

1. ✅ **Multiple sizes**: Covers all device types and use cases
2. ✅ **Transparency**: PNG files support transparent backgrounds
3. ✅ **Optimization**: Appropriate file sizes for web delivery
4. ✅ **Consistency**: Same logo across all touchpoints
5. ✅ **Accessibility**: Alt text on all logo images
6. ✅ **Performance**: Lazy loading not needed (critical asset)
7. ✅ **PWA ready**: Manifest and icons for installable app
8. ✅ **SEO optimized**: Meta tags for social sharing

## Future Enhancements

Potential improvements:
- [ ] SVG version for scalability
- [ ] Dark mode logo variant
- [ ] Animated logo for loading states
- [ ] Favicon.ico with multiple sizes embedded
- [ ] WebP format for smaller file sizes
- [ ] Logo in different color schemes

## Updating the Logo

To update the logo in the future:

1. Replace `www/public/logo.png` with new 640x640 PNG
2. Regenerate favicons:
   ```bash
   cd www/public
   sips -z 16 16 logo.png --out favicon-16x16.png
   sips -z 32 32 logo.png --out favicon-32x32.png
   sips -z 180 180 logo.png --out apple-touch-icon.png
   sips -z 192 192 logo.png --out android-chrome-192x192.png
   sips -z 512 512 logo.png --out android-chrome-512x512.png
   cp favicon-32x32.png favicon.ico
   ```
3. Update theme color in:
   - `www/index.html` (meta tags)
   - `www/public/site.webmanifest`
   - `www/public/browserconfig.xml`
   - CSS custom properties if needed

## Verification

Check branding implementation:
```bash
# Verify all favicon files exist
ls -lh www/public/*.png www/public/*.ico

# Check HTML meta tags
grep -A 5 "favicon\|theme-color\|og:image" www/index.html

# Verify manifest
cat www/public/site.webmanifest
```

## Resources

- [Favicon Generator](https://realfavicongenerator.net/) - Online tool
- [PWA Manifest](https://web.dev/add-manifest/) - Web.dev guide
- [sips](https://ss64.com/osx/sips.html) - macOS image tool docs

---

**Last Updated**: 2025-12-31
**Logo Version**: 1.0
**Brand Color**: #5eb8e1
