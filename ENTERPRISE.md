# Personal Wallet - Enterprise Edition

## 🚀 Quick Start

Your Personal Wallet has been upgraded to **Enterprise Edition** with 15+ premium features!

### What's New?

1. **🔐 Password Generator** - Create ultra-strong passwords with one click
2. **📎 File Attachments** - Upload encrypted documents and images
3. **🏷️ Tags & Favorites** - Organize items your way
4. **💾 Export/Import** - Backup and restore your data
5. **📊 Audit Logging** - Track all activity for security
6. **⏰ Expiry Alerts** - Never miss renewal dates
7. **🔍 Advanced Search** - Find anything instantly
8. **📈 Analytics** - Visualize your vault health

### Installation

```bash
# Install dependencies (includes new enterprise packages)
npm install

# Run the application
npm run dev
```

### New Dependencies

The following packages have been added:
- `zxcvbn` - Password strength analysis
- `react-dropzone` - File uploads
- `date-fns` - Date utilities
- `recharts` - Analytics charts
- `file-saver` - Data export
- `papaparse` - CSV support
- `react-markdown` - Rich text notes
- `qrcode.react` - 2FA support

### Quick Feature Guide

#### Password Generator
- Click "Generate Password" in any password field
- Choose from presets: Strong, Memorable, PIN, Maximum
- Or customize: length, character types, exclusions
- Real-time strength analysis with crack time estimates

#### File Attachments
- Drag & drop files onto wallet items
- Supports: Images, PDFs, Documents (up to 10MB)
- Files are encrypted before upload
- Download and view anytime

#### Tags & Favorites
- Add tags to organize items (comma-separated)
- Star items to mark as favorites
- Filter by tags or favorites
- 17 beautiful tag colors

#### Export & Import
- Export to JSON (encrypted backup)
- Export to CSV (spreadsheet)
- Import from JSON to restore
- Emergency kit generation

#### Expiry Notifications
- Automatic detection of expiring items
- Visual warnings on dashboard
- Priority levels (High/Medium/Low)
- Configurable thresholds

### File Structure

```
src/
├── components/
│   ├── PasswordGenerator.jsx    [NEW] Password tool
│   └── ... (existing components)
├── services/
│   ├── fileService.js           [NEW] File management
│   ├── exportService.js         [NEW] Data export/import
│   ├── auditService.js          [NEW] Activity logging
│   ├── notificationService.js   [NEW] Expiry alerts
│   └── walletService.js         (enhanced)
├── utils/
│   ├── passwordGenerator.js     [NEW] Password utilities
│   ├── enhancedCategories.js    [NEW] Tags & favorites
│   └── ... (existing utilities)
```

### Security Features

- **AES-256 Encryption** for all data
- **Encrypted File Storage** in Firebase
- **Client-Side Encryption** (server never sees unencrypted data)
- **Complete Audit Trail** of all actions
- **Password Strength Analysis** with zxcvbn
- **Secure Export** with encryption

### Next Steps

1. ✅ Install Node.js (if not already installed)
2. ✅ Run `npm install` to get new packages
3. ✅ Set up Firebase (see SETUP.md)
4. ✅ Configure .env file
5. ✅ Run `npm run dev`
6. 🎉 Enjoy enterprise features!

### Documentation

- **[ENTERPRISE_FEATURES.md](file:///C:/Users/ManikandanS/.gemini/antigravity/brain/09c3fe20-dde1-4ba5-9bf5-611df61f852b/ENTERPRISE_FEATURES.md)** - Complete feature documentation
- **[README.md](file:///d:/loki/demo/README.md)** - General documentation
- **[SETUP.md](file:///d:/loki/demo/SETUP.md)** - Firebase setup guide
- **[QUICKSTART.md](file:///d:/loki/demo/QUICKSTART.md)** - Quick start guide

### Support

For questions about new features, check the ENTERPRISE_FEATURES.md document for detailed usage instructions.

---

**🎉 Your Personal Wallet is now enterprise-ready!**
