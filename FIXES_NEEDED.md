# 🔧 FIXES NEEDED

## Issues Reported:
1. ❌ Menu not opening
2. ❌ Download not downloading in correct format
3. ❌ "Available offline" not working

---

## Root Causes & Fixes:

### Issue 1: Menu Not Opening
**Cause:** The `setMenuOpen(null)` in onClick handlers might be interfering
**Status:** Menu toggle logic looks correct - need to test

### Issue 2: Download Not Working Properly
**Cause:** Download function uses `downloadFile` from hook which gets data from IndexedDB
**Fix Needed:** Ensure proper file type and extension preservation

### Issue 3: Offline Toggle Not Working  
**Cause:** `toggleOffline` function from hook needs to update IndexedDB
**Fix Needed:** Verify the function is properly updating the database

---

## Quick Fixes to Apply:

1. **Remove duplicate `setMenuOpen(null)` calls** - They're already in the handler functions
2. **Fix download to preserve file format**
3. **Ensure offline toggle updates database**

Let me apply these fixes now...
