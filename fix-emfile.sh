#!/bin/bash

echo "🔧 Fixing EMFILE error for macOS..."

# Method 1: Temporarily increase file limits
echo "Increasing file limits..."
ulimit -n 4096

# Method 2: Permanent fix (requires sudo)
echo ""
echo "For permanent fix, run this command with sudo:"
echo "echo 'kern.maxfiles=524288' | sudo tee -a /etc/sysctl.conf"
echo "echo 'kern.maxfilesperproc=524288' | sudo tee -a /etc/sysctl.conf"
echo "sudo sysctl -p"
echo ""

# Method 3: Create launchd override
echo "Create /Library/LaunchDaemons/limit.maxfiles.plist with:"
cat << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>524288</string>
      <string>524288</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
EOF

echo ""
echo "For permanent fix:"
echo "1. Kill all Node processes: pkill -f node"
echo "2. Restart terminal"
echo "3. Run: ulimit -n 4096 && npx expo start"
echo ""
echo "✅ Run 'npx expo start' in a new terminal window"
